//
//  HybridTaskRepository.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import Foundation

/**
 * 混合模式任务仓库
 * 结合网络和本地存储，支持在线/离线无缝切换
 * 提供数据同步、冲突解决和离线队列功能
 */
class HybridTaskRepository: TaskRepository {
    private let networkRepository: NetworkTaskRepository
    private let localRepository: SwiftDataTaskRepository
    private let networkManager = NetworkManager.shared
    
    // 离线操作队列
    private var pendingOperations: [PendingOperation] = []
    private let operationsKey = "pending_operations"
    
    init(localRepository: SwiftDataTaskRepository) {
        self.networkRepository = NetworkTaskRepository()
        self.localRepository = localRepository
        
        loadPendingOperations()
        setupNetworkObserver()
    }
    
    // MARK: - TaskRepository协议实现
    
    func getAllTasks() async throws -> [Task] {
        if networkManager.isConnected {
            do {
                // 尝试从网络获取最新数据
                let networkTasks = try await networkRepository.getAllTasks()
                
                // 同步到本地存储
                try await syncToLocal(networkTasks)
                
                return networkTasks
            } catch {
                // 网络失败，降级到本地数据
                print("网络获取任务失败，使用本地数据: \(error)")
                return try await localRepository.getAllTasks()
            }
        } else {
            // 离线模式，使用本地数据
            return try await localRepository.getAllTasks()
        }
    }
    
    func getTask(byId id: String) async throws -> Task? {
        // 优先从本地获取（更快）
        if let localTask = try await localRepository.getTask(byId: id) {
            return localTask
        }
        
        // 本地没有且有网络连接时，尝试从网络获取
        if networkManager.isConnected {
            return try await networkRepository.getTask(byId: id)
        }
        
        return nil
    }
    
    func createTask(title: String, detail: String? = nil, dueDate: Date? = nil) async throws -> Task {
        // 立即创建本地任务
        let task = try await localRepository.createTask(title: title, detail: detail, dueDate: dueDate)
        
        if networkManager.isConnected {
            do {
                // 尝试同步到服务器
                _ = try await networkRepository.createTask(title: title, detail: detail, dueDate: dueDate)
            } catch {
                // 网络失败，添加到待同步队列
                let operation = PendingOperation(
                    type: .create,
                    taskId: task.id.storeIdentifier ?? "\(task.id)",
                    data: PendingOperationData(title: title, detail: detail, dueDate: dueDate)
                )
                addPendingOperation(operation)
            }
        } else {
            // 离线模式，添加到待同步队列
            let operation = PendingOperation(
                type: .create,
                taskId: task.id.storeIdentifier ?? "\(task.id)",
                data: PendingOperationData(title: title, detail: detail, dueDate: dueDate)
            )
            addPendingOperation(operation)
        }
        
        return task
    }
    
    func updateTask(_ task: Task) async throws {
        // 立即更新本地
        try await localRepository.updateTask(task)
        
        if networkManager.isConnected {
            do {
                // 尝试同步到服务器
                try await networkRepository.updateTask(task)
            } catch {
                // 网络失败，添加到待同步队列
                let operation = PendingOperation(
                    type: .update,
                    taskId: task.id.storeIdentifier ?? "\(task.id)",
                    data: PendingOperationData(
                        title: task.title,
                        detail: task.detail,
                        dueDate: task.dueDate,
                        isCompleted: task.isCompleted,
                        priority: task.priority
                    )
                )
                addPendingOperation(operation)
            }
        } else {
            // 离线模式，添加到待同步队列
            let operation = PendingOperation(
                type: .update,
                taskId: task.id.storeIdentifier ?? "\(task.id)",
                data: PendingOperationData(
                    title: task.title,
                    detail: task.detail,
                    dueDate: task.dueDate,
                    isCompleted: task.isCompleted,
                    priority: task.priority
                )
            )
            addPendingOperation(operation)
        }
    }
    
    func deleteTask(_ task: Task) async throws {
        // 立即从本地删除
        try await localRepository.deleteTask(task)
        
        if networkManager.isConnected {
            do {
                // 尝试从服务器删除
                try await networkRepository.deleteTask(task)
            } catch {
                // 网络失败，添加到待同步队列
                let operation = PendingOperation(
                    type: .delete,
                    taskId: task.id.storeIdentifier ?? "\(task.id)",
                    data: nil
                )
                addPendingOperation(operation)
            }
        } else {
            // 离线模式，添加到待同步队列
            let operation = PendingOperation(
                type: .delete,
                taskId: task.id.storeIdentifier ?? "\(task.id)",
                data: nil
            )
            addPendingOperation(operation)
        }
    }
    
    func toggleTaskCompletion(_ task: Task) async throws {
        // 立即更新本地状态
        try await localRepository.toggleTaskCompletion(task)
        
        if networkManager.isConnected {
            do {
                // 尝试同步到服务器
                try await networkRepository.toggleTaskCompletion(task)
            } catch {
                // 网络失败，添加到待同步队列
                let operation = PendingOperation(
                    type: .toggle,
                    taskId: task.id.storeIdentifier ?? "\(task.id)",
                    data: PendingOperationData(isCompleted: task.isCompleted)
                )
                addPendingOperation(operation)
            }
        } else {
            // 离线模式，添加到待同步队列
            let operation = PendingOperation(
                type: .toggle,
                taskId: task.id.storeIdentifier ?? "\(task.id)",
                data: PendingOperationData(isCompleted: task.isCompleted)
            )
            addPendingOperation(operation)
        }
    }
    
    // MARK: - 同步功能
    
    /**
     * 手动触发完整同步
     */
    func performFullSync() async throws {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        // 1. 执行待同步操作
        try await processPendingOperations()
        
        // 2. 获取服务器最新数据
        let serverTasks = try await networkRepository.getAllTasks()
        
        // 3. 同步到本地
        try await syncToLocal(serverTasks)
        
        print("完整同步完成")
    }
    
    /**
     * 获取待同步操作数量
     */
    func getPendingOperationsCount() -> Int {
        return pendingOperations.count
    }
    
    /**
     * 检查是否有待同步的数据
     */
    func hasPendingChanges() -> Bool {
        return !pendingOperations.isEmpty
    }
    
    // MARK: - 私有方法
    
    /**
     * 设置网络状态观察者
     */
    private func setupNetworkObserver() {
        // 监听网络连接状态变化
        _Concurrency.Task {
            for await isConnected in networkManager.$isConnected.values {
                if isConnected {
                    // 网络恢复，尝试同步待处理操作
                    try? await processPendingOperations()
                }
            }
        }
    }
    
    /**
     * 处理待同步操作
     */
    private func processPendingOperations() async throws {
        guard networkManager.isConnected else { return }
        
        let operations = pendingOperations
        var completedOperations: [PendingOperation] = []
        
        for operation in operations {
            do {
                switch operation.type {
                case .create:
                    if let data = operation.data {
                        _ = try await networkRepository.createTask(
                            title: data.title ?? "",
                            detail: data.detail,
                            dueDate: data.dueDate
                        )
                    }
                    
                case .update:
                    if let localTask = try await localRepository.getTask(byId: operation.taskId),
                       let data = operation.data {
                        localTask.title = data.title ?? localTask.title
                        localTask.detail = data.detail
                        localTask.dueDate = data.dueDate
                        if let isCompleted = data.isCompleted {
                            localTask.isCompleted = isCompleted
                        }
                        localTask.priority = data.priority ?? localTask.priority
                        
                        try await networkRepository.updateTask(localTask)
                    }
                    
                case .delete:
                    // 删除操作无法回滚，跳过
                    break
                    
                case .toggle:
                    if let localTask = try await localRepository.getTask(byId: operation.taskId) {
                        try await networkRepository.toggleTaskCompletion(localTask)
                    }
                }
                
                completedOperations.append(operation)
                
            } catch {
                print("处理待同步操作失败: \(operation), 错误: \(error)")
                
                // 如果是不可恢复错误（如404），移除操作
                if let networkError = error as? NetworkError, !networkError.isRecoverable {
                    completedOperations.append(operation)
                }
            }
        }
        
        // 移除已完成的操作
        for operation in completedOperations {
            removePendingOperation(operation)
        }
    }
    
    /**
     * 同步数据到本地存储
     */
    private func syncToLocal(_ serverTasks: [Task]) async throws {
        // 简化版本：直接用服务器数据覆盖本地数据
        // 实际项目中应该实现更复杂的冲突解决策略
        
        let localTasks = try await localRepository.getAllTasks()
        
        // 删除本地不存在于服务器的任务
        for localTask in localTasks {
            let existsOnServer = serverTasks.contains { serverTask in
                // 这里需要更好的ID匹配策略
                serverTask.title == localTask.title && 
                abs(serverTask.createdAt.timeIntervalSince(localTask.createdAt)) < 60
            }
            
            if !existsOnServer {
                try await localRepository.deleteTask(localTask)
            }
        }
        
        // 更新或添加服务器任务到本地
        for serverTask in serverTasks {
            if let existingLocal = localTasks.first(where: { localTask in
                serverTask.title == localTask.title &&
                abs(serverTask.createdAt.timeIntervalSince(localTask.createdAt)) < 60
            }) {
                // 更新现有任务
                existingLocal.title = serverTask.title
                existingLocal.detail = serverTask.detail
                existingLocal.isCompleted = serverTask.isCompleted
                existingLocal.dueDate = serverTask.dueDate
                existingLocal.priority = serverTask.priority
                existingLocal.updatedAt = serverTask.updatedAt
                
                try await localRepository.updateTask(existingLocal)
            } else {
                // 创建新任务
                _ = try await localRepository.createTask(
                    title: serverTask.title,
                    detail: serverTask.detail,
                    dueDate: serverTask.dueDate
                )
            }
        }
    }
    
    /**
     * 添加待同步操作
     */
    private func addPendingOperation(_ operation: PendingOperation) {
        pendingOperations.append(operation)
        savePendingOperations()
    }
    
    /**
     * 移除待同步操作
     */
    private func removePendingOperation(_ operation: PendingOperation) {
        pendingOperations.removeAll { $0.id == operation.id }
        savePendingOperations()
    }
    
    /**
     * 保存待同步操作
     */
    private func savePendingOperations() {
        if let data = try? JSONEncoder().encode(pendingOperations) {
            UserDefaults.standard.set(data, forKey: operationsKey)
        }
    }
    
    /**
     * 加载待同步操作
     */
    private func loadPendingOperations() {
        if let data = UserDefaults.standard.data(forKey: operationsKey),
           let operations = try? JSONDecoder().decode([PendingOperation].self, from: data) {
            pendingOperations = operations
        }
    }
}

// MARK: - 待同步操作相关数据结构

/**
 * 待同步操作类型
 */
enum PendingOperationType: String, Codable {
    case create, update, delete, toggle
}

/**
 * 待同步操作
 */
struct PendingOperation: Codable, Identifiable {
    let id: UUID
    let type: PendingOperationType
    let taskId: String
    let data: PendingOperationData?
    let timestamp: Date
    
    init(type: PendingOperationType, taskId: String, data: PendingOperationData?) {
        self.id = UUID()
        self.type = type
        self.taskId = taskId
        self.data = data
        self.timestamp = Date()
    }
}

/**
 * 待同步操作数据
 */
struct PendingOperationData: Codable {
    let title: String?
    let detail: String?
    let dueDate: Date?
    let isCompleted: Bool?
    let priority: TaskPriority?
    
    init(title: String? = nil, detail: String? = nil, dueDate: Date? = nil,
         isCompleted: Bool? = nil, priority: TaskPriority? = nil) {
        self.title = title
        self.detail = detail
        self.dueDate = dueDate
        self.isCompleted = isCompleted
        self.priority = priority
    }
}
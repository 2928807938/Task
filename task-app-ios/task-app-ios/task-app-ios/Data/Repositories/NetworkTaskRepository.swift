//
//  NetworkTaskRepository.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import Foundation

/**
 * 网络版任务仓库
 * 实现TaskRepository协议，通过网络API获取和操作任务数据
 */
class NetworkTaskRepository: TaskRepository {
    private let apiClient = APIClient.shared
    private let networkManager = NetworkManager.shared
    
    init() {
        // 不需要再管理映射，使用TaskIDMapper统一管理
    }
    
    // MARK: - TaskRepository协议实现
    
    func getAllTasks() async throws -> [Task] {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        do {
            let pageData = try await apiClient.getAllTasks(page: 0, size: 1000) // 获取大量数据
            return pageData.content.map { DTOMapper.toTask(from: $0) }
        } catch {
            throw error
        }
    }
    
    func getTask(byId id: String) async throws -> Task? {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        // 通过字符串ID获取服务器ID
        guard let serverId = TaskIDMapper.shared.getServerId(forStringId: id) else {
            return nil
        }
        
        do {
            let dto = try await apiClient.getTaskDetail(taskId: serverId)
            return DTOMapper.toTask(from: dto)
        } catch {
            if case NetworkError.serverError(404) = error {
                return nil // 任务不存在
            }
            throw error
        }
    }
    
    func createTask(title: String, detail: String? = nil, dueDate: Date? = nil) async throws -> Task {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        // 创建临时本地Task对象
        let localTask = Task(title: title, detail: detail, dueDate: dueDate)
        let request = DTOMapper.toCreateRequest(from: localTask)
        
        do {
            let dto = try await apiClient.createTask(request: request)
            let newTask = DTOMapper.toTask(from: dto)
            
            // ID映射关系已在DTOMapper.toTask中处理
            return newTask
        } catch {
            throw error
        }
    }
    
    func updateTask(_ task: Task) async throws {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        // 获取服务器端的任务ID
        guard let serverId = TaskIDMapper.shared.getServerId(for: task.id) else {
            throw NetworkError.invalidData
        }
        
        let request = DTOMapper.toUpdateRequest(from: task, id: serverId)
        
        do {
            let _ = try await apiClient.updateTask(request: request)
        } catch {
            throw error
        }
    }
    
    func deleteTask(_ task: Task) async throws {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        // 获取服务器端的任务ID
        guard let serverId = TaskIDMapper.shared.getServerId(for: task.id) else {
            throw NetworkError.invalidData
        }
        
        do {
            try await apiClient.deleteTask(taskId: serverId)
            
            // 清除ID映射
            TaskIDMapper.shared.removeMapping(for: task.id)
        } catch {
            throw error
        }
    }
    
    func toggleTaskCompletion(_ task: Task) async throws {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        // 获取服务器端的任务ID
        guard let serverId = TaskIDMapper.shared.getServerId(for: task.id) else {
            throw NetworkError.invalidData
        }
        
        do {
            try await apiClient.toggleTaskStatus(taskId: serverId, isCompleted: !task.isCompleted)
            
            // 更新本地状态
            task.isCompleted.toggle()
            task.updatedAt = Date()
        } catch {
            throw error
        }
    }
    
    // MARK: - 扩展方法（网络专用）
    
    /**
     * 根据过滤条件获取任务
     */
    func getFilteredTasks(filter: TaskFilter, searchText: String = "", 
                         sortBy: TaskSortOption = .default) async throws -> [Task] {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        let request = FilterTasksRequest(
            primaryFilter: filter.rawValue,
            searchText: searchText,
            sortBy: mapSortOption(sortBy),
            showCompletedOnly: filter == .completed,
            page: 0,
            size: 1000
        )
        
        do {
            let pageData = try await apiClient.filterTasks(request: request)
            return pageData.content.map { DTOMapper.toTask(from: $0) }
        } catch {
            throw error
        }
    }
    
    /**
     * 获取任务统计数据
     */
    func getTaskStatistics() async throws -> TaskStatistics {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        do {
            let dto = try await apiClient.getTaskStatistics()
            return DTOMapper.toTaskStatistics(from: dto)
        } catch {
            throw error
        }
    }
    
    /**
     * 同步本地数据到服务器
     */
    func syncToServer(tasks: [Task]) async throws {
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        for task in tasks {
            // 检查是否已存在映射关系
            if TaskIDMapper.shared.getServerId(for: task.id) == nil {
                // 新任务，需要创建
                let request = DTOMapper.toCreateRequest(from: task)
                do {
                    let dto = try await apiClient.createTask(request: request)
                    TaskIDMapper.shared.setMapping(localId: task.id, serverId: dto.id)
                } catch {
                    print("同步任务失败: \(task.title), 错误: \(error)")
                }
            } else {
                // 已存在任务，更新
                do {
                    try await updateTask(task)
                } catch {
                    print("更新任务失败: \(task.title), 错误: \(error)")
                }
            }
        }
    }
    
    // MARK: - 私有辅助方法
    
    /**
     * 映射排序选项
     */
    private func mapSortOption(_ sortOption: TaskSortOption) -> String {
        switch sortOption {
        case .default:
            return "default"
        case .dateCreated:
            return "dateCreated"
        case .dueDate:
            return "dueDate"
        case .priority:
            return "priority"
        case .alphabetical:
            return "alphabetical"
        }
    }
    
}

/**
 * 网络仓库错误扩展
 */
extension NetworkError {
    var isRecoverable: Bool {
        switch self {
        case .noConnection, .serverError(500...599):
            return true
        default:
            return false
        }
    }
}
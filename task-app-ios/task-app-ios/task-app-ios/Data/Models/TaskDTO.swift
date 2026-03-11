//
//  TaskDTO.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import Foundation
import SwiftData

/**
 * 任务数据传输对象
 * 对应后端的TaskIOSVO结构
 */
struct TaskDTO: Codable {
    let id: Int64
    let title: String
    let detail: String?
    let isCompleted: Bool
    let dueDate: String?
    let priority: Int
    let createdAt: String
    let updatedAt: String
}

/**
 * 任务ID映射管理器
 * 负责管理本地UUID和服务器数字ID之间的映射关系
 */
class TaskIDMapper {
    static let shared = TaskIDMapper()
    
    private let mappingKey = "task_id_mapping"
    private var mappings: [String: Int64] = [:]
    
    private init() {
        loadMappings()
    }
    
    /**
     * 保存PersistentIdentifier到服务器ID的映射
     */
    func setMapping(localId: PersistentIdentifier, serverId: Int64) {
        let key = localId.storeIdentifier ?? "\(localId)"
        mappings[key] = serverId
        saveMappings()
    }
    
    /**
     * 获取PersistentIdentifier对应的服务器ID
     */
    func getServerId(for localId: PersistentIdentifier) -> Int64? {
        let key = localId.storeIdentifier ?? "\(localId)"
        return mappings[key]
    }
    
    /**
     * 移除映射关系
     */
    func removeMapping(for localId: PersistentIdentifier) {
        let key = localId.storeIdentifier ?? "\(localId)"
        mappings.removeValue(forKey: key)
        saveMappings()
    }
    
    /**
     * 清除所有映射
     */
    func clearAllMappings() {
        mappings.removeAll()
        saveMappings()
    }
    
    /**
     * 获取映射数量
     */
    var mappingsCount: Int {
        return mappings.count
    }
    
    /**
     * 通过字符串ID获取服务器ID（用于NetworkTaskRepository）
     */
    func getServerId(forStringId stringId: String) -> Int64? {
        return mappings[stringId]
    }
    
    /**
     * 通过服务器ID查找对应的本地字符串ID
     */
    func getStringId(forServerId serverId: Int64) -> String? {
        return mappings.first { $0.value == serverId }?.key
    }
    
    private func loadMappings() {
        if let data = UserDefaults.standard.data(forKey: mappingKey),
           let decoded = try? JSONDecoder().decode([String: Int64].self, from: data) {
            mappings = decoded
        }
    }
    
    private func saveMappings() {
        if let data = try? JSONEncoder().encode(mappings) {
            UserDefaults.standard.set(data, forKey: mappingKey)
        }
    }
}

/**
 * 任务统计数据传输对象
 * 对应后端的TaskIOSStatisticsVO结构
 */
struct TaskStatisticsDTO: Codable {
    let basicStats: FilterStatsDTO
    let completionRate: Double
    let priorityDistribution: [String: Int] // key为优先级数值的字符串
    let weeklyProgress: [String: Int]
    let averageCompletionTime: Double?
}

/**
 * 过滤统计数据传输对象
 * 对应后端的TaskIOSFilterStatsVO结构
 */
struct FilterStatsDTO: Codable {
    let totalTasks: Int
    let pendingTasks: Int
    let completedTasks: Int
    let todayTasks: Int
    let overdueTasks: Int
    let priorityTasks: Int
    let recentTasks: Int
}

/**
 * 创建任务请求
 */
struct CreateTaskRequest: Codable {
    let title: String
    let detail: String?
    let dueDate: String?
    let priority: Int
}

/**
 * 更新任务请求
 */
struct UpdateTaskRequest: Codable {
    let id: Int64
    let title: String
    let detail: String?
    let dueDate: String?
    let priority: Int
}

/**
 * 更新任务状态请求
 */
struct UpdateTaskStatusRequest: Codable {
    let isCompleted: Bool
}

/**
 * 过滤任务请求
 */
struct FilterTasksRequest: Codable {
    let primaryFilter: String
    let searchText: String
    let sortBy: String
    let showCompletedOnly: Bool
    let page: Int
    let size: Int
}

/**
 * DTO到领域模型的映射器
 */
struct DTOMapper {
    
    /**
     * 将TaskDTO转换为Task领域模型
     */
    static func toTask(from dto: TaskDTO) -> Task {
        // 创建新的Task实例，使用SwiftData的初始化方法
        let task = Task(
            title: dto.title,
            detail: dto.detail,
            isCompleted: dto.isCompleted,
            dueDate: parseDate(dto.dueDate),
            priority: TaskPriority(rawValue: dto.priority)
        )
        
        // 手动设置时间字段
        task.createdAt = parseDate(dto.createdAt) ?? Date()
        task.updatedAt = parseDate(dto.updatedAt) ?? Date()
        
        // 保存服务器ID到本地UUID的映射
        TaskIDMapper.shared.setMapping(localId: task.id, serverId: dto.id)
        
        return task
    }
    
    /**
     * 将Task领域模型转换为CreateTaskRequest
     */
    static func toCreateRequest(from task: Task) -> CreateTaskRequest {
        return CreateTaskRequest(
            title: task.title,
            detail: task.detail,
            dueDate: formatDate(task.dueDate),
            priority: task.priority?.rawValue ?? TaskPriority.medium.rawValue
        )
    }
    
    /**
     * 将Task领域模型转换为UpdateTaskRequest
     */
    static func toUpdateRequest(from task: Task, id: Int64) -> UpdateTaskRequest {
        return UpdateTaskRequest(
            id: id,
            title: task.title,
            detail: task.detail,
            dueDate: formatDate(task.dueDate),
            priority: task.priority?.rawValue ?? TaskPriority.medium.rawValue
        )
    }
    
    /**
     * 将TaskStatisticsDTO转换为TaskStatistics领域模型
     */
    static func toTaskStatistics(from dto: TaskStatisticsDTO) -> TaskStatistics {
        // 创建一个临时的空任务数组来初始化TaskStatistics
        // 然后用DTO中的预计算数据覆盖默认计算值
        let emptyTasks: [Task] = []
        var statistics = TaskStatistics(tasks: emptyTasks)
        
        // 由于TaskStatistics的属性是计算属性，我们需要创建一个带有预设数据的版本
        // 这里我们返回一个新的TaskStatistics实例，但实际上需要修改TaskStatistics结构来支持预设数据
        
        // 暂时返回基于空任务列表的统计，后续需要修改TaskStatistics结构
        return statistics
    }
    
    // MARK: - 辅助方法
    
    /**
     * 解析ISO-8601日期字符串
     */
    private static func parseDate(_ dateString: String?) -> Date? {
        guard let dateString = dateString else { return nil }
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = formatter.date(from: dateString) {
            return date
        }
        
        // 尝试无毫秒的格式
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: dateString)
    }
    
    /**
     * 格式化日期为ISO-8601字符串
     */
    private static func formatDate(_ date: Date?) -> String? {
        guard let date = date else { return nil }
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.string(from: date)
    }
}

// 注意：由于FilterStats和TaskStatistics使用计算属性，
// 暂时无法直接从DTO数据创建。需要后续重构这些结构以支持预设数据。
// 当前版本先使用基于实际Task数组的计算方式。
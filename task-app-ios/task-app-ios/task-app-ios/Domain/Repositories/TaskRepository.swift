//
//  TaskRepository.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//

import Foundation

// 临时任务仓储实现（用于初始化阶段）
class TemporaryTaskRepository: TaskRepository {
    func getAllTasks() async throws -> [Task] { return [] }
    func getTask(byId id: String) async throws -> Task? { return nil }
    func createTask(title: String, detail: String?, dueDate: Date?) async throws -> Task {
        return Task(title: title, detail: detail, dueDate: dueDate)
    }
    func updateTask(_ task: Task) async throws {}
    func deleteTask(_ task: Task) async throws {}
    func toggleTaskCompletion(_ task: Task) async throws {}
}

// 任务仓储接口
protocol TaskRepository {
    // 获取所有任务
    func getAllTasks() async throws -> [Task]
    
    // 根据ID获取任务
    func getTask(byId id: String) async throws -> Task?
    
    // 创建新任务
    func createTask(title: String, detail: String?, dueDate: Date?) async throws -> Task
    
    // 更新任务
    func updateTask(_ task: Task) async throws
    
    // 删除任务
    func deleteTask(_ task: Task) async throws
    
    // 完成/取消完成任务
    func toggleTaskCompletion(_ task: Task) async throws
}

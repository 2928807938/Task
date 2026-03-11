//
//  SwiftDataTaskRepository.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//

import Foundation
import SwiftData

// SwiftData实现的任务仓储
class SwiftDataTaskRepository: TaskRepository {
    private let modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }
    
    // 获取所有任务
    func getAllTasks() async throws -> [Task] {
        let descriptor = FetchDescriptor<Task>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
        return try modelContext.fetch(descriptor)
    }
    
    // 根据ID获取任务
    func getTask(byId id: String) async throws -> Task? {
        // 注意：SwiftData没有直接的字符串ID，这个方法需要根据实际情况调整
        // 这里为了简单演示，我们返回nil
        return nil
    }
    
    // 创建新任务
    func createTask(title: String, detail: String?, dueDate: Date?) async throws -> Task {
        let newTask = Task(title: title, detail: detail, dueDate: dueDate)
        modelContext.insert(newTask)
        try modelContext.save()
        return newTask
    }
    
    // 更新任务
    func updateTask(_ task: Task) async throws {
        // SwiftData会自动追踪和保存更改
        try modelContext.save()
    }
    
    // 删除任务
    func deleteTask(_ task: Task) async throws {
        modelContext.delete(task)
        try modelContext.save()
    }
    
    // 完成/取消完成任务
    func toggleTaskCompletion(_ task: Task) async throws {
        task.isCompleted = !task.isCompleted
        try modelContext.save()
    }
}

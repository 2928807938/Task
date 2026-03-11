//
//  Task.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//

import Foundation
import SwiftData

@Model
final class Task {
    var title: String
    var detail: String?
    var isCompleted: Bool
    var dueDate: Date?
    var priority: TaskPriority?
    var createdAt: Date
    var updatedAt: Date
    
    init(title: String, detail: String? = nil, isCompleted: Bool = false, dueDate: Date? = nil, priority: TaskPriority? = .medium) {
        self.title = title
        self.detail = detail
        self.isCompleted = isCompleted
        self.dueDate = dueDate
        self.priority = priority
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

// MARK: - 基础扩展
extension Task {
    // 简单的逾期检查
    var isOverdue: Bool {
        guard let dueDate = dueDate, !isCompleted else { return false }
        return dueDate < Date()
    }
}

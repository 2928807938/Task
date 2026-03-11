//
//  TaskDetailViewModel.swift
//  task-app-ios
//
//  Created by Claude on 2025/8/30.
//

import Foundation
import Combine
import SwiftUI


class TaskDetailViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var task: Task
    @Published var isEditing: Bool = false
    @Published var showingDeleteAlert: Bool = false
    
    // 编辑状态
    @Published var editedTitle: String
    @Published var editedDetail: String
    @Published var editedDueDate: Date?
    @Published var editedIsCompleted: Bool
    @Published var editedPriority: TaskPriority
    
    // 依赖
    private let taskRepository: TaskRepository
    
    init(task: Task, taskRepository: TaskRepository) {
        self.task = task
        self.taskRepository = taskRepository
        
        // 初始化编辑状态
        self.editedTitle = task.title
        self.editedDetail = task.detail ?? ""
        self.editedDueDate = task.dueDate
        self.editedIsCompleted = task.isCompleted
        self.editedPriority = task.priority ?? .medium
    }
    
    // MARK: - Actions
    func startEditing() {
        withAnimation(.easeInOut(duration: 0.3)) {
            isEditing = true
        }
    }
    
    func cancelEditing() {
        editedTitle = task.title
        editedDetail = task.detail ?? ""
        editedDueDate = task.dueDate
        editedIsCompleted = task.isCompleted
        editedPriority = task.priority ?? .medium
        
        withAnimation(.easeInOut(duration: 0.3)) {
            isEditing = false
        }
    }
    
    func saveChanges() {
        withAnimation(.easeInOut(duration: 0.3)) {
            task.title = editedTitle.trimmingCharacters(in: .whitespaces)
            task.detail = editedDetail.trimmingCharacters(in: .whitespaces).isEmpty ? nil : editedDetail.trimmingCharacters(in: .whitespaces)
            task.dueDate = editedDueDate
            task.isCompleted = editedIsCompleted
            task.priority = editedPriority
            task.updatedAt = Date()
            
            // 更新到repository
            _Concurrency.Task {
                do {
                    try await taskRepository.updateTask(task)
                } catch {
                    print("更新任务失败: \(error)")
                }
            }
            
            isEditing = false
            
            // 添加触觉反馈
            let impactFeedback = UIImpactFeedbackGenerator(style: .light)
            impactFeedback.impactOccurred()
        }
    }
    
    func toggleTaskCompletion() {
        _Concurrency.Task {
            do {
                try await taskRepository.toggleTaskCompletion(task)
                
                // 添加触觉反馈
                DispatchQueue.main.async {
                    let impactFeedback = UIImpactFeedbackGenerator(style: self.task.isCompleted ? .medium : .light)
                    impactFeedback.impactOccurred()
                }
            } catch {
                print("切换任务状态失败: \(error)")
            }
        }
    }
    
    func showDeleteAlert() {
        showingDeleteAlert = true
    }
    
    func deleteTask(completion: @escaping () -> Void) {
        _Concurrency.Task {
            do {
                try await taskRepository.deleteTask(task)
                
                // 添加触觉反馈
                DispatchQueue.main.async {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
                    impactFeedback.impactOccurred()
                    
                    completion()
                }
            } catch {
                print("删除任务失败: \(error)")
                DispatchQueue.main.async {
                    completion() // 即使失败也要调用completion
                }
            }
        }
    }
    
    // MARK: - Validation
    var isFormValid: Bool {
        !editedTitle.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    // MARK: - Formatted Data
    func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        formatter.locale = Locale(identifier: "zh_CN")
        return formatter.string(from: date)
    }
    
    func formatShortDate(_ date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "今天"
        } else if calendar.isDateInTomorrow(date) {
            return "明天"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "MM/dd"
            return formatter.string(from: date)
        }
    }
}
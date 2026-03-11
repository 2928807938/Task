//
//  TaskDetailView.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//  Simplified on 2025/9/7.
//

import SwiftUI
import SwiftData

struct TaskDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var task: Task
    @State private var isEditing = false
    @State private var title: String
    @State private var detail: String
    @State private var dueDate: Date
    @State private var hasDueDate: Bool
    
    init(task: Task) {
        self._task = State(initialValue: task)
        self._title = State(initialValue: task.title)
        self._detail = State(initialValue: task.detail ?? "")
        self._dueDate = State(initialValue: task.dueDate ?? Date())
        self._hasDueDate = State(initialValue: task.dueDate != nil)
    }
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 20) {
                if isEditing {
                    editingView
                } else {
                    detailView
                }
                
                Spacer()
                
                actionButtons
            }
            .padding()
            .navigationTitle("任务详情")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(isEditing ? "完成" : "编辑") {
                        if isEditing {
                            saveChanges()
                        }
                        isEditing.toggle()
                    }
                }
            }
        }
    }
    
    // MARK: - Views
    private var detailView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("标题")
                    .font(.headline)
                    .foregroundColor(.secondary)
                Text(task.title)
                    .font(.title2)
                    .fontWeight(.semibold)
            }
            
            if let detail = task.detail, !detail.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("描述")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Text(detail)
                        .font(.body)
                }
            }
            
            if let dueDate = task.dueDate {
                VStack(alignment: .leading, spacing: 8) {
                    Text("截止时间")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Text(dueDate, format: .dateTime.month().day().hour().minute())
                        .font(.body)
                        .foregroundColor(task.isOverdue ? .red : .primary)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("状态")
                    .font(.headline)
                    .foregroundColor(.secondary)
                HStack {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(task.isCompleted ? .green : .gray)
                    Text(task.isCompleted ? "已完成" : "未完成")
                        .font(.body)
                }
            }
        }
    }
    
    private var editingView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("标题")
                    .font(.headline)
                    .foregroundColor(.secondary)
                TextField("任务标题", text: $title)
                    .textFieldStyle(.roundedBorder)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("描述")
                    .font(.headline)
                    .foregroundColor(.secondary)
                TextField("任务描述", text: $detail, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .lineLimit(3...6)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("截止时间")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Toggle("", isOn: $hasDueDate)
                }
                
                if hasDueDate {
                    DatePicker("截止时间", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                        .datePickerStyle(.compact)
                }
            }
        }
    }
    
    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button(action: toggleCompletion) {
                HStack {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    Text(task.isCompleted ? "标记为未完成" : "标记为完成")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(task.isCompleted ? Color.orange : Color.green)
                .cornerRadius(10)
            }
            
            Button(action: deleteTask) {
                HStack {
                    Image(systemName: "trash")
                    Text("删除任务")
                }
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .cornerRadius(10)
            }
        }
    }
    
    // MARK: - Actions
    private func saveChanges() {
        task.title = title
        task.detail = detail.isEmpty ? nil : detail
        task.dueDate = hasDueDate ? dueDate : nil
        task.updatedAt = Date()
        
        do {
            try modelContext.save()
        } catch {
            print("Failed to save changes: \(error)")
        }
    }
    
    private func toggleCompletion() {
        task.isCompleted.toggle()
        task.updatedAt = Date()
        
        do {
            try modelContext.save()
        } catch {
            print("Failed to toggle completion: \(error)")
        }
    }
    
    private func deleteTask() {
        modelContext.delete(task)
        
        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("Failed to delete task: \(error)")
        }
    }
}

#Preview {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try! ModelContainer(for: Task.self, configurations: config)
    let context = container.mainContext
    
    let task = Task(title: "示例任务", detail: "这是一个示例任务")
    context.insert(task)
    
    return TaskDetailView(task: task)
        .modelContainer(container)
}
//
//  AddTaskView.swift
//  task-app-ios
//
//  Created by Claude on 2025/8/27.
//  Simplified on 2025/9/7.
//

import SwiftUI
import SwiftData

struct AddTaskView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var title = ""
    @State private var detail = ""
    @State private var dueDate = Date()
    @State private var hasDueDate = false
    
    private var isFormValid: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section("任务信息") {
                    TextField("任务标题", text: $title)
                    TextField("描述（可选）", text: $detail, axis: .vertical)
                        .lineLimit(2...4)
                }
                
                Section("截止日期") {
                    Toggle("设置截止日期", isOn: $hasDueDate)
                    
                    if hasDueDate {
                        DatePicker("截止日期", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                    }
                }
            }
            .navigationTitle("添加任务")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("取消") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("创建") {
                        createTask()
                    }
                    .disabled(!isFormValid)
                }
            }
        }
    }

}

// MARK: - Actions
extension AddTaskView {
    private func createTask() {
        guard isFormValid else { return }
        
        let newTask = Task(
            title: title.trimmingCharacters(in: .whitespaces),
            detail: detail.isEmpty ? nil : detail.trimmingCharacters(in: .whitespaces),
            isCompleted: false,
            dueDate: hasDueDate ? dueDate : nil
        )
        
        modelContext.insert(newTask)
        
        do {
            try modelContext.save()
            dismiss()
        } catch {
            // Handle error silently for now
            print("Failed to save task: \(error)")
        }
    }
}


// MARK: - Preview
#Preview {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try! ModelContainer(for: Task.self, configurations: config)
    
    AddTaskView()
        .modelContainer(container)
}
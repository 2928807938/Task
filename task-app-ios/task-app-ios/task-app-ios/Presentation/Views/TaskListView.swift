//
//  TaskListView.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//  Simplified on 2025/9/7.
//

import SwiftUI
import SwiftData

struct TaskListView: View {
    // 直接使用 ModelContext
    @Environment(\.modelContext) private var modelContext
    
    // ViewModel
    @StateObject private var viewModel: TaskListViewModel
    
    // 默认初始化
    init() {
        // 创建一个临时的 ViewModel，稍后会在 onAppear 中重新配置
        self._viewModel = StateObject(wrappedValue: TaskListViewModel(taskRepository: TemporaryTaskRepository()))
    }
    
    // 使用现有模型上下文初始化（保留兼容性）
    init(viewModel: TaskListViewModel) {
        self._viewModel = StateObject(wrappedValue: viewModel)
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // 网络状态栏
                NetworkStatusView(viewModel: viewModel)
                
                // 主要内容
                if viewModel.tasks.isEmpty {
                    emptyStateView
                } else {
                    List(viewModel.tasks) { task in
                        TaskRow(
                            task: task,
                            onToggle: { viewModel.toggleTaskCompletion(task) },
                            onTap: { viewModel.selectTask(task) },
                            onDelete: { viewModel.deleteTask(task) }
                        )
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("我的任务")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    // 网络状态指示器（紧凑版）
                    CompactNetworkStatusView(viewModel: viewModel)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { viewModel.showAddTask() }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.showingAddTask) {
                AddTaskView()
            }
            .sheet(isPresented: $viewModel.showingTaskDetail) {
                if let selectedTask = viewModel.selectedTask {
                    TaskDetailView(task: selectedTask)
                }
            }
        }
    }
}

// MARK: - 简化组件
extension TaskListView {
    private var emptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "tray")
                .font(.system(size: 60, weight: .light))
                .foregroundColor(.secondary)
            
            VStack(spacing: 8) {
                Text("暂无任务")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("点击右上角 + 创建第一个任务")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            Button(action: { viewModel.showAddTask() }) {
                Text("创建任务")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .cornerRadius(10)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }
}

// MARK: - 简化任务行组件
struct TaskRow: View {
    let task: Task
    let onToggle: () -> Void
    let onTap: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        HStack {
            Button(action: onToggle) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(task.isCompleted ? .green : .gray)
                    .font(.title3)
            }
            .buttonStyle(PlainButtonStyle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(task.title)
                    .font(.body)
                    .strikethrough(task.isCompleted)
                    .foregroundColor(task.isCompleted ? .secondary : .primary)
                
                if let detail = task.detail, !detail.isEmpty {
                    Text(detail)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                
                if let dueDate = task.dueDate {
                    Text("截止: \(dueDate, format: .dateTime.month().day())")
                        .font(.caption)
                        .foregroundColor(task.isOverdue ? .red : .secondary)
                }
            }
            
            Spacer()
        }
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button("删除", role: .destructive, action: onDelete)
        }
    }
}

#Preview {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try! ModelContainer(for: Task.self, configurations: config)
    let context = container.mainContext
    
    // 配置依赖注入容器
    DependencyContainer.shared.configure(with: context)
    
    // 准备一些预览数据
    let task1 = Task(title: "完成iOS应用", detail: "实现任务管理功能")
    let task2 = Task(title: "买菜", detail: "土豆、西红柿、黄瓜")
    task2.isCompleted = true
    
    context.insert(task1)
    context.insert(task2)
    
    return TaskListView()
        .modelContainer(for: Task.self, inMemory: true)
}

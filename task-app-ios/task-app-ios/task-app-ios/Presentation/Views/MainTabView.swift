//
//  MainTabView.swift
//  task-app-ios
//
//  Created by Claude on 2025/8/26.
//  Refactored by Claude on 2025/8/29.
//  Simplified on 2025/9/7.
//

import SwiftUI

struct MainTabView: View {
    @StateObject private var viewModel: TaskListViewModel
    @Environment(\.modelContext) private var modelContext
    @State private var showingSettings = false
    
    init() {
        // 使用临时 Repository 初始化，稍后在 onAppear 中重新配置
        self._viewModel = StateObject(wrappedValue: TaskListViewModel(taskRepository: TemporaryTaskRepository()))
    }
    
    var body: some View {
        TabView {
            // 工作台页面（第一个Tab）
            NavigationView {
                Group {
                    if let statistics = viewModel.taskStatistics {
                        DashboardView(statistics: statistics)
                    } else {
                        VStack {
                            ProgressView()
                            Text("加载数据中...")
                                .foregroundColor(.secondary)
                                .padding(.top)
                        }
                    }
                }
            }
            .tabItem {
                Image(systemName: "square.grid.2x2")
                Text("工作台")
            }
            
            // 任务列表页面（第二个Tab）
            NavigationView {
                TaskListView(viewModel: viewModel)
            }
            .tabItem {
                Image(systemName: "list.bullet")
                Text("任务")
            }
            
            // 设置页面（第三个Tab）
            NavigationView {
                VStack {
                    Button("打开设置") {
                        showingSettings = true
                    }
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .navigationTitle("更多")
                .sheet(isPresented: $showingSettings) {
                    SettingsView()
                }
            }
            .tabItem {
                Image(systemName: "gearshape")
                Text("设置")
            }
        }
        .onAppear {
            // 配置 ModelContext 并重新配置 ViewModel
            DependencyContainer.shared.configure(with: modelContext)
            viewModel.reconfigureRepository(DependencyContainer.shared.taskRepository)
        }
    }
}

#Preview {
    MainTabView()
        .modelContainer(for: [Task.self], inMemory: true)
}
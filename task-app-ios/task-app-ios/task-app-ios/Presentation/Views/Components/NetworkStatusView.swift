//
//  NetworkStatusView.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import SwiftUI
import SwiftData

/**
 * 网络状态指示器视图
 * 显示当前的网络状态、同步状态和相关操作
 */
struct NetworkStatusView: View {
    @ObservedObject var viewModel: TaskListViewModel
    
    var body: some View {
        if shouldShowNetworkStatus {
            networkStatusContent
        }
    }
    
    private var shouldShowNetworkStatus: Bool {
        // 只有在支持网络功能时才显示
        return DependencyContainer.shared.canUseNetworkFeatures
    }
    
    private var networkStatusContent: some View {
        HStack(spacing: 8) {
            // 网络状态指示点
            statusIndicator
            
            // 状态文本
            Text(viewModel.syncStatusDescription)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Spacer()
            
            // 操作按钮
            actionButton
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color(.systemGray6))
        .alert("网络错误", isPresented: $viewModel.showingNetworkError) {
            Button("重试") {
                viewModel.retryNetworkOperation()
            }
            Button("取消", role: .cancel) {
                viewModel.showingNetworkError = false
            }
        } message: {
            if let error = viewModel.networkError {
                Text(error.localizedDescription)
            }
        }
    }
    
    private var statusIndicator: some View {
        Circle()
            .fill(viewModel.syncStatusColor)
            .frame(width: 8, height: 8)
            .overlay(
                // 加载时的动画
                Circle()
                    .stroke(viewModel.syncStatusColor.opacity(0.3), lineWidth: 1)
                    .scaleEffect(viewModel.isLoading ? 1.5 : 1.0)
                    .opacity(viewModel.isLoading ? 0.0 : 1.0)
                    .animation(
                        viewModel.isLoading 
                        ? Animation.easeInOut(duration: 1.0).repeatForever(autoreverses: false)
                        : .default,
                        value: viewModel.isLoading
                    )
            )
    }
    
    @ViewBuilder
    private var actionButton: some View {
        if viewModel.hasPendingChanges || !viewModel.isNetworkAvailable {
            Button(action: syncAction) {
                HStack(spacing: 4) {
                    if viewModel.isLoading {
                        ProgressView()
                            .scaleEffect(0.7)
                    } else {
                        Image(systemName: "arrow.clockwise")
                            .font(.caption)
                    }
                    
                    if viewModel.hasPendingChanges {
                        Text("同步")
                            .font(.caption)
                    } else if !viewModel.isNetworkAvailable {
                        Text("离线")
                            .font(.caption)
                    }
                }
                .foregroundColor(viewModel.isLoading ? .secondary : .accentColor)
            }
            .disabled(viewModel.isLoading || !viewModel.isNetworkAvailable)
        }
    }
    
    private func syncAction() {
        _Concurrency.Task {
            await viewModel.syncData()
        }
    }
}

/**
 * 简化版网络状态栏
 * 用于导航栏或其他紧凑空间
 */
struct CompactNetworkStatusView: View {
    @ObservedObject var viewModel: TaskListViewModel
    
    var body: some View {
        if DependencyContainer.shared.canUseNetworkFeatures {
            HStack(spacing: 4) {
                // 状态指示点
                Circle()
                    .fill(viewModel.syncStatusColor)
                    .frame(width: 6, height: 6)
                
                // 待同步提示
                if viewModel.hasPendingChanges {
                    Text("有更改待同步")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

/**
 * 网络错误提示横幅
 */
struct NetworkErrorBanner: View {
    let error: NetworkError
    let onRetry: () -> Void
    let onDismiss: () -> Void
    
    var body: some View {
        HStack {
            Image(systemName: "wifi.slash")
                .foregroundColor(.white)
            
            VStack(alignment: .leading, spacing: 2) {
                Text("网络连接问题")
                    .font(.headline)
                    .foregroundColor(.white)
                
                Text(error.localizedDescription)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.9))
            }
            
            Spacer()
            
            HStack {
                Button("重试") {
                    onRetry()
                }
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.white.opacity(0.2))
                .cornerRadius(8)
                
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .foregroundColor(.white)
                }
            }
        }
        .padding()
        .background(Color.red)
        .cornerRadius(12)
        .padding(.horizontal)
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}

#if DEBUG
struct NetworkStatusView_Previews: PreviewProvider {
    static var previews: some View {
        let container = DependencyContainer.shared
        let mockRepository = SwiftDataTaskRepository(modelContext: ModelContext(try! ModelContainer(for: Task.self)))
        let viewModel = TaskListViewModel(taskRepository: mockRepository)
        
        VStack {
            NetworkStatusView(viewModel: viewModel)
            CompactNetworkStatusView(viewModel: viewModel)
        }
        .previewLayout(.sizeThatFits)
    }
}
#endif
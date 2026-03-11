//
//  SettingsView.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import SwiftUI
import Network

/**
 * 应用设置视图
 * 包含Repository模式选择、网络配置等
 */
struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var selectedMode: RepositoryMode
    @State private var showingModeChangeAlert = false
    @State private var pendingMode: RepositoryMode?
    
    private let container = DependencyContainer.shared
    
    init() {
        _selectedMode = State(initialValue: DependencyContainer.shared.repositoryMode)
    }
    
    var body: some View {
        NavigationView {
            List {
                // Repository模式选择
                Section("数据同步模式") {
                    ForEach(RepositoryMode.allCases, id: \.rawValue) { mode in
                        repositoryModeRow(mode)
                    }
                }
                
                // 网络状态
                if container.canUseNetworkFeatures {
                    networkStatusSection
                }
                
                // 调试信息
                Section("调试信息") {
                    debugInfoRows
                }
            }
            .navigationTitle("设置")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("完成") {
                        dismiss()
                    }
                }
            }
            .alert("更改同步模式", isPresented: $showingModeChangeAlert) {
                Button("确认") {
                    if let newMode = pendingMode {
                        changeRepositoryMode(to: newMode)
                    }
                }
                Button("取消", role: .cancel) {
                    // 恢复选择
                    selectedMode = container.repositoryMode
                    pendingMode = nil
                }
            } message: {
                if let newMode = pendingMode {
                    Text("切换到\(newMode.displayName)模式可能会影响数据同步。确认继续吗？")
                }
            }
        }
    }
    
    private func repositoryModeRow(_ mode: RepositoryMode) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(mode.displayName)
                        .font(.headline)
                    
                    if mode == .hybrid {
                        Text("推荐")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.green.opacity(0.2))
                            .foregroundColor(.green)
                            .cornerRadius(4)
                    }
                }
                
                Text(mode.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            if selectedMode == mode {
                Image(systemName: "checkmark")
                    .foregroundColor(.accentColor)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            selectMode(mode)
        }
    }
    
    @ViewBuilder
    private var networkStatusSection: some View {
        Section("网络状态") {
            HStack {
                Text("网络连接")
                Spacer()
                networkStatusIndicator
            }
            
            if let networkManager = container.networkManager {
                HStack {
                    Text("连接类型")
                    Spacer()
                    Text(connectionTypeText(networkManager.connectionType))
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Text("服务器地址")
                Spacer()
                Text(NetworkManager.ServerConfig.baseURL)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private var networkStatusIndicator: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(container.networkManager?.isConnected == true ? Color.green : Color.red)
                .frame(width: 8, height: 8)
            
            Text(container.networkManager?.isConnected == true ? "已连接" : "未连接")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
    
    @ViewBuilder
    private var debugInfoRows: some View {
        HStack {
            Text("当前模式")
            Spacer()
            Text(container.repositoryMode.displayName)
                .foregroundColor(.secondary)
        }
        
        HStack {
            Text("支持离线")
            Spacer()
            Text(container.supportsOfflineMode ? "是" : "否")
                .foregroundColor(.secondary)
        }
        
        HStack {
            Text("ID映射数量")
            Spacer()
            Text("\(TaskIDMapper.shared.mappingsCount)")
                .foregroundColor(.secondary)
        }
        
        Button("清除ID映射") {
            TaskIDMapper.shared.clearAllMappings()
        }
        .foregroundColor(.red)
    }
    
    private func selectMode(_ mode: RepositoryMode) {
        if mode != container.repositoryMode {
            pendingMode = mode
            selectedMode = mode
            showingModeChangeAlert = true
        }
    }
    
    private func changeRepositoryMode(to mode: RepositoryMode) {
        container.repositoryMode = mode
        pendingMode = nil
    }
    
    private func connectionTypeText(_ type: NWInterface.InterfaceType) -> String {
        switch type {
        case .wifi:
            return "WiFi"
        case .cellular:
            return "蜂窝网络"
        case .wiredEthernet:
            return "有线网络"
        case .loopback:
            return "本地回环"
        default:
            return "其他"
        }
    }
}

// TaskIDMapper的mappingsCount属性已在TaskDTO.swift中实现

#if DEBUG
struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
    }
}
#endif
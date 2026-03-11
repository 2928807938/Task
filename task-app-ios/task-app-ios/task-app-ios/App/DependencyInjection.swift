//
//  DependencyInjection.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//  Simplified on 2025/9/7.
//

import Foundation
import SwiftData

/**
 * Repository模式枚举
 * 定义应用可以使用的不同数据访问模式
 */
enum RepositoryMode: String, CaseIterable {
    case local = "local"      // 纯本地模式（SwiftData）
    case network = "network"  // 纯网络模式
    case hybrid = "hybrid"    // 混合模式（推荐）
    
    var displayName: String {
        switch self {
        case .local:
            return "仅本地存储"
        case .network:
            return "仅网络同步"
        case .hybrid:
            return "智能同步"
        }
    }
    
    var description: String {
        switch self {
        case .local:
            return "数据仅保存在本地，不同步到服务器"
        case .network:
            return "数据仅存储在服务器，需要网络连接"
        case .hybrid:
            return "本地存储 + 服务器同步，支持离线使用"
        }
    }
}

// 依赖注入容器
class DependencyContainer {
    // 共享实例
    static let shared = DependencyContainer()
    
    // SwiftData上下文
    var modelContext: ModelContext?
    
    // 仓库模式设置
    private var _repositoryMode: RepositoryMode = .hybrid // 默认使用混合模式
    private let repositoryModeKey = "repository_mode"
    
    // 仓库实例缓存
    private var _taskRepository: TaskRepository?
    
    // 私有初始化方法，防止外部创建实例
    private init() {
        loadRepositoryMode()
    }
    
    // 配置容器
    func configure(with modelContext: ModelContext) {
        self.modelContext = modelContext
        
        // 清空现有的仓库实例，以便下次获取时重新创建
        _taskRepository = nil
        
        print("依赖注入容器已配置，ModelContext: \(modelContext), Repository模式: \(_repositoryMode.displayName)")
    }
    
    // Repository模式相关方法
    var repositoryMode: RepositoryMode {
        get { _repositoryMode }
        set {
            _repositoryMode = newValue
            saveRepositoryMode()
            // 清空缓存，强制重新创建Repository
            _taskRepository = nil
            print("Repository模式已更改为: \(newValue.displayName)")
        }
    }
    
    private func loadRepositoryMode() {
        if let savedMode = UserDefaults.standard.string(forKey: repositoryModeKey),
           let mode = RepositoryMode(rawValue: savedMode) {
            _repositoryMode = mode
        }
    }
    
    private func saveRepositoryMode() {
        UserDefaults.standard.set(_repositoryMode.rawValue, forKey: repositoryModeKey)
    }
    
    // 任务仓库
    var taskRepository: TaskRepository {
        if let repo = _taskRepository {
            return repo
        }
        
        let repo: TaskRepository
        
        switch _repositoryMode {
        case .local:
            // 纯本地模式
            guard let context = modelContext else {
                fatalError("ModelContext未配置，无法使用本地模式")
            }
            repo = SwiftDataTaskRepository(modelContext: context)
            
        case .network:
            // 纯网络模式
            repo = NetworkTaskRepository()
            
        case .hybrid:
            // 混合模式
            guard let context = modelContext else {
                fatalError("ModelContext未配置，无法使用混合模式")
            }
            let localRepo = SwiftDataTaskRepository(modelContext: context)
            repo = HybridTaskRepository(localRepository: localRepo)
        }
        
        _taskRepository = repo
        print("已创建\(_repositoryMode.displayName)模式的TaskRepository")
        return repo
    }
    
    // 创建任务列表视图模型
    func makeTaskListViewModel() -> TaskListViewModel {
        return TaskListViewModel(taskRepository: taskRepository)
    }
    
    // MARK: - 便利方法
    
    /**
     * 检查当前是否可以使用网络功能
     */
    var canUseNetworkFeatures: Bool {
        switch _repositoryMode {
        case .local:
            return false
        case .network, .hybrid:
            return true
        }
    }
    
    /**
     * 检查当前是否支持离线功能
     */
    var supportsOfflineMode: Bool {
        switch _repositoryMode {
        case .local, .hybrid:
            return true
        case .network:
            return false
        }
    }
    
    /**
     * 重置Repository缓存（用于模式切换后强制重新创建）
     */
    func resetRepository() {
        _taskRepository = nil
    }
    
    /**
     * 获取网络状态监控（仅在支持网络的模式下）
     */
    var networkManager: NetworkManager? {
        if canUseNetworkFeatures {
            return NetworkManager.shared
        }
        return nil
    }
}

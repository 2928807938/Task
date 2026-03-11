//
//  TaskListViewModel.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//

import Foundation
import Combine
import SwiftUI

// 类型别名以避免与SwiftData Task模型冲突
typealias ConcurrentTask = _Concurrency.Task

class TaskListViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var tasks: [Task] = []
    @Published var isLoading: Bool = false
    @Published var isInitialLoad: Bool = true
    
    // 网络和错误状态
    @Published var isNetworkAvailable: Bool = true
    @Published var networkError: NetworkError?
    @Published var showingNetworkError: Bool = false
    @Published var lastSyncTime: Date?
    @Published var hasPendingChanges: Bool = false
    
    // 搜索和筛选状态
    @Published var searchText: String = "" {
        didSet {
            updateFilteredTasks()
        }
    }
    @Published var selectedFilter: TaskFilter = .all {
        didSet {
            updateFilteredTasks()
        }
    }
    @Published var filteredTasks: [Task] = []
    
    // UI状态
    @Published var showingAddTask: Bool = false
    
    // 任务详情相关状态
    @Published var selectedTask: Task?
    @Published var showingTaskDetail: Bool = false
    
    // 统计数据
    @Published var taskStats: FilterStats?
    @Published var taskStatistics: TaskStatistics?
    
    // 依赖
    private var taskRepository: TaskRepository
    private var networkManager: NetworkManager?
    private var cancellables = Set<AnyCancellable>()
    
    init(taskRepository: TaskRepository) {
        self.taskRepository = taskRepository
        
        // 如果支持网络功能，设置网络管理器
        if DependencyContainer.shared.canUseNetworkFeatures {
            self.networkManager = NetworkManager.shared
            setupNetworkMonitoring()
        }
        
        setupBindings()
        
        // 只在不是临时 Repository 时加载任务
        if !(taskRepository is TemporaryTaskRepository) {
            loadTasks()
        }
        
        // 检查是否有待同步的更改
        checkPendingChanges()
    }
    
    // 重新配置 TaskRepository
    func reconfigureRepository(_ newRepository: TaskRepository) {
        self.taskRepository = newRepository
        loadTasks()
    }
    
    // MARK: - Data Loading
    func loadTasks() {
        isLoading = true
        
        _Concurrency.Task { @MainActor in
            do {
                let loadedTasks = try await taskRepository.getAllTasks()
                
                // 批量更新所有状态以避免多次重绘
                updateAllStates(with: loadedTasks)
            } catch {
                print("加载任务失败: \(error)")
                isLoading = false
            }
        }
    }
    
    private func updateAllStates(with loadedTasks: [Task]) {
        // 使用单次状态更新来避免视图闪烁
        self.tasks = loadedTasks
        self.updateFilteredTasks()
        self.updateTaskStats()
        self.isLoading = false
        self.isInitialLoad = false
    }
    
    private func setupBindings() {
        // 监听tasks变化，自动更新筛选结果和统计
        $tasks
            .sink { [weak self] _ in
                self?.updateFilteredTasks()
                self?.updateTaskStats()
            }
            .store(in: &cancellables)
    }
    
    // 添加新任务
    func addTask(title: String, detail: String? = nil, dueDate: Date? = nil) {
        _Concurrency.Task { @MainActor in
            do {
                let newTask = try await taskRepository.createTask(title: title, detail: detail, dueDate: dueDate)
                tasks.insert(newTask, at: 0) // 将新任务添加到列表顶部
            } catch {
                print("创建任务失败: \(error)")
            }
        }
    }
    
    // 删除任务
    func deleteTask(at indexSet: IndexSet) {
        _Concurrency.Task { @MainActor in
            do {
                for index in indexSet {
                    let task = tasks[index]
                    try await taskRepository.deleteTask(task)
                }
                // 更新任务列表
                tasks.remove(atOffsets: indexSet)
            } catch {
                print("删除任务失败: \(error)")
            }
        }
    }
    
    // 切换任务完成状态
    func toggleTaskCompletion(_ task: Task) {
        _Concurrency.Task { @MainActor in
            do {
                try await taskRepository.toggleTaskCompletion(task)
                
                // 由于SwiftData会自动更新对象，所以不需要重新加载整个列表
                // 但如果你想确保UI更新，可以触发对象变更通知
            } catch {
                print("切换任务状态失败: \(error)")
            }
        }
        objectWillChange.send()
    }
    
    // MARK: - 搜索和筛选逻辑
    private func updateFilteredTasks() {
        // 使用新的筛选系统
        let filterCombination = FilterCombination(
            primaryFilter: selectedFilter,
            searchText: searchText,
            sortBy: .default,
            showCompletedOnly: false
        )
        
        filteredTasks = filterCombination.apply(to: tasks)
    }
    
    private func updateTaskStats() {
        taskStats = FilterStats(tasks: tasks)
        taskStatistics = TaskStatistics(tasks: tasks)
    }
    
    // MARK: - 筛选相关方法
    
    // 快速筛选方法
    func applyFilter(_ filter: TaskFilter) {
        selectedFilter = filter
        updateFilteredTasks()
    }
    
    // 组合筛选方法
    func applyFilterCombination(_ combination: FilterCombination) {
        selectedFilter = combination.primaryFilter
        searchText = combination.searchText
        updateFilteredTasks()
    }
    
    // 获取筛选状态描述
    func getFilterDescription() -> String {
        var description = selectedFilter.displayName
        
        if !searchText.isEmpty {
            description += " · 搜索\"\(searchText)\""
        }
        
        if filteredTasks.count != getFilterCount(selectedFilter) {
            description += " (\(filteredTasks.count))"
        }
        
        return description
    }
    
    // MARK: - 筛选统计方法
    func getFilterCount(_ filter: TaskFilter) -> Int {
        guard let stats = taskStats else { return 0 }
        return stats.count(for: filter)
    }
    
    // 获取所有筛选类型的数量
    func getAllFilterCounts() -> [TaskFilter: Int] {
        guard let stats = taskStats else { return [:] }
        
        return [
            .all: stats.totalTasks,
            .pending: stats.pendingTasks,
            .completed: stats.completedTasks,
            .today: stats.todayTasks,
            .overdue: stats.overdueTasks,
            .priority: stats.priorityTasks,
            .recent: stats.recentTasks
        ]
    }
    
    // MARK: - UI Actions
    func clearSearchAndFilter() {
        searchText = ""
        selectedFilter = .all
    }
    
    func showAddTask() {
        showingAddTask = true
    }
    
    func hideAddTask() {
        showingAddTask = false
    }
    
    // 删除单个任务
    func deleteTask(_ task: Task) {
        _Concurrency.Task { @MainActor in
            do {
                try await taskRepository.deleteTask(task)
                // 从本地列表中移除
                tasks.removeAll { $0.id == task.id }
            } catch {
                print("删除任务失败: \(error)")
            }
        }
        
        // 如果删除的是当前选中的任务，清除选中状态
        if selectedTask?.id == task.id {
            selectedTask = nil
            showingTaskDetail = false
        }
    }
    
    // MARK: - 任务详情相关方法
    func selectTask(_ task: Task) {
        selectedTask = task
        showingTaskDetail = true
        
        // 添加触觉反馈
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    func deselectTask() {
        selectedTask = nil
        showingTaskDetail = false
    }
    
    // 处理任务更新后的状态同步
    func handleTaskUpdated(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
        }
        
        // 如果是当前选中的任务，更新选中状态
        if selectedTask?.id == task.id {
            selectedTask = task
        }
        
        // 触发UI更新
        objectWillChange.send()
    }
    
    // MARK: - 网络相关方法
    
    /**
     * 设置网络状态监控
     */
    private func setupNetworkMonitoring() {
        guard let networkManager = networkManager else { return }
        
        // 监控网络连接状态
        networkManager.$isConnected
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isConnected in
                self?.isNetworkAvailable = isConnected
                
                if isConnected {
                    // 网络恢复时尝试同步数据
                    self?.handleNetworkReconnected()
                }
            }
            .store(in: &cancellables)
    }
    
    /**
     * 检查是否有待同步的更改
     */
    private func checkPendingChanges() {
        if let hybridRepo = taskRepository as? HybridTaskRepository {
            hasPendingChanges = hybridRepo.hasPendingChanges()
        }
    }
    
    /**
     * 网络重新连接时的处理
     */
    private func handleNetworkReconnected() {
        // 清除之前的网络错误
        networkError = nil
        showingNetworkError = false
        
        // 如果是混合模式，尝试同步
        performSyncIfNeeded()
    }
    
    /**
     * 手动同步数据
     */
    func syncData() async {
        await performFullSync()
    }
    
    /**
     * 执行完整同步
     */
    private func performFullSync() async {
        guard let hybridRepo = taskRepository as? HybridTaskRepository else {
            return
        }
        
        do {
            isLoading = true
            try await hybridRepo.performFullSync()
            lastSyncTime = Date()
            hasPendingChanges = false
            
            // 重新加载任务列表
            await loadTasks()
        } catch {
            await handleNetworkError(error)
        }
        
        isLoading = false
    }
    
    /**
     * 如果需要则执行同步
     */
    private func performSyncIfNeeded() {
        if hasPendingChanges {
            _Concurrency.Task {
                await performFullSync()
            }
        }
    }
    
    /**
     * 处理网络错误
     */
    private func handleNetworkError(_ error: Error) async {
        await MainActor.run {
            if let networkError = error as? NetworkError {
                self.networkError = networkError
                self.showingNetworkError = true
            }
        }
    }
    
    /**
     * 重试网络操作
     */
    func retryNetworkOperation() {
        networkError = nil
        showingNetworkError = false
        
        _Concurrency.Task {
            await performFullSync()
        }
    }
    
    /**
     * 获取同步状态描述
     */
    var syncStatusDescription: String {
        if !isNetworkAvailable {
            return "离线模式"
        } else if isLoading {
            return "正在同步..."
        } else if let lastSync = lastSyncTime {
            let formatter = DateFormatter()
            formatter.dateStyle = .none
            formatter.timeStyle = .short
            return "上次同步: \(formatter.string(from: lastSync))"
        } else {
            return "未同步"
        }
    }
    
    /**
     * 获取同步状态颜色
     */
    var syncStatusColor: Color {
        if !isNetworkAvailable {
            return .orange
        } else if hasPendingChanges {
            return .blue
        } else if lastSyncTime != nil {
            return .green
        } else {
            return .gray
        }
    }
}

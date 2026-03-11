//
//  TaskFilterTypes.swift
//  task-app-ios
//
//  Created by 王杰 on 2025/4/29.
//

import Foundation

// MARK: - TaskPriority Enum
enum TaskPriority: Int, CaseIterable, Codable {
    case low = 1
    case medium = 2
    case high = 3
    
    var displayName: String {
        switch self {
        case .low:
            return "低"
        case .medium:
            return "中"
        case .high:
            return "高"
        }
    }
    
    var color: String {
        switch self {
        case .low:
            return "green"
        case .medium:
            return "orange" 
        case .high:
            return "red"
        }
    }
}

// MARK: - TaskFilter Enum
enum TaskFilter: String, CaseIterable {
    case all = "all"
    case pending = "pending"
    case completed = "completed"
    case today = "today"
    case overdue = "overdue"
    case priority = "priority"
    case recent = "recent"
    
    var displayName: String {
        switch self {
        case .all:
            return "全部"
        case .pending:
            return "待完成"
        case .completed:
            return "已完成"
        case .today:
            return "今天"
        case .overdue:
            return "过期"
        case .priority:
            return "优先级"
        case .recent:
            return "最近"
        }
    }
}

// MARK: - Sort Options
enum TaskSortOption {
    case `default`
    case dateCreated
    case dueDate
    case priority
    case alphabetical
}

// MARK: - FilterCombination
struct FilterCombination {
    let primaryFilter: TaskFilter
    let searchText: String
    let sortBy: TaskSortOption
    let showCompletedOnly: Bool
    
    init(primaryFilter: TaskFilter = .all, 
         searchText: String = "", 
         sortBy: TaskSortOption = .default, 
         showCompletedOnly: Bool = false) {
        self.primaryFilter = primaryFilter
        self.searchText = searchText
        self.sortBy = sortBy
        self.showCompletedOnly = showCompletedOnly
    }
    
    func apply(to tasks: [Task]) -> [Task] {
        var filtered = tasks
        
        // Apply primary filter
        switch primaryFilter {
        case .all:
            break // No filtering needed
        case .pending:
            filtered = filtered.filter { !$0.isCompleted }
        case .completed:
            filtered = filtered.filter { $0.isCompleted }
        case .today:
            let today = Calendar.current.startOfDay(for: Date())
            let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
            filtered = filtered.filter { task in
                guard let dueDate = task.dueDate else { return false }
                return dueDate >= today && dueDate < tomorrow
            }
        case .overdue:
            let now = Date()
            filtered = filtered.filter { task in
                guard let dueDate = task.dueDate else { return false }
                return dueDate < now && !task.isCompleted
            }
        case .priority:
            filtered = filtered.filter { $0.priority == .high }
        case .recent:
            let threeDaysAgo = Calendar.current.date(byAdding: .day, value: -3, to: Date())!
            filtered = filtered.filter { $0.createdAt >= threeDaysAgo }
        }
        
        // Apply search text filter
        if !searchText.isEmpty {
            let searchLower = searchText.lowercased()
            filtered = filtered.filter { task in
                task.title.lowercased().contains(searchLower) ||
                (task.detail?.lowercased().contains(searchLower) ?? false)
            }
        }
        
        // Apply completion filter
        if showCompletedOnly {
            filtered = filtered.filter { $0.isCompleted }
        }
        
        // Apply sorting
        switch sortBy {
        case .default:
            filtered = filtered.sorted { !$0.isCompleted && $1.isCompleted }
        case .dateCreated:
            filtered = filtered.sorted { $0.createdAt > $1.createdAt }
        case .dueDate:
            filtered = filtered.sorted { (first, second) in
                guard let firstDue = first.dueDate, let secondDue = second.dueDate else {
                    return first.dueDate != nil
                }
                return firstDue < secondDue
            }
        case .priority:
            filtered = filtered.sorted { (first, second) in
                let firstPriority = first.priority?.rawValue ?? 0
                let secondPriority = second.priority?.rawValue ?? 0
                return firstPriority > secondPriority
            }
        case .alphabetical:
            filtered = filtered.sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
        }
        
        return filtered
    }
}

// MARK: - FilterStats
struct FilterStats {
    let totalTasks: Int
    let pendingTasks: Int
    let completedTasks: Int
    let todayTasks: Int
    let overdueTasks: Int
    let priorityTasks: Int
    let recentTasks: Int
    
    init(tasks: [Task]) {
        let now = Date()
        let today = Calendar.current.startOfDay(for: now)
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: today)!
        let threeDaysAgo = Calendar.current.date(byAdding: .day, value: -3, to: now)!
        
        self.totalTasks = tasks.count
        self.pendingTasks = tasks.filter { !$0.isCompleted }.count
        self.completedTasks = tasks.filter { $0.isCompleted }.count
        
        self.todayTasks = tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate >= today && dueDate < tomorrow
        }.count
        
        self.overdueTasks = tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate < now && !task.isCompleted
        }.count
        
        self.priorityTasks = tasks.filter { $0.priority == .high }.count
        self.recentTasks = tasks.filter { $0.createdAt >= threeDaysAgo }.count
    }
    
    func count(for filter: TaskFilter) -> Int {
        switch filter {
        case .all:
            return totalTasks
        case .pending:
            return pendingTasks
        case .completed:
            return completedTasks
        case .today:
            return todayTasks
        case .overdue:
            return overdueTasks
        case .priority:
            return priorityTasks
        case .recent:
            return recentTasks
        }
    }
}

// MARK: - Enhanced Statistics
struct TaskStatistics {
    let basicStats: FilterStats
    let completionRate: Double
    let priorityDistribution: [TaskPriority: Int]
    let weeklyProgress: [String: Int]
    let averageCompletionTime: TimeInterval?
    
    init(tasks: [Task]) {
        self.basicStats = FilterStats(tasks: tasks)
        
        // 完成率计算
        if tasks.isEmpty {
            self.completionRate = 0.0
        } else {
            self.completionRate = Double(basicStats.completedTasks) / Double(basicStats.totalTasks)
        }
        
        // 优先级分布
        var priorityDist: [TaskPriority: Int] = [:]
        for priority in TaskPriority.allCases {
            priorityDist[priority] = tasks.filter { $0.priority == priority }.count
        }
        self.priorityDistribution = priorityDist
        
        // 最近7天的完成情况
        var weeklyStats: [String: Int] = [:]
        let calendar = Calendar.current
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MM-dd"
        
        for i in 0..<7 {
            let date = calendar.date(byAdding: .day, value: -i, to: Date())!
            let dateString = dateFormatter.string(from: date)
            let startOfDay = calendar.startOfDay(for: date)
            let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
            
            let completedCount = tasks.filter { task in
                task.isCompleted && task.updatedAt >= startOfDay && task.updatedAt < endOfDay
            }.count
            
            weeklyStats[dateString] = completedCount
        }
        self.weeklyProgress = weeklyStats
        
        // 平均完成时间（从创建到完成）
        let completedTasks = tasks.filter { $0.isCompleted }
        if !completedTasks.isEmpty {
            let totalTime = completedTasks.reduce(0.0) { result, task in
                return result + task.updatedAt.timeIntervalSince(task.createdAt)
            }
            self.averageCompletionTime = totalTime / Double(completedTasks.count)
        } else {
            self.averageCompletionTime = nil
        }
    }
}

// MARK: - Statistics Helper Extensions
extension TaskStatistics {
    var completionRateText: String {
        return String(format: "%.1f%%", completionRate * 100)
    }
    
    var averageCompletionTimeText: String {
        guard let avgTime = averageCompletionTime else { return "暂无数据" }
        
        let days = Int(avgTime / 86400) // 86400 seconds in a day
        let hours = Int((avgTime.truncatingRemainder(dividingBy: 86400)) / 3600)
        
        if days > 0 {
            return "\(days)天\(hours)小时"
        } else if hours > 0 {
            return "\(hours)小时"
        } else {
            return "少于1小时"
        }
    }
    
    func getPriorityPercentage(for priority: TaskPriority) -> Double {
        let count = priorityDistribution[priority] ?? 0
        guard basicStats.totalTasks > 0 else { return 0.0 }
        return Double(count) / Double(basicStats.totalTasks)
    }
}
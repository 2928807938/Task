//
//  StatisticsView.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/7.
//

import SwiftUI
import Charts

struct DashboardView: View {
    let statistics: TaskStatistics
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // 欢迎区域
                welcomeSection
                
                // 快速统计卡片
                quickStatsSection
                
                // 今日焦点
                todayFocusSection
                
                // 完成进度
                progressSection
                
                // 优先级概览
                priorityOverviewSection
            }
            .padding()
        }
        .navigationTitle("工作台")
        .navigationBarTitleDisplayMode(.large)
        .background(Color(.systemGroupedBackground))
    }
    
    // MARK: - 欢迎区域
    private var welcomeSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(greetingText)
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text("让我们开始今天的工作吧")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                // 今日完成率小徽章
                if statistics.basicStats.todayTasks > 0 {
                    let todayCompleted = statistics.basicStats.completedTasks // 简化，实际应该是今日完成的
                    let todayRate = min(Double(todayCompleted) / Double(statistics.basicStats.todayTasks), 1.0)
                    
                    VStack(spacing: 2) {
                        Text(String(format: "%.0f%%", todayRate * 100))
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("今日")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        LinearGradient(
                            colors: [.blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .cornerRadius(12)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - 快速统计
    private var quickStatsSection: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
            QuickStatCard(
                title: "进行中",
                value: "\(statistics.basicStats.pendingTasks)",
                icon: "circle.dotted",
                color: .orange,
                trend: nil
            )
            
            QuickStatCard(
                title: "已完成",
                value: "\(statistics.basicStats.completedTasks)",
                icon: "checkmark.circle.fill",
                color: .green,
                trend: .up
            )
            
            QuickStatCard(
                title: "今日任务",
                value: "\(statistics.basicStats.todayTasks)",
                icon: "calendar",
                color: .blue,
                trend: nil
            )
            
            QuickStatCard(
                title: "已逾期",
                value: "\(statistics.basicStats.overdueTasks)",
                icon: "exclamationmark.triangle.fill",
                color: .red,
                trend: statistics.basicStats.overdueTasks > 0 ? .down : nil
            )
        }
    }
    
    // MARK: - 今日焦点
    private var todayFocusSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "star.circle.fill")
                    .foregroundColor(.yellow)
                    .font(.title3)
                
                Text("今日焦点")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            HStack(spacing: 16) {
                // 今日任务
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(statistics.basicStats.todayTasks)")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    Text("今日任务")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 40)
                
                // 高优先级
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(statistics.basicStats.priorityTasks)")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.red)
                    Text("高优先级")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 40)
                
                // 完成率
                VStack(alignment: .leading, spacing: 4) {
                    Text(statistics.completionRateText)
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                    Text("完成率")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - 完成进度
    private var progressSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "chart.line.uptrend.xyaxis.circle.fill")
                    .foregroundColor(.green)
                    .font(.title3)
                
                Text("完成进度")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Text(statistics.completionRateText)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
            }
            
            // 进度条
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 16)
                    
                    RoundedRectangle(cornerRadius: 8)
                        .fill(
                            LinearGradient(
                                colors: [.green, .blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * statistics.completionRate, height: 16)
                        .animation(.easeInOut(duration: 1.0), value: statistics.completionRate)
                }
            }
            .frame(height: 16)
            
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("平均用时")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(statistics.averageCompletionTimeText)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("最近创建")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(statistics.basicStats.recentTasks)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - 优先级概览
    private var priorityOverviewSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "flag.circle.fill")
                    .foregroundColor(.red)
                    .font(.title3)
                
                Text("优先级分布")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Button(action: {}) {
                    Text("查看全部")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            HStack(spacing: 12) {
                ForEach(TaskPriority.allCases.reversed(), id: \.self) { priority in
                    let count = statistics.priorityDistribution[priority] ?? 0
                    let percentage = statistics.getPriorityPercentage(for: priority)
                    
                    VStack(spacing: 8) {
                        // 优先级圆形图标
                        ZStack {
                            Circle()
                                .fill(Color(priority.color).opacity(0.2))
                                .frame(width: 50, height: 50)
                            
                            Text("\(count)")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(Color(priority.color))
                        }
                        
                        VStack(spacing: 2) {
                            Text(priority.displayName)
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundColor(.primary)
                            
                            Text(String(format: "%.0f%%", percentage * 100))
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - 辅助属性
    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:
            return "早上好！"
        case 12..<14:
            return "中午好！"
        case 14..<18:
            return "下午好！"
        case 18..<22:
            return "晚上好！"
        default:
            return "夜深了"
        }
    }
}

// MARK: - 趋势枚举
enum Trend {
    case up, down
    
    var icon: String {
        switch self {
        case .up:
            return "arrow.up.right"
        case .down:
            return "arrow.down.right"
        }
    }
    
    var color: Color {
        switch self {
        case .up:
            return .green
        case .down:
            return .red
        }
    }
}

// MARK: - 快速统计卡片组件
struct QuickStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    let trend: Trend?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                
                Spacer()
                
                if let trend = trend {
                    Image(systemName: trend.icon)
                        .font(.caption)
                        .foregroundColor(trend.color)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

#Preview {
    NavigationView {
        DashboardView(statistics: TaskStatistics(tasks: [
            Task(title: "测试任务1", detail: "描述", dueDate: Date()),
            Task(title: "测试任务2", detail: "描述", dueDate: Calendar.current.date(byAdding: .day, value: -1, to: Date())),
            Task(title: "测试任务3", isCompleted: true)
        ]))
    }
}
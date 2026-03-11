package com.task.application.service

import com.task.application.utils.SecurityUtils
import com.task.application.vo.DashboardVO
import com.task.application.vo.TaskBasicVO
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.desc
import com.task.domain.model.common.fieldOf
import com.task.domain.model.project.ProjectStatus
import com.task.domain.model.task.Priority
import com.task.domain.model.task.Task
import com.task.domain.repository.TaskRepository
import com.task.domain.service.ProjectService
import com.task.domain.service.TaskService
import com.task.domain.service.UserService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 首页应用服务
 * 负责聚合多个领域的数据，为首页提供综合信息
 */
@Service
class HomePageApplicationService(
    private val taskService: TaskService,
    private val userService: UserService,
    private val projectService: ProjectService,
    private val taskRepository: TaskRepository,
    private val securityUtils: SecurityUtils
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 获取首页仪表盘数据
     * 只返回当前用户的未完成任务列表
     *
     * @return 仪表盘数据，包含当前日期和未完成任务列表
     */
    fun getDashboard(): Mono<DashboardVO> {
        
        // 获取当前用户ID
        return securityUtils.getCurrentUserId()
            .flatMap { userId ->
                log.debug("当前用户ID: {}", userId)
                
                // 获取未完成的任务
                getIncompleteTasks(userId)
                    .map { tasks ->
                        DashboardVO(
                            currentDate = OffsetDateTime.now(),
                            tasks = tasks
                        )
                    }
            }
            .doOnSuccess { dashboard ->
                log.debug("首页仪表盘数据获取成功: 包含{}\u4e2a任务", dashboard.tasks.size)
            }
            .doOnError { e ->
                log.error("获取首页仪表盘数据失败: {}", e.message, e)
            }
    }

    /**
     * 获取用户的未完成子任务
     * 使用最简单的方式实现
     *
     * @param userId 用户ID
     * @return 未完成子任务列表
     */
    private fun getIncompleteTasks(userId: Long): Mono<List<TaskBasicVO>> {
        log.info("查询用户未完成子任务: userId={}", userId)
        
        if (userId <= 0) {
            log.error("无效的用户ID: {}", userId)
            return Mono.just(emptyList())
        }
        
        // 直接从任务仓储中查询符合条件的任务
        return taskRepository.list {
                // 条件一：必须是子任务（非主任务）
                fieldOf(Task::parentTaskId, ComparisonOperator.NOT_EQUALS, null)
                
                // 条件二：必须是指定用户的任务
                fieldOf(Task::assigneeId, ComparisonOperator.EQUALS, userId)

                // 排序：按照优先级降序、创建时间降序
                orderBy(desc(Task::priorityId))
                orderBy(desc(Task::createdAt))
            }
            .doOnNext { task -> 
                log.debug("数据库查询结果: taskId={}, assigneeId={}, projectId={}", 
                          task.id, task.assigneeId, task.projectId)
            }
            // 先选出属于非归档项目的任务
            .filterWhen { task ->
                projectService.findById(task.projectId)
                    .doOnNext { project -> 
                        log.debug("项目状态: projectId={}, archived={}", task.projectId, project.archived)
                    }
                    .map { project -> !project.archived }
            }
            // 再选出非终止状态的任务
            .filterWhen { task ->
                taskService.isTaskStatusTerminal(task.statusId)
                    .doOnNext { isTerminal -> 
                        log.debug("任务状态: taskId={}, statusId={}, isTerminal={}", 
                                  task.id, task.statusId, isTerminal)
                    }
                    .map { isTerminal -> !isTerminal }
            }
            // 限制最终数量
            .take(20)
            // 添加优先级、进度信息和用户信息
            .flatMap { task ->
                Mono.zip(
                    taskService.findPriorityById(task.priorityId),
                    
                    taskService.calculateTaskProgress(task),
                        
                    // 获取任务负责人信息
                    task.assigneeId?.let { assigneeId -> 
                        userService.getById(assigneeId)
                            .map { it.username }
                    } ?: Mono.empty(),
                    
                    // 获取任务创建者信息
                    userService.getById(task.creatorId)
                        .map { it.username },
                        
                    // 获取任务状态信息
                    taskService.findStatusById(task.statusId)
                )
                .map { tuple ->
                    // 传递五个参数：task, priority, progress, assigneeName, creatorName, status
                    convertToTaskBasicVO(task, tuple.t1, tuple.t2, tuple.t3, tuple.t4, tuple.t5)
                }
            }
            .collectList()
            .doOnSuccess { tasks ->
                log.info("共找到{}\u4e2a未完成子任务", tasks.size)
            }
    }

    // 团队协作动态相关方法已移除

    /**
     * 将Task转换为TaskBasicVO
     * 
     * @param task 任务对象
     * @param priority 任务优先级对象（可能为空）
     * @param progress 任务进度（0-100）
     * @param assigneeName 负责人名称（可能为空）
     * @param creatorName 创建者名称（可能为空）
     * @param status 任务状态对象（可能为空）
     * @return 转换后的TaskBasicVO对象
     */
    private fun convertToTaskBasicVO(task: Task, priority: Priority, progress: Int = 0, assigneeName: String, creatorName: String, status: ProjectStatus): TaskBasicVO {
        return TaskBasicVO(
            id = task.id,
            title = task.title,
            description = task.description,
            status = status.name,
            statusColor = status.color,
            priority = priority.name,
            priorityColor = priority.color,
            priorityScore = priority.score,
            assignee = assigneeName, // 使用获取到的负责人名称
            assigneeId = task.assigneeId,
            creator = creatorName, // 使用获取到的创建者名称
            creatorId = task.creatorId,
            dueDate = task.dueDate?.toString(),
            createdAt = task.createdAt.toString(),
            updatedAt = task.updatedAt?.toString(),
            parentTaskId = task.parentTaskId,
            startTime = task.startTime?.toString(),
            progress = progress
        )
    }
}
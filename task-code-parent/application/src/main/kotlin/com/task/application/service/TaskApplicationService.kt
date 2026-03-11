package com.task.application.service

import com.task.application.assembler.TaskCommandAssembler
import com.task.application.request.*
import com.task.application.utils.SecurityUtils
import com.task.application.utils.TaskScheduler
import com.task.application.vo.*
import com.task.domain.command.TaskCommandHandler
import com.task.domain.constants.ProjectPermissions
import com.task.domain.model.attachment.EntityTypeEnum
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.desc
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.Task
import com.task.domain.model.team.Collaboration
import com.task.domain.service.*
import com.task.domain.transaction.ReactiveTransactionalOutbox
import com.task.shared.annotation.RequireProjectPermission
import com.task.shared.annotation.RequireTaskPermission
import com.task.shared.api.response.PageData
import com.task.shared.constants.ResponseCode
import com.task.shared.exceptions.BusinessException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Duration
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

/**
 * 任务应用服务
 * 负责处理与任务相关的应用层逻辑，协调领域服务
 */
@Service
class TaskApplicationService(
    private val taskService: TaskService,
    private val attachmentService: AttachmentService,
    private val collaborationService: CollaborationService,
    private val userService: UserService,
    private val securityUtils: SecurityUtils,
    private val taskCommandAssembler: TaskCommandAssembler,
    private val taskCommandHandler: TaskCommandHandler,
    private val projectService: ProjectService,
    private val accessControlService: AccessControlService,
) {
    private val taskScheduler = TaskScheduler()
    private val log = LoggerFactory.getLogger(this::class.java)
    private val dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")

    /**
     * 获取项目任务列表
     *
     * @param projectId 项目ID
     * @param request 获取项目任务列表请求
     * @return 任务视图对象列表（分页）
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.TASK_VIEW,
        projectIdParam = "projectId"
    )
    fun getProjectTasks(projectId: Long, request: GetProjectTasksRequest): Mono<PageData<TaskVO>> {
        log.info("获取项目任务列表，项目ID={}，请求参数={}，任务类型={}", projectId, request, request.taskType)

        return taskService.findTasksByProjectIdPaged(projectId, request.pageNumber, request.pageSize, request.priority, request.taskType)
            .flatMap { pageResult ->
                // 如果没有任务，直接返回空列表
                if (pageResult.items.isEmpty()) {
                    return@flatMap Mono.just(
                        PageData.of<TaskVO>(
                            content = emptyList(),
                            current = request.pageNumber,
                            size = request.pageSize,
                            total = pageResult.total
                        )
                    )
                }
                
                // 收集所有任务的assigneeId
                val assigneeIds = pageResult.items
                    .mapNotNull { it.assigneeId }
                    .distinct()
                
                // 批量查询用户名
                val userNameMapMono = if (assigneeIds.isNotEmpty()) {
                    userService.batchGetUserNames(assigneeIds)
                } else {
                    Mono.just(emptyMap())
                }
                
                // 使用用户名映射转换任务
                userNameMapMono.flatMap { userNameMap ->
                    Flux.fromIterable(pageResult.items)
                        .flatMap { task ->
                            convertToTaskVO(task, userNameMap)
                        }
                        .collectList()
                        .map { taskVOs ->
                            PageData.of(
                                content = taskVOs,
                                current = request.pageNumber,
                                size = request.pageSize,
                                total = pageResult.total
                            )
                        }
                }
            }
    }

    /**
     * 将Task领域对象转换为TaskVO视图对象
     *
     * @param task 任务领域对象
     * @return 任务视图对象
     */
    private fun convertToTaskVO(task: Task): Mono<TaskVO> {
        return convertToTaskVO(task, emptyMap())
    }
    
    /**
     * 将Task领域对象转换为TaskVO视图对象
     *
     * @param task 任务领域对象
     * @param userNameMap 用户ID到用户名的映射
     * @return 任务视图对象
     */
    private fun convertToTaskVO(task: Task, userNameMap: Map<Long, String>): Mono<TaskVO> {
        // 查询任务状态（包含颜色）
        val statusMono = if (task.status != null) {
            Mono.just(Pair(task.status!!.name, task.status!!.color))
        } else {
            taskService.findStatusById(task.statusId)
                .map { Pair(it.name, it.color) }
                .defaultIfEmpty(Pair("未知状态", "#CCCCCC"))
        }

        // 查询任务优先级（包含颜色）
        val priorityMono = taskService.findPriorityById(task.priorityId)
            .map { Pair(it.name, it.color) }
            .defaultIfEmpty(Pair("未知优先级", "#CCCCCC"))
            
        // 查询任务是否有附件
        val hasAttachmentsMono = attachmentService.findAttachmentsByEntityTypeAndEntityId(EntityTypeEnum.TASK, task.id)
            .hasElements()
            .defaultIfEmpty(false)
            
        // 计算任务进度
        val progressMono = taskService.calculateTaskProgress(task)

        return Mono.zip(statusMono, priorityMono, hasAttachmentsMono, progressMono)
            .map { tuple ->
                val (statusName, statusColor) = tuple.t1
                val (priorityName, priorityColor) = tuple.t2
                val hasAttachments = tuple.t3
                val progress = tuple.t4
                
                // 获取任务负责人名称
                val assigneeName = if (task.assigneeId != null && userNameMap.containsKey(task.assigneeId)) {
                    userNameMap[task.assigneeId]
                } else {
                    null
                }

                TaskVO(
                    id = task.id,
                    title = task.title,
                    description = task.description,
                    statusId = task.statusId,
                    status = statusName,
                    statusColor = statusColor,
                    priority = priorityName,
                    priorityColor = priorityColor,
                    assignee = assigneeName,
                    startTime = task.startTime?.toString(),
                    dueDate = task.dueDate?.toString(),
                    createdAt = task.createdAt.toString(),
                    hasAttachments = hasAttachments,
                    parentTaskId = task.parentTaskId,
                    progress = progress
                )
            }
    }

    /**
     * 根据任务ID查询任务详情
     *
     * @param taskId 任务ID
     * @return 任务详情视图对象
     */
    @RequireTaskPermission(
        permission = ProjectPermissions.TASK_VIEW,
        taskIdParam = "taskId"
    )
    fun getTaskDetail(taskId: Long): Mono<TaskDetailVO> {
        log.info("查询任务详情，任务ID={}", taskId)

        return taskService.findTaskById(taskId)
            .flatMap { task ->
                // 转换为任务详情视图对象
                convertToTaskDetailVO(task)
            }
            .doOnSuccess { taskDetail ->
                log.info("任务详情查询成功，任务ID={}，标题={}", taskId, taskDetail.title)
            }
            .doOnError { e ->
                log.error("任务详情查询失败，任务ID={}，错误：{}", taskId, e.message, e)
            }
    }

    /**
     * 将Task领域对象转换为TaskDetailVO视图对象
     *
     * @param task 任务领域对象
     * @return 任务详情视图对象
     */
    private fun convertToTaskDetailVO(task: Task): Mono<TaskDetailVO> {
        // 转换子任务
        val subTasksMono = Flux.fromIterable(task.subTasks)
            .flatMap { subTask -> convertToTaskVO(subTask) }
            .collectList()

        // 获取任务依赖关系（简化实现，实际可能需要查询任务依赖表）
        val dependenciesMono = Mono.just(emptyList<TaskVO>())

        // 查询协作记录并转换为VO对象
        val collaborationsMono = collaborationService.list {
            fieldOf(Collaboration::taskId, ComparisonOperator.EQUALS, task.id)
            orderBy(desc(Collaboration::updatedAt), desc(Collaboration::createdAt))
        }
        .collectList()
        .flatMap { filteredCollaborations ->
            if (filteredCollaborations.isEmpty()) {
                return@flatMap Mono.just(emptyList<CollaborationRecordVO>())
            }
            
            // 获取所有发送者ID
            val senderIds = filteredCollaborations.mapNotNull { it.senderId }
            
            // 批量查询用户信息
            userService.batchGetUserNames(senderIds)
                .map { userNameMap ->
                    filteredCollaborations.map { collaboration ->
                        CollaborationRecordVO(
                            time = collaboration.createdAt.format(dateTimeFormatter),
                            user = userNameMap[collaboration.senderId] ?: "未知用户",
                            content = collaboration.content
                        )
                    }
                }
        }
        .defaultIfEmpty(emptyList())

        // 获取关联资源（从附件服务中查询任务相关的附件）
        val resourcesMono = attachmentService.findAttachmentsByEntityTypeAndEntityId(EntityTypeEnum.TASK, task.id)
            .map { attachment ->
                ResourceVO(
                    type = attachment.getExtension() ?: "file",
                    name = attachment.fileName,
                    url = attachment.storagePath
                )
            }
            .collectList()
            .defaultIfEmpty(emptyList())

        // 查询优先级信息
        val priorityMono = task.priorityId.let {
            taskService.findPriorityById(it)
        }

        // 计算任务进度
        val progressMono = taskService.calculateTaskProgress(task)
        
        // 收集需要查询的用户ID
        val userIds = mutableListOf<Long>()
        // 添加负责人ID（如果存在）
        task.assigneeId?.let { userIds.add(it) }
        // 添加创建者ID
        userIds.add(task.creatorId)
        
        // 批量查询用户名
        val userNameMapMono = userService.batchGetUserNames(userIds)
    
        return Mono.zip(subTasksMono, dependenciesMono, collaborationsMono, resourcesMono, priorityMono, progressMono, userNameMapMono)
            .map { tuple ->
                val subTasks = tuple.t1
                val dependencies = tuple.t2
                val collaborations = tuple.t3
                val resources = tuple.t4
                val priority = tuple.t5
                val progress = tuple.t6
                val userNameMap = tuple.t7
                
                // 获取负责人和创建者名称
                val assigneeName = if (task.assigneeId != null) userNameMap[task.assigneeId] else null
                val creatorName = userNameMap[task.creatorId] ?: "未知用户"

                TaskDetailVO(
                    id = task.id,
                    title = task.title,
                    description = task.description,
                    status = task.status?.name?: "未知状态",
                    statusColor = task.status?.color ?: "#000000", // 默认颜色
                    priority = priority.name,
                    priorityColor = priority.color,
                    priorityScore = priority.score,
                    assignee = assigneeName,
                    assigneeId = task.assigneeId,
                    creator = creatorName,
                    creatorId = task.creatorId,
                    startTime = task.startTime?.toString(),
                    dueDate = task.dueDate?.toString(),
                    createdAt = task.createdAt.toString(),
                    updatedAt = task.updatedAt?.toString(),
                    parentTaskId = task.parentTaskId,
                    subTasks = subTasks,
                    dependencies = dependencies,
                    collaborations = collaborations,
                    resources = resources,
                    progress = progress,
                    totalHours = calculateTotalHours(task),
                    completedHours = calculateCompletedHours(task)
                )
            }
    }

    /**
     * 计算任务总工时
     *
     * @param task 任务领域对象
     * @return 任务总工时
     */
    private fun calculateTotalHours(task: Task): Double {
        // 简化实现，实际可能需要从任务属性或时间记录中获取
        return task.subTasks.sumOf { 8.0 } // 假设每个子任务8小时
    }

    /**
     * 计算任务已完成工时
     *
     * @param task 任务领域对象
     * @return 任务已完成工时
     */
    private fun calculateCompletedHours(task: Task): Double {
        // 简化实现，实际可能需要从任务属性或时间记录中获取
        return task.subTasks.count { it.status?.isTerminal == true } * 8.0 // 假设每个已完成子任务8小时
    }

    /**
     * 将Task领域对象转换为TaskBasicVO视图对象
     * 
     * @param task 任务领域对象
     * @return 任务基本信息视图对象
     */
    fun convertToTaskBasicVO(task: Task): Mono<TaskBasicVO> {
        // 查询状态信息，只查询一次
        val statusMono = taskService.findStatusById(task.statusId)
        
        // 主任务计算实际进度，子任务进度只有0和100两种状态
        val progressMono = if (task.parentTaskId == null) {
            // 主任务，计算实际进度
            taskService.calculateTaskProgress(task).defaultIfEmpty(0)
        } else {
            // 子任务，根据状态决定进度（0或100）
            statusMono.map { status -> if (status.isTerminal) 100 else 0 }
                .defaultIfEmpty(0)
        }
        
        return Mono.zip(
            statusMono, // 复用已查询的状态
            taskService.findPriorityById(task.priorityId),
            userService.getById(task.creatorId),
            userService.getById(task.assigneeId),
            progressMono
        ).map { tuple ->
            val status = tuple.t1
            val priority = tuple.t2
            val creator = tuple.t3
            val assignee = tuple.t4
            val progress = tuple.t5

            TaskBasicVO(
                id = task.id,
                title = task.title,
                description = task.description,
                status = status.name,
                statusColor = status.color,
                priority = priority.name,
                priorityColor = priority.color,
                priorityScore = priority.score,
                assignee = assignee.username,
                assigneeId = assignee.id,
                creator = creator.username,
                creatorId = creator.id!!,
                dueDate = task.dueDate?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                createdAt = task.createdAt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                updatedAt = task.updatedAt?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                parentTaskId = task.parentTaskId,
                startTime = task.startTime?.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME),
                progress = progress
            )
        }
    }

    /**
     * 获取主任务及其所有子任务的详细信息
     * 如果指定的任务是子任务，则会查找其父任务及所有相关子任务
     * 
     * @param taskId 任务ID
     * @return 包含主任务和所有子任务的完整信息
     */
    fun getTaskWithSubtasks(taskId: Long): Mono<TaskWithSubtasksVO> {
        log.info("查询主任务及子任务详情，任务ID={}", taskId)
        
        return securityUtils.withCurrentUserId { userId ->
            // 首先查询指定的任务
            taskService.findTaskById(taskId)
                .flatMap { task ->
                    // 确定主任务ID
                    val mainTaskId = if (task.parentTaskId != null) {
                        // 如果是子任务，则查找其父任务
                        task.parentTaskId!!
                    } else {
                        // 如果是主任务，则直接使用
                        task.id
                    }
                    
                    // 查询主任务基本信息
                    val mainTaskMono = taskService.findTaskById(mainTaskId)
                        .flatMap { mainTask -> convertToTaskBasicVO(mainTask) }
                    
                    // 查询所有子任务
                    val subTasksMono = taskService.findSubTasksByParentId(mainTaskId)
                        .flatMap { subTask -> convertToTaskBasicVO(subTask) }
                        .collectList()
                    
                    // 获取主任务原始对象，用于进度计算
                    val originalMainTaskMono = taskService.findTaskById(mainTaskId)
                    
                    // 组合结果
                    Mono.zip(mainTaskMono, subTasksMono, originalMainTaskMono)
                        .flatMap { tuple ->
                            val mainTaskBasic = tuple.t1
                            val subTasksBasic = tuple.t2
                            val originalMainTask = tuple.t3
                            
                            // 计算总任务数
                            val totalTaskCount = 1 + subTasksBasic.size // 主任务 + 子任务数量
                            
                            // 使用TaskService.calculateTaskProgress方法计算整体进度
                            taskService.calculateTaskProgress(originalMainTask).map { overallProgress ->
                                // 统计已完成子任务数
                                val completedSubTasks = subTasksBasic.count { it.progress == 100 }
                                // 统计已完成总任务数（如果主任务进度为100%，则主任务计为已完成）
                                val completedTaskCount = (if (overallProgress == 100) 1 else 0) + completedSubTasks
                                
                                TaskWithSubtasksVO(
                                    mainTask = mainTaskBasic,
                                    subTasks = subTasksBasic,
                                    totalTaskCount = totalTaskCount,
                                    completedTaskCount = completedTaskCount,
                                    overallProgress = overallProgress
                                )
                            }
                        }
                }
                .doOnSuccess { result ->
                    log.info("主任务及子任务详情查询成功，任务ID={}，子任务数量={}", taskId, result.subTasks.size)
                }
                .doOnError { e ->
                    log.error("主任务及子任务详情查询失败，任务ID={}，错误：{}", taskId, e.message, e)
                }
        }
    }

    /**
     * 安排任务时间
     * 根据主任务截止时间和子任务依赖关系，安排每个子任务的开始时间
     * 考虑资源限制，同一人分配的任务串行执行
     * 同时考虑用户现有的任务安排，避免时间冲突
     *
     * @param request 原始创建任务请求
     * @return 包含原始创建任务请求的Mono（时间安排结果在 TaskScheduler 内部存储）
     */
    fun arrangeTaskSchedule(request: CreateTaskRequest): Mono<CreateTaskRequest> {
        log.info("开始安排任务时间，项目ID={}", request.projectId)
        
        // 确保主任务有截止日期
        if (request.mainTask.endTime == null) {
            request.mainTask.endTime = OffsetDateTime.now().plusDays(30)
            log.info("主任务未设置截止日期，自动设置为30天后: {}", request.mainTask.endTime)
        }
        
        // 清除之前的用户任务时间映射
        taskScheduler.clearUserExistingTasksMap()
        
        // 收集参与任务的所有用户ID
        val assigneeIds = mutableSetOf<Long?>()
        assigneeIds.add(request.mainTask.assigneeId)
        request.subTasks.forEach { subTask ->
            if (subTask.assigneeId != null) {
                assigneeIds.add(subTask.assigneeId)
            }
        }
        
        // 查询这些用户的现有任务
        val now = OffsetDateTime.now()
        val futureDate = now.plusDays(90) // 查询90天内的任务
        
        // 使用响应式流式编程加载所有用户的现有任务
        return Flux.fromIterable(assigneeIds.filterNotNull())
            .flatMap { userId ->
                // 查询用户现有的任务（不包括当前项目）
                taskService.findUserAssignedTasks(userId, now, futureDate, request.projectId)
                    .doOnNext { task ->
                        log.debug("注册用户[{}]的现有任务: {} ({} - {})", 
                                userId, task.title, task.startTime, task.dueDate)
                        taskScheduler.addUserExistingTask(userId, task.startTime!!, task.dueDate!!)
                    }
                    .doOnComplete {
                        log.info("用户[{}]的现有任务加载完成", userId)
                    }
                    .then(Mono.just(userId))
            }
            .collectList()
            .flatMap { userIds ->
                log.info("所有用户[{}]的现有任务加载完毕，开始计算任务时间", userIds)
                
                // 用户任务全部加载完毕后，在响应式流中调用 TaskScheduler 计算时间
                Mono.fromCallable { 
                    taskScheduler.arrangeTaskSchedule(request)
                    log.info("完成任务时间安排，项目ID={}", request.projectId)
                    request
                }
            }
    }

    /**
     * 创建任务（包含主任务和子任务）
     *
     * @param request 创建任务请求
     * @return 创建的主任务ID
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.TASK_CREATE,
        projectIdParam = "request.projectId"
    )
    fun createTask(request: CreateTaskRequest): Mono<Long> {
        log.info("创建任务，请求参数={}", request)

        return securityUtils.withCurrentUserId { userId ->
            // 先调用arrangeTaskSchedule安排任务时间
            // 这一步确保在创建任务之前任务时间已经安排好
            log.info("在创建任务前先安排任务时间，项目ID={}", request.projectId)
            arrangeTaskSchedule(request)
                .doOnSuccess { _ -> log.info("任务时间安排完毕，开始创建任务") }
                .flatMap { arrangedRequest ->
                    // 创建主任务
                    val mainTask = arrangedRequest.mainTask
                    // 创建主任务，注意：TaskService.createTask 只支持 startTime 参数，不支持 endTime
                    val createMainTaskMono = taskService.createTask(
                                projectId = arrangedRequest.projectId,
                                title = mainTask.name,
                                description = mainTask.description,
                                assigneeId = mainTask.assigneeId,
                                creatorId = userId,
                                priorityScore = mainTask.priorityScore,
                                startTime = null // 主任务不设置开始时间，只用 endTime 来倒排子任务
                            )

                            // 如果没有子任务，直接返回主任务ID
                            if (arrangedRequest.subTasks.isEmpty()) {
                                return@flatMap createMainTaskMono
                            }

                            // 创建主任务并获取ID
                            createMainTaskMono.flatMap { mainTaskId ->
                                // 如果有截止日期，更新主任务的截止日期
                                val updateTaskMono = if (mainTask.endTime != null) {
                                    taskService.updateTask(
                                        taskId = mainTaskId,
                                        title = null,
                                        description = null,
                                        assigneeId = null,
                                        statusId = null,
                                        priorityId = null,
                                        dueDate = mainTask.endTime
                                    ).then(Mono.just(mainTaskId))
                                } else {
                                    Mono.just(mainTaskId)
                                }

                                // 更新完成后，继续创建子任务
                                updateTaskMono.flatMap { updatedMainTaskId ->
                                    // 创建子任务的映射，用于处理依赖关系
                                    val subTaskNameToIdMap = mutableMapOf<String, Long>()
                                    val remainingTasks = arrangedRequest.subTasks.toMutableList()

                                    // 多次递归创建子任务，直到不能再创建更多子任务
                                    fun createPendingTasks(): Mono<Void> {
                                        if (remainingTasks.isEmpty()) {
                                            return Mono.empty()
                                        }

                                        val tasksToCreate = mutableListOf<SubTaskRequest>()
                                        val taskIdsToSkip = mutableListOf<Int>()

                                        // 找出可以创建的子任务
                                        remainingTasks.forEachIndexed { index, subTask ->
                                            val allDependenciesCreated = subTask.dependencies.all { it in subTaskNameToIdMap }
                                            if (subTask.dependencies.isEmpty() || allDependenciesCreated) {
                                                tasksToCreate.add(subTask)
                                                taskIdsToSkip.add(index)
                                            }
                                        }

                                        // 如果没有可创建的子任务了，但还有未创建的子任务，说明存在循环依赖
                                        if (tasksToCreate.isEmpty() && remainingTasks.isNotEmpty()) {
                                            log.warn("检测到循环依赖，强制创建剩余子任务: {}", 
                                                remainingTasks.map { it.name })
                                            
                                            // 强制创建所有剩余任务，忽略依赖关系
                                            return Flux.fromIterable(remainingTasks)
                                                .concatMap { subTask ->
                                                    taskService.createTask(
                                                        projectId = arrangedRequest.projectId,
                                                        title = subTask.name,
                                                        description = subTask.description,
                                                        assigneeId = subTask.assigneeId,
                                                        creatorId = userId,
                                                        parentTaskId = updatedMainTaskId,
                                                        priorityScore = subTask.priorityScore,
                                                        // 忽略无法解析的依赖
                                                        predecessorTaskIds = subTask.dependencies.mapNotNull { subTaskNameToIdMap[it] },
                                                        // 获取计算出的开始时间并确保在工作时间范围内
                                                        startTime = taskScheduler.getTaskStartTime(subTask.name)?.let { 
                                                            taskScheduler.adjustToWorkingHours(it)
                                                        }
                                                    ).flatMap { subTaskId ->
                                                        subTaskNameToIdMap[subTask.name] = subTaskId
                                                        log.info("强制创建子任务成功: {}, ID={}", subTask.name, subTaskId)
                                                        
                                                        // 获取子任务的结束时间并确保在工作时间范围内
                                                        val rawEndTime = taskScheduler.getTaskEndTime(subTask.name)
                                                        val endTime = rawEndTime?.let { taskScheduler.adjustToWorkingHours(it) }
                                                        if (endTime != null) {
                                                            // 更新子任务的截止日期
                                                            taskService.updateTask(
                                                                taskId = subTaskId,
                                                                title = null,
                                                                description = null,
                                                                assigneeId = null,
                                                                statusId = null,
                                                                priorityId = null,
                                                                dueDate = endTime
                                                            ).thenReturn(subTaskId)
                                                        } else {
                                                            Mono.just(subTaskId)
                                                        }
                                                    }
                                                }
                                                .then(Mono.empty())
                                        }

                                        // 按照倒序移除已处理的任务，避免索引变化
                                        taskIdsToSkip.sortedByDescending { it }.forEach { remainingTasks.removeAt(it) }

                                        return Flux.fromIterable(tasksToCreate)
                                            .concatMap { subTask ->
                                                taskService.createTask(
                                                    projectId = arrangedRequest.projectId,
                                                    title = subTask.name,
                                                    description = subTask.description,
                                                    assigneeId = subTask.assigneeId,
                                                    creatorId = userId,
                                                    parentTaskId = updatedMainTaskId,
                                                    priorityScore = subTask.priorityScore,
                                                    predecessorTaskIds = subTask.dependencies.mapNotNull { subTaskNameToIdMap[it] },
                                                    // 获取计算出的开始时间并确保在工作时间范围内
                                                    startTime = taskScheduler.getTaskStartTime(subTask.name)?.let { 
                                                        taskScheduler.adjustToWorkingHours(it)
                                                    }
                                                ).flatMap { subTaskId ->
                                                    // 记录子任务ID
                                                    subTaskNameToIdMap[subTask.name] = subTaskId
                                                    log.info("创建子任务成功: {}, ID={}", subTask.name, subTaskId)
                                                    
                                                    // 获取子任务的结束时间并确保在工作时间范围内
                                                    val rawEndTime = taskScheduler.getTaskEndTime(subTask.name)
                                                    val endTime = rawEndTime?.let { taskScheduler.adjustToWorkingHours(it) }
                                                    if (endTime != null) {
                                                        // 更新子任务的截止日期
                                                        taskService.updateTask(
                                                            taskId = subTaskId,
                                                            title = null,
                                                            description = null,
                                                            assigneeId = null,
                                                            statusId = null,
                                                            priorityId = null,
                                                            dueDate = endTime
                                                        ).thenReturn(subTaskId)
                                                    } else {
                                                        Mono.just(subTaskId)
                                                    }
                                                }
                                            }
                                            .then(Mono.defer { createPendingTasks() }) // 递归处理剩余的子任务
                                    }

                                    // 开始递归创建子任务
                                    createPendingTasks().thenReturn(updatedMainTaskId)
                                }
                            }
                        }
                .doOnSuccess { taskId ->
                    log.info("任务创建成功，项目ID={}，主任务ID={}", request.projectId, taskId)
                }
                .doOnError { e ->
                    log.error("任务创建失败，项目ID={}，错误：{}", request.projectId, e.message, e)
                }
        }
    }

    /**
     * 根据任务ID获取任务对象
     * 
     * @param taskId 任务ID
     * @return 任务领域对象
     */
    @RequireTaskPermission(
        permission = ProjectPermissions.TASK_VIEW,
        taskIdParam = "taskId"
    )
    fun getTaskById(taskId: Long): Mono<Task> {
        log.info("根据ID获取任务，任务ID={}", taskId)
        
        return taskService.findTaskById(taskId)
            .doOnSuccess { task -> 
                log.info("任务获取成功，任务ID={}，标题={}", taskId, task.title)
            }
            .doOnError { e -> 
                log.error("任务获取失败，任务ID={}，错误：{}", taskId, e.message, e)
            }
    }
    
    /**
     * 根据任务ID获取任务可用的状态列表
     * 会获取该任务所属项目的所有可用状态
     *
     * @param taskId 任务ID
     * @return 项目状态列表
     */
    fun getTaskStatuses(taskId: Long): Mono<List<ProjectStatusVO>> {
        log.info("获取任务可用状态列表，任务ID={}", taskId)
        
        return getTaskById(taskId)
            .flatMap { task -> 
                getProjectStatuses(task.projectId)
            }
            .doOnSuccess { statuses -> 
                log.info("任务状态列表获取成功，任务ID={}，状态数量={}", taskId, statuses.size)
            }
            .doOnError { e -> 
                log.error("任务状态列表获取失败，任务ID={}，错误：{}", taskId, e.message, e)
            }
    }
    
    /**
     * 获取项目的状态列表
     * 
     * @param projectId 项目ID
     * @return 项目状态视图对象列表
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.PROJECT_VIEW,
        projectIdParam = "projectId"
    )
    private fun getProjectStatuses(projectId: Long): Mono<List<ProjectStatusVO>> {
        log.info("获取项目状态列表，项目ID={}", projectId)
        
        // 调用领域服务获取项目状态列表
        return projectService.getAllProjectStatuses(projectId)
            .map { projectStatus -> 
                // 将领域对象转换为视图对象
                ProjectStatusVO(
                    id = projectStatus.id,
                    name = projectStatus.name,
                    color = projectStatus.color,
                    order = projectStatus.displayOrder
                )
            }
            .collectList()
            .doOnSuccess { statuses -> 
                log.info("项目状态列表获取成功，项目ID={}，状态数量={}", projectId, statuses.size)
            }
            .doOnError { e -> 
                log.error("项目状态列表获取失败，项目ID={}，错误：{}", projectId, e.message, e)
            }
    }

    /**
     * 修改任务信息
     * 区分主任务和子任务，并记录变更历史
     *
     * @param request 编辑任务请求
     * @return 无返回数据
     */
    @RequireTaskPermission(
        permission = ProjectPermissions.TASK_EDIT,
        taskIdParam = "request.taskId"
    )
    @ReactiveTransactionalOutbox
    fun editTask(request: EditTaskRequest): Mono<Void> {
        log.info("编辑任务，任务ID={}", request.taskId)

        // 使用SecurityUtils获取当前用户ID
        return securityUtils.getCurrentUserId()
            .flatMap { userId ->
                log.info("在服务层获取到用户ID={}", userId)
                
                // 查询任务，获取项目ID和确定任务类型
                taskService.findTaskById(request.taskId)
                    .flatMap { task ->
                        val isMainTask = task.parentTaskId == null
                        log.info("准备编辑任务，任务ID={}，是否主任务={}", request.taskId, isMainTask)
                        
                        // 创建编辑命令，根据任务类型使用不同的命令
                        taskCommandAssembler.createEditCommandByTaskType(
                            request = request, 
                            task = task, 
                            userId = userId
                        ).flatMap { editCommand ->
                            // 使用命令处理器处理编辑命令
                            log.info("使用命令处理器处理{}的编辑请求，任务id={}",
                                if (isMainTask) "主任务" else "子任务", 
                                request.taskId)
                                
                            taskCommandHandler.handleEditTaskCommand(editCommand)
                        }
                            .then(Mono.empty<Void>())
                    }
                    .doOnSuccess { 
                        log.info("任务编辑成功，任务ID={}", request.taskId)
                    }
                    .doOnError { e ->
                        log.error("任务编辑失败，任务ID={}，错误：{}", request.taskId, e.message, e)
                    }
            }
    }
    
    /**
     * 更新任务状态
     * 接收任务ID和状态更新请求，校验状态转换规则，然后更新任务状态
     * 
     * 注意：这个方法没有使用@RequireTaskPermission注解，
     * 因为它包含复杂的权限逻辑（任务分配者、创建者也可以修改状态）
     * 
     * @param taskId 任务ID
     * @param request 状态更新请求
     * @return 更新后的任务
     */
    fun updateTaskStatus(taskId: Long, request: UpdateTaskStatusRequest): Mono<Task> {
        log.info("开始更新任务状态，任务ID={}，新状态ID={}", taskId, request.statusId)
        
        return securityUtils.withCurrentUserId { userId ->
            taskService.findTaskById(taskId)
                .switchIfEmpty(Mono.error(BusinessException(ResponseCode.DATA_NOT_FOUND, "任务不存在：$taskId")))
                .flatMap { task ->
                    // 1. 先检查状态是否有变化
                    if (task.statusId == request.statusId) {
                        log.info("任务状态未变化，跳过更新，任务ID={}", taskId)
                        return@flatMap Mono.just(task)
                    }
                    
                    // 2. 检查用户是否有权限修改任务状态
                    checkUserCanModifyTaskStatus(userId, task)
                        .flatMap { validatedTask ->
                            // 3. 校验状态转换规则
                            checkStatusTransitionRule(task.projectId, task.statusId, request.statusId)
                                .flatMap { isValid ->
                                    if (isValid) {
                                        // 4. 创建状态变更命令并调用TaskService进行状态更新
                                        val changeStatusCommand = taskCommandAssembler.createChangeStatusCommand(
                                            taskId = taskId,
                                            oldStatusId = task.statusId,
                                            newStatusId = request.statusId,
                                            userId = userId
                                        )
                                        
                                        taskService.updateTaskStatus(changeStatusCommand)
                                    } else {
                                        Mono.error(BusinessException(ResponseCode.OPERATION_FAILED, "不允许的状态转换：从状态ID ${task.statusId} 到状态ID ${request.statusId}"))
                                    }
                                }
                        }
                }
                .doOnSuccess { log.info("任务状态更新成功，任务ID={}", taskId) }
                .doOnError { e -> log.error("任务状态更新失败，任务ID={}，错误：{}", taskId, e.message, e) }
        }
    }
    
    /**
     * 创建任务（包含主任务和子任务）
     * 集成了验证、规范化、时间安排和任务创建的整个流程
     * 
     * @param request 创建任务请求
     * @return 创建的主任务ID
     */
    @RequireProjectPermission(
        permission = ProjectPermissions.TASK_CREATE,
        projectIdParam = "request.projectId"
    )
    fun create(request: CreateTaskRequest): Mono<Long> {
        log.info("开始创建任务流程，项目ID={}，主任务={}，子任务数量={}", 
                 request.projectId, request.mainTask.name, request.subTasks.size)
        
        return securityUtils.withCurrentUserId { userId ->
            // 1. 验证和规范化任务请求
            validateAndNormalizeTaskRequest(request)
                .timeout(Duration.ofSeconds(10))  // 添加超时限制
                .flatMap { (normalizedRequest) ->
                    // 2. 安排任务时间
                    arrangeTaskSchedule(normalizedRequest)
                        .timeout(Duration.ofSeconds(15))  // 添加超时限制
                        .flatMap { arrangedRequest ->
                            // 3. 创建任务
                            createTask(arrangedRequest)
                                .timeout(Duration.ofSeconds(20))  // 添加超时限制
                        }
                }
                .doOnSuccess { taskId ->
                    log.info("任务创建成功，项目ID={}，主任务ID={}", request.projectId, taskId)
                }
                .doOnError { e ->
                    log.error("任务创建失败，项目ID={}，错误：{}", request.projectId, e.message, e)
                }
                // 添加全局超时限制，确保连接不会被长时间占用
                .timeout(Duration.ofSeconds(60), Mono.error(RuntimeException("任务创建操作超时，可能存在性能问题")))
                // 添加错误恢复处理，确保连接被释放
                .onErrorResume { e ->
                    log.error("任务创建失败，将释放所有资源，错误：{}", e.message, e)
                    // 传播错误，但确保所有资源被释放
                    Mono.error(e)
                }
        }
    }

    /**
     * 验证和规范化任务请求
     * 包括确保主任务有截止日期、验证任务依赖关系等
     *
     * @param request 创建任务请求
     * @return 带有验证结果和规范化请求的对象
     */
    private fun validateAndNormalizeTaskRequest(request: CreateTaskRequest): Mono<Pair<CreateTaskRequest, List<String>>> {
        val normalizedRequest = request.copy()
        
        // 确保主任务有截止日期，如果没有设置则使用当前时间加30天
        if (normalizedRequest.mainTask.endTime == null) {
            normalizedRequest.mainTask.endTime = OffsetDateTime.now().plusDays(30)
            log.info("主任务未设置截止日期，自动设置为30天后: {}", normalizedRequest.mainTask.endTime)
        }
        
        // 验证子任务依赖关系
        val invalidDependencies = validateTaskDependencies(normalizedRequest.subTasks)
        if (invalidDependencies.isNotEmpty()) {
            log.warn("发现无效的任务依赖关系: {}", invalidDependencies)
        }
        
        return Mono.just(Pair(normalizedRequest, invalidDependencies))
    }
    
    /**
     * 验证任务依赖关系
     * 检查是否有无效的依赖（如依赖不存在的任务）
     *
     * @param subTasks 子任务列表
     * @return 无效依赖列表
     */
    fun validateTaskDependencies(subTasks: List<SubTaskRequest>): List<String> {
        val taskNames = subTasks.map { it.name }.toSet()
        val invalidDependencies = mutableListOf<String>()
        
        for (task in subTasks) {
            for (dep in task.dependencies) {
                if (dep !in taskNames) {
                    invalidDependencies.add("${task.name} -> $dep (不存在)")
                }
            }
        }
        
        return invalidDependencies
    }

    /**
     * 检查用户是否有权限修改任务状态
     * 基于RBAC模型：检查用户是否为任务的被分配者、任务创建者或拥有任务编辑权限
     * 
     * 这是复杂权限逻辑，无法用简单的注解替代，因此保留手动检查
     *
     * @param userId 用户ID
     * @param task 任务对象
     * @return 如果用户有权限，返回包含任务对象的Mono；否则抛出异常
     */
    private fun checkUserCanModifyTaskStatus(userId: Long, task: Task): Mono<Task> {
        // 1. 检查用户是否为任务的被分配者
        if (task.assigneeId == userId) {
            log.debug("用户是任务的被分配者，有权限修改任务状态，用户ID={}，任务ID={}", userId, task.id)
            return Mono.just(task)
        }
        
        // 2. 检查用户是否为任务创建者
        if (task.creatorId == userId) {
            log.debug("用户是任务创建者，有权限修改任务状态，用户ID={}，任务ID={}", userId, task.id)
            return Mono.just(task)
        }
        
        // 3. 基于RBAC检查用户是否有任务编辑权限
        return accessControlService.hasProjectPermission(userId, task.projectId, ProjectPermissions.TASK_EDIT)
            .flatMap { hasPermission ->
                if (hasPermission) {
                    log.debug("用户具有任务编辑权限，有权限修改任务状态，用户ID={}，任务ID={}", userId, task.id)
                    Mono.just(task)
                } else {
                    log.warn("用户无权修改任务状态，用户ID={}，任务ID={}，任务被分配者ID={}", 
                        userId, task.id, task.assigneeId)
                    Mono.error(BusinessException(ResponseCode.INSUFFICIENT_PERMISSIONS, "用户无权限修改任务状态"))
                }
            }
            .onErrorResume { e ->
                when (e) {
                    is BusinessException -> Mono.error(e)
                    else -> {
                        log.error("检查用户权限时出错，用户ID={}，任务ID={}，错误：{}", userId, task.id, e.message, e)
                        Mono.error(BusinessException(ResponseCode.OPERATION_FAILED, "检查用户权限时出错"))
                    }
                }
            }
    }

    /**
     * 校验状态转换规则
     * 检查从当前状态到目标状态的转换是否允许
     * 直接从t_project_status_transition表中获取状态转换规则
     * 
     * @param projectId 项目ID
     * @param fromStatusId 当前状态ID
     * @param toStatusId 目标状态ID
     * @return 是否允许转换的布尔值
     */
    private fun checkStatusTransitionRule(projectId: Long, fromStatusId: Long, toStatusId: Long): Mono<Boolean> {
        // 如果当前状态和目标状态相同，直接返回true
        if (fromStatusId == toStatusId) {
            log.info("状态未发生变化，当前状态和目标状态相同：{}", fromStatusId)
            return Mono.just(true)
        }
        
        log.info("校验状态转换规则，项目ID={}，从状态ID={}到状态ID={}", projectId, fromStatusId, toStatusId)
        
        // 直接从 projectService 获取项目状态转换规则，并过滤出匹配的规则
        return projectService.getProjectStatusTransitions(projectId)
            .filter { transition -> 
                transition.fromStatusId == fromStatusId && transition.toStatusId == toStatusId && transition.isEnabled
            }
            .hasElements()
            .flatMap { hasTransition ->
                if (hasTransition) {
                    log.info("状态转换校验通过，项目ID={}，从状态ID={}转换到状态ID={}", 
                        projectId, fromStatusId, toStatusId)
                    Mono.just(true)
                } else {
                    log.warn("状态转换被拒绝，项目ID={}，没有从状态ID={}到状态ID={}的转换规则", 
                        projectId, fromStatusId, toStatusId)
                    Mono.just(false)
                }
            }
            .onErrorResume { e ->
                log.error("状态转换规则校验过程中出错: {}", e.message, e)
                // 采用严格策略，出错时拒绝转换
                Mono.just(false)
            }
    }
}

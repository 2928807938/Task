package com.task.application.utils

import com.task.application.request.CreateTaskRequest
import com.task.application.request.SubTaskRequest
import org.slf4j.LoggerFactory
import java.time.DayOfWeek
import java.time.Month
import java.time.OffsetDateTime
import java.time.temporal.ChronoUnit
import java.util.concurrent.ConcurrentHashMap

/**
 * 任务调度器
 * 负责根据主任务截止时间、子任务依赖关系和人员分配安排任务时间
 */
class TaskScheduler {
    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 存储子任务名称到时间安排的映射
     * 这允许我们在不修改SubTaskRequest类的情况下存储计算结果
     */
    private val taskTimeMap = ConcurrentHashMap<String, TaskSchedule>()
    
    /**
     * 获取子任务的开始时间
     * 
     * @param taskName 子任务名称
     * @return 开始时间，如果未找到则返回null
     */
    fun getTaskStartTime(taskName: String): OffsetDateTime? {
        return taskTimeMap[taskName]?.startTime
    }
    
    /**
     * 获取子任务的结束时间
     * 
     * @param taskName 子任务名称
     * @return 结束时间，如果未找到则返回null
     */
    fun getTaskEndTime(taskName: String): OffsetDateTime? {
        return taskTimeMap[taskName]?.endTime
    }
    
    /**
     * 获取当前或指定日期的工作开始时间（9:00）
     * 如果给定的日期不是工作日，则返回下一个工作日的开始时间
     * 
     * @param date 日期时间，如不提供则使用当前时间
     * @return 工作开始时间
     */
    fun getWorkStartTime(date: OffsetDateTime = OffsetDateTime.now()): OffsetDateTime {
        // 如果不是工作日，找下一个工作日
        val workDate = if (!isWorkDay(date)) getNextWorkDay(date) else date
        
        // 设置为上午9点
        return workDate.withHour(9).withMinute(0).withSecond(0).withNano(0)
    }
    
    /**
     * 获取当前或指定日期的工作结束时间（18:00）
     * 如果给定的日期不是工作日，则返回下一个工作日的结束时间
     * 
     * @param date 日期时间，如不提供则使用当前时间
     * @return 工作结束时间
     */
    fun getWorkEndTime(date: OffsetDateTime = OffsetDateTime.now()): OffsetDateTime {
        // 如果不是工作日，找下一个工作日
        val workDate = if (!isWorkDay(date)) getNextWorkDay(date) else date
        
        // 设置为下午18点
        return workDate.withHour(18).withMinute(0).withSecond(0).withNano(0)
    }
    
    /**
     * 判断指定日期是否为工作日
     * 工作日定义：非周末且非法定节假日
     * 
     * @param date 需要检查的日期
     * @return 如果是工作日返回true，否则返回false
     */
    fun isWorkDay(date: OffsetDateTime): Boolean {
        val dayOfWeek = date.dayOfWeek
        
        // 首先检查是否为周末
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return false
        }
        
        // 检查是否为法定节假日
        return !isHoliday(date)
    }
    
    /**
     * 获取工作日的开始时间（9:00）
     * 如果给定的日期不是工作日，则会返回下一个工作日的开始时间
     * 
     * @param date 需要获取开始时间的日期
     * @return 工作日的开始时间（9:00）
     */
    fun getWorkDayStartTime(date: OffsetDateTime): OffsetDateTime {
        // 如果不是工作日，找下一个工作日
        val workDate = if (!isWorkDay(date)) getNextWorkDay(date) else date
        
        // 设置为上午9点
        return workDate.withHour(9).withMinute(0).withSecond(0).withNano(0)
    }
    
    /**
     * 获取工作日的结束时间（18:00）
     * 如果给定的日期不是工作日，则会返回下一个工作日的结束时间
     * 
     * @param date 需要获取结束时间的日期
     * @return 工作日的结束时间（18:00）
     */
    fun getWorkDayEndTime(date: OffsetDateTime): OffsetDateTime {
        // 如果不是工作日，找下一个工作日
        val workDate = if (!isWorkDay(date)) getNextWorkDay(date) else date
        
        // 设置为下午18点
        return workDate.withHour(18).withMinute(0).withSecond(0).withNano(0)
    }
    
    /**
     * 计算任务结束日期
     * 考虑工作日和工作时间，计算持续指定小时数的任务何时结束
     * 
     * @param startTime 开始时间
     * @param hours 持续时间（小时）
     * @return 结束时间
     */
    fun calculateEndDate(startTime: OffsetDateTime, hours: Double): OffsetDateTime {
        return calculateTaskEndTime(startTime, hours)
    }
    
    /**
     * 获取下一个工作日
     * 如果当前日期是工作日，则返回下一个工作日
     * 如果当前日期不是工作日，则返回下一个工作日
     * 
     * @param date 起始日期
     * @return 下一个工作日的日期
     */
    fun getNextWorkDay(date: OffsetDateTime): OffsetDateTime {
        var nextDay = date.plusDays(1)
        
        // 跳过周末和节假日，找到下一个工作日
        while (!isWorkDay(nextDay)) {
            nextDay = nextDay.plusDays(1)
        }
        
        return nextDay
    }
    
    /**
     * 判断指定日期是否为法定节假日
     * 包含中国主要法定节假日（元旦、春节、清明、劳动节、端午、中秋、国庆）
     * 
     * @param date 需要检查的日期
     * @return 如果是节假日返回true，否则返回false
     */
    fun isHoliday(date: OffsetDateTime): Boolean {
        val localDate = date.toLocalDate()
        val month = localDate.month
        val dayOfMonth = localDate.dayOfMonth
        
        // 元旦（1月1日）
        if (month == Month.JANUARY && dayOfMonth == 1) {
            return true
        }
        
        // 春节假期（农历新年，这里使用公历近似值：1月底或2月初的7天）
        if ((month == Month.JANUARY && dayOfMonth >= 25) || 
            (month == Month.FEBRUARY && dayOfMonth <= 8)) {
            return true
        }
        
        // 清明节（4月4日前后）
        if (month == Month.APRIL && dayOfMonth >= 3 && dayOfMonth <= 5) {
            return true
        }
        
        // 劳动节（5月1日-5日）
        if (month == Month.MAY && dayOfMonth >= 1 && dayOfMonth <= 5) {
            return true
        }
        
        // 端午节（农历五月初五，公历大约6月中旬）
        if (month == Month.JUNE && dayOfMonth >= 10 && dayOfMonth <= 12) {
            return true
        }
        
        // 中秋节（农历八月十五，公历大约9月中下旬）
        if (month == Month.SEPTEMBER && dayOfMonth >= 15 && dayOfMonth <= 18) {
            return true
        }
        
        // 国庆节（10月1日-7日）
        if (month == Month.OCTOBER && dayOfMonth >= 1 && dayOfMonth <= 7) {
            return true
        }
        
        return false
    }
    
    /**
     * 计算任务结束时间
     * 考虑工作日、8小时工作制以及9:00-18:00工作时间
     * 
     * @param startTime 开始时间（必须在工作时间内）
     * @param hours 需要的工作小时数（业务时长）
     * @return 计算出的结束时间
     */
    fun calculateTaskEndTime(startTime: OffsetDateTime, hours: Double): OffsetDateTime {
        log.debug("开始计算任务结束时间: 开始时间={}, 业务时长={}小时", startTime, hours)
        
        if (hours <= 0) {
            log.debug("业务时长为0，直接返回开始时间")
            return startTime
        }
        
        // 确保开始时间在工作时间内
        var currentTime = adjustToWorkingHours(startTime)
        if (currentTime != startTime) {
            log.debug("开始时间不在工作时间内，已调整为: {}", currentTime)
        }
        
        var remainingHours = hours
        
        // 计算当天剩余工作时间
        val workEndTime = getWorkEndTime(currentTime)
        val hoursLeftInDay = ChronoUnit.MINUTES.between(currentTime, workEndTime) / 60.0
        log.debug("当天剩余工作时间: {}小时（{} - {})", hoursLeftInDay, currentTime, workEndTime)
        
        // 如果当天剩余时间足以完成任务
        if (hoursLeftInDay >= remainingHours) {
            val endTime = currentTime.plusMinutes((remainingHours * 60).toLong())
            log.debug("当天剩余时间足够，计算结束时间: {}", endTime)
            return endTime
        }
        
        // 先使用当天剩余时间
        log.debug("当天剩余时间不足，先使用{}小时，剩余{}小时需要安排到下一个工作日", 
                 hoursLeftInDay, remainingHours - hoursLeftInDay)
        remainingHours -= hoursLeftInDay
        currentTime = workEndTime
        
        // 处理跨天的工作时间
        while (remainingHours > 0) {
            // 移到下一个工作日
            val nextWorkDay = getNextWorkDay(currentTime)
            currentTime = getWorkStartTime(nextWorkDay)
            log.debug("移动到下一个工作日: {}, 开始时间: {}", nextWorkDay.toLocalDate(), currentTime)
            
            // 一天有8小时工作时间
            val workHoursInDay = 8.0
            
            if (remainingHours <= workHoursInDay) {
                // 最后一天
                val endTime = currentTime.plusMinutes((remainingHours * 60).toLong())
                log.debug("最后一天，使用{}小时，结束时间: {}", remainingHours, endTime)
                currentTime = endTime
                remainingHours = 0.0
            } else {
                // 还需要多个工作日
                currentTime = getWorkEndTime(currentTime)
                log.debug("使用整个工作日（8小时），当前时间推移到: {}", currentTime)
                remainingHours -= workHoursInDay
            }
        }
        
        log.debug("最终计算结果: 任务开始于{}，结束于{}，业务时长{}小时", startTime, currentTime, hours)
        return currentTime
    }
    
    /**
     * 清除所有存储的时间信息
     * 应该在每次新的任务创建请求前调用
     */
    fun clearTimeMap() {
        taskTimeMap.clear()
    }

    /**
     * 任务时间安排信息
     */
    /**
     * 任务时间安排数据类
     * @param startTime 任务开始时间（物理时间，在工作时间9:00-18:00范围内）
     * @param endTime 任务结束时间（物理时间，在工作时间9:00-18:00范围内）
     * @param businessHours 业务时长（小时），表示完成任务所需的实际工作小时数
     */
    data class TaskSchedule(
        val startTime: OffsetDateTime,
        val endTime: OffsetDateTime,
        val businessHours: Double = 0.0 // 业务时长（小时）
    )

    /**
     * 保存用户已有任务时间的映射
     * key: 用户ID, value: 该用户已有的任务时间段列表
     */
    private val userExistingTasksMap = ConcurrentHashMap<Long?, MutableList<TaskSchedule>>()
    
    /**
     * 添加用户已有的任务时间段
     * 外部系统可以调用此方法注册用户已有的任务
     * 
     * @param userId 用户ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     */
    fun addUserExistingTask(userId: Long?, startTime: OffsetDateTime, endTime: OffsetDateTime) {
        if (userId == null) return
        
        val tasks = userExistingTasksMap.getOrPut(userId) { mutableListOf() }
        tasks.add(TaskSchedule(startTime, endTime))
    }
    
    /**
     * 清除用户已有任务的时间段映射
     */
    fun clearUserExistingTasksMap() {
        userExistingTasksMap.clear()
    }
    
    /**
     * 安排任务时间
     * 从当前日期向后规划任务时间，考虑工作日、工时限制和资源冲突
     *
     * @param request 原始创建任务请求
     * @return 原始请求(计算结果存储在内部map中)
     */
    fun arrangeTaskSchedule(request: CreateTaskRequest): CreateTaskRequest {
        // 清除之前的计算结果
        clearTimeMap()
        
        // 如果没有子任务，则不需要处理
        if (request.subTasks.isEmpty()) {
            log.info("无需安排任务时间：无子任务")
            return request
        }
        
        try {
            // 获取当前时间作为规划起点
            val startDateTime = getWorkDayStartTime(OffsetDateTime.now())
            val mainEndTime = request.mainTask.endTime
            
            log.info("开始规划任务时间，当前时间: {}, 主任务截止时间: {}", startDateTime, mainEndTime)
            
            // 构建任务依赖图
            val graph = buildDependencyGraph(request.subTasks)
            // 构建反向依赖图（任务 -> 前置任务列表）
            val reverseGraph = buildReverseGraph(graph)
            // 计算每个任务所需的时间
            val taskDurations = calculateTaskDurations(request.subTasks)
            
            // 从前向后安排任务时间
            val taskSchedules = scheduleTasksForward(
                reverseGraph, 
                taskDurations, 
                startDateTime, 
                mainEndTime,
                request.subTasks
            )
            
            // 考虑人员资源限制和已有任务调整任务时间
            adjustForExistingTasksAndResourceConstraints(taskSchedules, request.subTasks, graph, taskDurations)
            
            // 检查是否有任务超出主任务截止时间
            if (mainEndTime != null) {
                val overdueTasks = checkTimeConstraints(taskSchedules, mainEndTime)
                if (overdueTasks.isNotEmpty()) {
                    log.warn("发现{}个任务可能无法在主任务截止日期前完成", overdueTasks.size)
                }
            }
            
            // 将计算结果保存到内部映射中
            taskSchedules.forEach { (taskName, schedule) ->
                taskTimeMap[taskName] = schedule
                log.debug("任务[{}]最终时间安排：{} - {}", 
                         taskName, schedule.startTime, schedule.endTime)
            }
            
            log.info("完成任务时间安排：安排了{}个子任务", taskTimeMap.size)
        } catch (e: Exception) {
            log.error("安排任务时间出错：{}", e.message, e)
        }
        
        // 返回原始请求，不修改SubTaskRequest对象
        return request
    }
    
    /**
     * 构建任务依赖图
     * 
     * @param subTasks 子任务列表
     * @return 任务依赖图（任务标识符 -> 依赖于该任务的任务列表）
     *         例如：如果B依赖A，则图中将有A->B的边，表示B依赖于A
     */
    private fun buildDependencyGraph(subTasks: List<SubTaskRequest>): Map<String, List<String>> {
        val graph = mutableMapOf<String, MutableList<String>>()
        val taskIdToNameMap = mutableMapOf<String, String>()
        val taskNameToIdMap = mutableMapOf<String, String>()
        
        // 第一步：建立任务ID与名称的映射
        subTasks.forEach { task ->
            val taskId = task.id ?: task.name // 如果ID为空，则使用名称作为标识符
            taskIdToNameMap[taskId] = task.name
            taskNameToIdMap[task.name] = taskId
            graph[taskId] = mutableListOf()
        }
        
        // 第二步：初始化图，确保所有任务和依赖均在图中
        subTasks.forEach { task ->
            val taskId = task.id ?: task.name
            
            // 确保依赖项也在图中
            task.dependencies.forEach { dependencyName ->
                // 尝试通过名称找到对应的ID
                val dependencyId = taskNameToIdMap[dependencyName] ?: run {
                    // 如果找不到ID，说明这是一个外部依赖，使用名称作为ID
                    dependencyName.also {
                        if (!graph.containsKey(it)) {
                            graph[it] = mutableListOf()
                            log.warn("发现依赖项[{}]不在任务列表中，已自动添加", it)
                        }
                    }
                }
            }
        }
        
        // 第三步：填充依赖关系（如果B依赖A，则A->B）
        subTasks.forEach { task ->
            val taskId = task.id ?: task.name
            
            // 对于每个任务的依赖项，将该任务添加到依赖项的依赖列表中
            task.dependencies.forEach { dependencyName ->
                val dependencyId = taskNameToIdMap[dependencyName] ?: dependencyName
                graph[dependencyId]?.add(taskId)
            }
        }
        
        log.debug("构建依赖图：{}", graph)
        log.debug("任务ID与名称映射：{}", taskIdToNameMap)
        return graph
    }
    
    /**
     * 构建反向依赖图
     * 
     * @param graph 正向依赖图
     * @return 反向依赖图（任务名称 -> 前置任务列表）
     */
    private fun buildReverseGraph(graph: Map<String, List<String>>): Map<String, List<String>> {
        val reverseGraph = mutableMapOf<String, MutableList<String>>()
        
        // 初始化图
        graph.keys.forEach { task ->
            reverseGraph[task] = mutableListOf()
        }
        
        // 填充反向依赖关系
        graph.forEach { (task, dependents) ->
            dependents.forEach { dependent ->
                reverseGraph[dependent]?.add(task)
            }
        }
        
        return reverseGraph
    }
    
    /**
     * 计算任务持续时间（小时）
     * 
     * @param subTasks 子任务列表
     * @return 任务持续时间映射（任务名称 -> 持续时间（小时））
     */
    private fun calculateTaskDurations(subTasks: List<SubTaskRequest>): Map<String, Double> {
        return subTasks.associate { it.name to (it.hours ?: 1.0) }
    }
    
    /**
     * 从前向后安排任务时间
     * 考虑任务依赖关系、工作日和工时限制
     * 严格遵守：
     * 1. 工作时间为9:00-18:00
     * 2. 每天工作8小时
     * 3. 跳过周末和节假日
     * 4. 任务B依赖任务A时，B必须在A完成后开始
     * 
     * @param reverseGraph 反向依赖图（任务标识符 -> 前置任务列表）
     * @param taskDurations 任务持续时间（小时）
     * @param startDateTime 开始时间（当前日期）
     * @param endTime 主任务截止时间
     * @param subTasks 子任务列表
     * @return 任务时间安排
     */
    private fun scheduleTasksForward(
        reverseGraph: Map<String, List<String>>,
        taskDurations: Map<String, Double>,
        startDateTime: OffsetDateTime,
        endTime: OffsetDateTime?,
        subTasks: List<SubTaskRequest>
    ): MutableMap<String, TaskSchedule> {
        // 任务时间安排结果
        val schedules = mutableMapOf<String, TaskSchedule>()
        
        // 记录每个任务的最早可能开始时间
        val earliestStartTimes = mutableMapOf<String, OffsetDateTime>()
        
        // 记录已经安排好的任务
        val scheduledTasks = mutableSetOf<String>()
        
        // 获取所有没有前置依赖的任务（起始任务）
        val startingTasks = subTasks
            .filter { task -> reverseGraph[task.name]?.isEmpty() ?: true }
            .map { it.name }
        
        log.debug("起始任务列表（无前置依赖）：{}", startingTasks)
        
        // 拓扑排序所有任务，确保前置任务先被安排
        val taskOrder = mutableListOf<String>()
        val visited = mutableSetOf<String>()
        val tempVisited = mutableSetOf<String>() // 用于检测循环依赖
        
        // 使用深度优先搜索进行拓扑排序
        // 重要：这里是标准的拓扑排序算法，确保先处理前置任务
        fun dfsTopologicalSort(taskName: String) {
            if (taskName in tempVisited) {
                log.warn("检测到循环依赖，任务：{}", taskName)
                return
            }
            if (taskName in visited) return
            
            tempVisited.add(taskName)
            
            // 递归处理所有前置任务（当前任务依赖的任务）
            val dependencies = reverseGraph[taskName] ?: emptyList()
            log.debug("处理任务[{}]的前置依赖：{}", taskName, dependencies)
            
            // 先递归处理所有前置依赖，确保它们先被安排
            for (dependency in dependencies) {
                dfsTopologicalSort(dependency)
            }
            
            visited.add(taskName)
            tempVisited.remove(taskName)
            taskOrder.add(taskName)
        }
        
        // 从所有起始任务开始拓扑排序
        for (task in startingTasks) {
            if (task !in visited) {
                dfsTopologicalSort(task)
            }
        }
        
        // 确保所有任务都被处理（可能存在无法从起始任务到达的孤立任务组）
        for (task in subTasks.map { it.name }) {
            if (task !in visited) {
                dfsTopologicalSort(task)
            }
        }
        
        log.debug("任务排序结果（考虑依赖关系）：{}", taskOrder)
        
        // 按照拓扑排序结果安排任务时间
        // 拓扑排序确保依赖任务在前置任务之后被处理
        for (taskName in taskOrder) {
            // 获取任务持续时间（小时）
            val duration = taskDurations[taskName] ?: 1.0
            
            // 初始化任务开始时间为计划起始时间
            var taskStartTime = startDateTime
            
            // 获取所有前置依赖任务
            val dependencies = reverseGraph[taskName] ?: emptyList()
            log.debug("计算任务[{}]的开始时间，前置依赖：{}", taskName, dependencies)
            
            // 关键逻辑：确保当前任务的开始时间不早于任何前置依赖任务的结束时间
            for (dependency in dependencies) {
                val depSchedule = schedules[dependency]
                if (depSchedule == null) {
                    log.warn("依赖的任务[{}]还未安排时间！这应该是一个逻辑错误，因为拓扑排序应确保前置任务先被处理", dependency)
                    continue
                }
                
                // 如果依赖任务的结束时间比当前任务的当前计划开始时间晚
                // 则将当前任务的开始时间调整为依赖任务的结束时间
                if (depSchedule.endTime.isAfter(taskStartTime)) {
                    log.debug("任务[{}]的开始时间从{}调整为{}，因为需要等待依赖任务[{}]完成", 
                              taskName, taskStartTime, depSchedule.endTime, dependency)
                    taskStartTime = depSchedule.endTime
                }
            }
            
            // 确保开始时间在工作时间内（9:00 - 18:00）
            val adjustedStartTime = adjustToWorkingHours(taskStartTime)
            if (adjustedStartTime != taskStartTime) {
                log.debug("将任务[{}]的开始时间从{}调整为{}，以符合工作时间", 
                         taskName, taskStartTime, adjustedStartTime)
                taskStartTime = adjustedStartTime
            }
            
            // 计算任务结束时间，考虑工作日、8小时工作制和9:00-18:00工作时间
            val taskEndTime = calculateTaskEndTime(taskStartTime, duration)
            
            // 确保结束时间也在工作时间内
            val adjustedEndTime = adjustToWorkingHours(taskEndTime)
            if (adjustedEndTime != taskEndTime) {
                log.debug("将任务[{}]的结束时间从{}调整为{}，以符合工作时间", 
                         taskName, taskEndTime, adjustedEndTime)
            }
            
            // 添加到任务安排中，并记录业务时长
            schedules[taskName] = TaskSchedule(
                startTime = taskStartTime,
                endTime = adjustedEndTime,
                businessHours = duration
            )
            scheduledTasks.add(taskName)
            log.info("安排任务[{}]：开始={}, 结束={}, 业务时长={}小时", 
                     taskName, taskStartTime, adjustedEndTime, duration)
        }
        
        // 检查所有任务是否能在主任务截止日期前完成
        if (endTime != null) {
            val latestEndTime = schedules.values.maxOfOrNull { it.endTime }
            if (latestEndTime != null && latestEndTime.isAfter(endTime)) {
                log.warn("警告：部分任务无法在主任务截止日期前完成！最晚任务结束时间：{}，主任务截止时间：{}", 
                         latestEndTime, endTime)
            }
        }
        
        return schedules
    }
    
    /**
     * 调整时间到工作时间内
     * 如果时间不在工作时间内，则按以下规则调整：
     * 1. 如果不是工作日（周末或节假日），则调整到下一个工作日的9:00
     * 2. 如果是工作日但时间早9:00前，则调整到当天的9:00
     * 3. 如果是工作日但时间晚于18:00后，则调整到下一个工作日的9:00
     * 
     * 此方法可用于强制调整任意时间点到标准工作时间内
     * 
     * @param time 需要调整的时间
     * @return 调整后的时间（保证在工作日的9:00-18:00之间）
     */
    fun adjustToWorkingHours(time: OffsetDateTime): OffsetDateTime {
        // 如果不是工作日，调整到下一个工作日
        if (!isWorkDay(time)) {
            log.debug("时间[{}]不是工作日，调整到下一个工作日", time)
            return getWorkDayStartTime(getNextWorkDay(time))
        }
        
        // 获取当天的工作开始和结束时间（9:00 和 18:00）
        val workStartTime = getWorkDayStartTime(time)
        val workEndTime = getWorkDayEndTime(time)
        
        // 如果时间在工作时间之前，调整到当天工作开始时间
        if (time.isBefore(workStartTime)) {
            log.debug("时间[{}]在当天工作时间前，调整到当天工作开始时间[{}]", time, workStartTime)
            return workStartTime
        }
        
        // 如果时间在工作时间之后，调整到下一个工作日的开始时间
        if (time.isAfter(workEndTime)) {
            log.debug("时间[{}]在当天工作时间后，调整到下一个工作日开始时间", time)
            return getWorkDayStartTime(getNextWorkDay(time))
        }
        
        // 时间已在工作时间内，无需调整
        log.debug("时间[{}]已在工作时间内，无需调整", time)
        return time
    }
    
    /**
     * 检查是否满足时间约束
     * 检查所有任务是否能在主任务截止时间前完成
     *
     * @param schedules 任务时间安排
     * @param mainTaskEndTime 主任务截止时间
     * @return 超出截止时间的任务列表
     */
    private fun checkTimeConstraints(
        schedules: Map<String, TaskSchedule>,
        mainTaskEndTime: OffsetDateTime
    ): List<String> {
        val overdueTasks = mutableListOf<String>()
        
        for ((taskName, schedule) in schedules) {
            if (schedule.endTime.isAfter(mainTaskEndTime)) {
                overdueTasks.add(taskName)
                log.warn("任务[{}]预计完成时间{}超出主任务截止时间{}", 
                        taskName, schedule.endTime, mainTaskEndTime)
            }
        }
        
        return overdueTasks
    }

    /**
     * 当调整了一个任务的时间后，递归更新所有依赖于该任务的后续任务
     * 确保依赖链上的所有任务时间都能正确更新
     *
     * @param taskName 被调整的任务名称
     * @param newEndTime 新的结束时间
     * @param schedules 任务时间安排
     * @param dependencyGraph 依赖图（任务 -> 依赖于该任务的任务列表）
     * @param taskDurations 任务持续时间
     */
    private fun propagateTimeChanges(
        taskName: String,
        newEndTime: OffsetDateTime,
        schedules: MutableMap<String, TaskSchedule>,
        dependencyGraph: Map<String, List<String>>,
        taskDurations: Map<String, Double>
    ) {
        // 获取所有依赖于当前任务的后续任务
        val dependentTasks = dependencyGraph[taskName] ?: return
        
        for (dependentTask in dependentTasks) {
            val schedule = schedules[dependentTask] ?: continue
            
            // 如果后续任务开始时间早于当前任务结束时间，需要调整
            if (schedule.startTime.isBefore(newEndTime)) {
                // 调整开始时间
                val newStartTime = adjustToWorkingHours(newEndTime)
                
                // 计算新的结束时间
                val duration = taskDurations[dependentTask] ?: 
                    ChronoUnit.HOURS.between(schedule.startTime, schedule.endTime).toDouble()
                val newTaskEndTime = calculateEndDate(newStartTime, duration)
                
                // 更新任务时间
                schedules[dependentTask] = TaskSchedule(
                    startTime = newStartTime,
                    endTime = newTaskEndTime,
                    businessHours = duration
                )
                
                log.debug("更新依赖任务[{}]的时间：{} -> {}", 
                         dependentTask, schedule.startTime, newStartTime)
                
                // 递归更新后续所有依赖任务
                propagateTimeChanges(dependentTask, newTaskEndTime, schedules, dependencyGraph, taskDurations)
            }
        }
    }

    /**
     * 考虑用户现有任务和资源限制调整任务时间
     * 确保同一个人分配的任务不能并行执行
     * 并且考虑用户已有的任务安排
     * 
     * @param schedules 初始任务时间安排
     * @param subTasks 子任务列表
     * @param dependencyGraph 任务依赖图（可选）
     * @param taskDurations 任务持续时间（可选）
     */
    private fun adjustForExistingTasksAndResourceConstraints(
        schedules: MutableMap<String, TaskSchedule>,
        subTasks: List<SubTaskRequest>,
        dependencyGraph: Map<String, List<String>>? = null,
        taskDurations: Map<String, Double>? = null
    ) {
        // 构建任务到负责人的映射
        val taskToAssigneeMap = subTasks.associate { it.name to it.assigneeId }
        
        // 记录被调整的任务，用于后续依赖传播
        val adjustedTasks = mutableMapOf<String, OffsetDateTime>()
        
        // 按负责人分组任务
        val assigneeTasks = mutableMapOf<Long?, MutableList<Pair<String, TaskSchedule>>>()        
    
        // 将任务按负责人分组
        for ((taskName, schedule) in schedules) {
            val assigneeId = taskToAssigneeMap[taskName]
            val tasks = assigneeTasks.getOrPut(assigneeId) { mutableListOf() }
            tasks.add(taskName to schedule)
        }
        
        // 按团队成员处理资源冲突
        for ((assigneeId, tasks) in assigneeTasks) {
            // 如果负责人未分配或只分配了一个任务，无需处理
            if (assigneeId == null || tasks.size <= 1) continue
            
            log.debug("处理负责人[{}]的任务安排：{}个任务", assigneeId, tasks.size)
            
            // 首先将用户现有的任务时间段添加到列表中
            val existingTasks = userExistingTasksMap[assigneeId] ?: emptyList()
            val allTimeSlots = mutableListOf<Pair<String, TaskSchedule>>()
            
            // 添加现有任务（使用特殊标记"EXISTING"）
            for (existingTask in existingTasks) {
                allTimeSlots.add("EXISTING" to existingTask)
            }
            
            // 添加新任务
            allTimeSlots.addAll(tasks)
            
            // 按开始时间排序
            val sortedTasks = allTimeSlots.sortedBy { it.second.startTime }
            
            // 处理时间冲突
            for (i in 1 until sortedTasks.size) {
                val prevTask = sortedTasks[i-1]
                val currTask = sortedTasks[i]
                
                // 如果前一个是现有任务，不能移动，必须调整当前任务
                val needAdjust = prevTask.second.endTime.isAfter(currTask.second.startTime)
                
                if (needAdjust) {
                    // 只能调整新任务，不能调整现有任务
                    if (currTask.first != "EXISTING") {
                        val taskName = currTask.first
                        val duration = ChronoUnit.MINUTES.between(
                            currTask.second.startTime, 
                            currTask.second.endTime
                        )
                        
                        // 调整开始时间到前置任务结束时间之后
                        val newStartTime = adjustToWorkingHours(prevTask.second.endTime)
                        
                        // 计算新的结束时间
                        val taskDuration = schedules[taskName]?.let {
                            ChronoUnit.HOURS.between(it.startTime, it.endTime).toDouble()
                        } ?: 1.0
                        
                        val rawEndTime = calculateEndDate(newStartTime, taskDuration)
                        
                        // 确保结束时间也在工作时间范围内
                        val newEndTime = adjustToWorkingHours(rawEndTime)
                        log.debug("调整任务[{}]的结束时间：{} -> {}", taskName, rawEndTime, newEndTime)
                        
                        // 更新任务时间安排，并记录业务时长
                        schedules[taskName] = TaskSchedule(
                            startTime = newStartTime, 
                            endTime = newEndTime,
                            businessHours = taskDuration
                        )
                        
                        log.debug("调整任务[{}]时间，避免与现有任务冲突：{} -> {}", 
                                 taskName, currTask.second.startTime, newStartTime)
                        
                        // 记录被调整的任务及其新的结束时间
                        adjustedTasks[taskName] = newEndTime
                    }
                }
            }
        }
        
        // 如果提供了依赖图和任务持续时间，为每个调整过的任务传播时间变更
        if (dependencyGraph != null && taskDurations != null && adjustedTasks.isNotEmpty()) {
            log.debug("开始传播时间变更，共有{}个任务被调整", adjustedTasks.size)
            
            // 为每个被调整的任务传播时间变更
            for ((taskName, endTime) in adjustedTasks) {
                propagateTimeChanges(taskName, endTime, schedules, dependencyGraph, taskDurations)
            }
        }
    }
}

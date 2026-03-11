package com.task.web.client.controller

import com.task.application.request.*
import com.task.application.service.RequirementAnalysisApplicationService
import com.task.application.service.TaskApplicationService
import com.task.application.service.TaskAssignmentApplicationService
import com.task.application.vo.*
import com.task.shared.api.response.ApiResponse
import com.task.shared.api.response.PageData
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import java.time.Duration
import java.util.*

/**
 * 任务管理控制器
 * 提供任务相关的API接口，包括项目的CRUD操作
 */
@RestController
@RequestMapping("/api/client/task")
class TaskController (
        private val taskApplicationService: TaskApplicationService,
        private val requirementAnalysisService: RequirementAnalysisApplicationService,
        private val taskAssignmentService: TaskAssignmentApplicationService,
){
    private val log = LoggerFactory.getLogger(TaskController::class.java)

    /**
     * 获取项目任务列表
     *
     * @param projectId 项目ID
     * @param request 获取项目任务列表请求
     * @return 分页任务列表
     */
    @GetMapping("/{projectId}")
    fun getProjectTasks(
        @PathVariable projectId: Long,
        @ModelAttribute request: GetProjectTasksRequest
    ): Mono<ApiResponse<PageData<TaskVO>>> {
        return taskApplicationService.getProjectTasks(projectId, request)
            .map { ApiResponse.success(it) }
    }

    /**
     * 流式分析需求
     * 返回逐字生成的文本流
     */
    @PostMapping("/analyze/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun analyzeRequirementStreamPost(
        @RequestBody @Valid request: RequirementAnalysisRequest
    ): Flux<LlmResultVO> {
        return analyzeRequirementStreamInternal(request)
    }

    /**
     * 流式分析需求（兼容旧版GET调用）
     */
    @GetMapping("/analyze/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun analyzeRequirementStream(@Validated request: RequirementAnalysisRequest): Flux<LlmResultVO> {
        return analyzeRequirementStreamInternal(request)
    }

    private fun analyzeRequirementStreamInternal(request: RequirementAnalysisRequest): Flux<LlmResultVO> {
        return requirementAnalysisService.analyzeRequirementStream(request)
            .publishOn(Schedulers.parallel())
            .delayElements(Duration.ofMillis(5))
            .onBackpressureBuffer(256)
    }

    /**
     * 根据任务ID查询任务详情
     *
     * @param taskId 任务ID
     * @return 任务详情
     */
    @GetMapping("/{taskId}/detail")
    fun getTaskDetail(@PathVariable taskId: Long): Mono<ApiResponse<TaskDetailVO>> {
        return taskApplicationService.getTaskDetail(taskId)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 根据主任务ID查询主任务及其所有子任务的详细信息
     * 如果指定的任务是子任务，则会查找其父任务及所有相关子任务
     *
     * @param taskId 任务ID
     * @return 包含主任务详情和所有子任务详情的完整信息
     */
    @GetMapping("/{taskId}/with-subtasks")
    fun getTaskWithSubtasks(@PathVariable taskId: Long): Mono<ApiResponse<TaskWithSubtasksVO>> {
        return taskApplicationService.getTaskWithSubtasks(taskId)
            .map { ApiResponse.success(it) }
    }

    /**
     *
     * 根据主任务截止时间安排子任务的开始时间，考虑依赖关系和人员资源限制
     *
     * @param request 创建任务请求
     * @return 创建的主任务ID
     */
    @PostMapping("/create")
    fun create(
        @RequestBody @Valid request: CreateTaskRequest
    ): Mono<ApiResponse<Long>> {
        log.info("接收到创建任务请求，项目ID={}，主任务={}，子任务数量={}", 
                 request.projectId, request.mainTask.name, request.subTasks.size)
        
        // 调用应用层服务的集成create方法，处理整个任务创建流程
        return taskApplicationService.create(request)
            .map { ApiResponse.success(it) }
            .doOnSuccess { response ->
                log.info("任务创建成功，返回主任务ID={}", response.data)
            }
            .doOnError { e ->
                log.error("任务创建失败: {}", e.message, e)
            }
    }
    
    /**
     * 流式智能分配任务
     * 调用外部API进行任务分配处理，以流式方式返回结果
     *
     * @param request 任务分配请求
     * @return 任务分配结果流
     */
    @PostMapping("/assign/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun assignTaskStream(
        @RequestBody @Valid request: TaskAssignmentRequest
    ): Flux<LlmResultVO> {
        // 使用LlmResultVO作为返回类型，与analyzeRequirementStream保持一致
        val apiResponseFlow = taskAssignmentService.assignTaskStream(request)
            .publishOn(Schedulers.parallel())
            .delayElements(Duration.ofMillis(5))
            .onBackpressureBuffer(256)
            
        // 创建分析完成消息
        val completeEvent = Flux.just(
            LlmResultVO(content = "分析完成", type = -2, success = true)
        )
        
        // 合并API响应流和完成消息
        return Flux.concat(apiResponseFlow, completeEvent)
    }

    /**
     * 修改任务信息
     * 区分主任务和子任务，并记录变更历史
     *
     * @param request 编辑任务请求
     * @return 无返回数据
     */
    @PostMapping("/edit")
    fun editTask(
        @RequestBody @Valid request: EditTaskRequest
    ): Mono<ApiResponse<Void>> {
        return taskApplicationService.editTask(request)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 根据任务ID查询任务可用的状态列表
     * 会获取该任务所属项目的所有可用状态
     *
     * @param taskId 任务ID
     * @return 项目状态列表
     */
    @GetMapping("/{taskId}/statuses")
    fun getTaskStatuses(@PathVariable taskId: Long): Mono<ApiResponse<List<ProjectStatusVO>>> {
        return taskApplicationService.getTaskStatuses(taskId)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 修改任务状态
     * 接收任务ID和目标状态ID，校验状态转换规则，然后更新任务状态
     * 
     * @param taskId 任务ID
     * @param request 更新状态请求
     * @return 无返回数据
     */
    @PostMapping("/{taskId}/status")
    fun updateTaskStatus(
        @PathVariable taskId: Long,
        @RequestBody @Valid request: UpdateTaskStatusRequest
    ): Mono<ApiResponse<Void>> {
        log.info("接收到更新任务状态请求，任务ID={}，目标状态ID={}", 
            taskId, request.statusId)
        
        return taskApplicationService.updateTaskStatus(taskId, request)
            .then(Mono.just(ApiResponse.success()))
    }
}

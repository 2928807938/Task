package com.task.web.client.controller

import com.task.application.request.*
import com.task.application.service.ProjectApplicationService
import com.task.application.vo.*
import com.task.shared.api.response.ApiResponse
import com.task.shared.api.response.PageData
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/**
 * 项目管理控制器
 * 提供项目相关的API接口，包括项目的CRUD操作和成员管理
 */
@RestController
@RequestMapping("/api/client/project")
class ProjectController(
    private val projectApplicationService: ProjectApplicationService
) {
    /**
     * 获取当前用户项目列表（分页）
     * 
     * @param request 获取项目列表请求
     * @return 项目列表分页数据
     */
    @GetMapping("/currentUserPage")
    fun currentUserPage(@Validated request: GetProjectsRequest): Mono<ApiResponse<PageData<ProjectVO>>> {
        return projectApplicationService.currentUserPage(request)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 创建项目
     * 
     * @param request 创建项目请求
     * @return 创建的项目
     */
    @PostMapping("/create")
    fun create(@RequestBody @Validated request: CreateProjectRequest): Mono<ApiResponse<Void>> {
        return projectApplicationService.createProject(request)
            .map { ApiResponse.success() }
    }

    /**
     * 删除项目
     * 
     * @param id 项目ID
     * @return 操作结果
     */
    @PostMapping("/delete/{id}")
    fun delete(@PathVariable id: Long): Mono<ApiResponse<Void>> {
        return projectApplicationService.deleteProject(id)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 添加项目成员
     * 
     * @param id 项目ID
     * @param request 添加项目成员请求
     * @return 更新后的项目
     */
    @PostMapping("/addMember/{id}")
    fun addMember(
        @PathVariable id: Long,
        @RequestBody request: AddProjectMemberRequest
    ): Mono<ApiResponse<Void>> {
        return projectApplicationService.addProjectMember(id, request.userId)
            .then(Mono.fromCallable { ApiResponse.success() })
    }
    
    /**
     * 移除项目成员
     * 
     * @param id 项目ID
     * @param request 移除项目成员请求
     * @return 操作结果
     */
    @PostMapping("/removeMember/{id}")
    fun removeMember(
        @PathVariable id: Long,
        @RequestBody request: RemoveProjectMemberRequest
    ): Mono<ApiResponse<Void>> {
        return projectApplicationService.removeProjectMember(id, request.userId)
            .then(Mono.fromCallable { ApiResponse.success() })
    }
    
    /**
     * 获取项目优先级体系
     *
     * @param id 项目ID
     * @return 项目优先级体系列表
     */
    @GetMapping("/{id}/priority-system")
    fun getPrioritySystem(@PathVariable id: Long): Mono<ApiResponse<List<PrioritySystemVO>>> {
        return projectApplicationService.getProjectPrioritySystem(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 获取项目详情
     * 返回项目的完整详细信息，包括项目基本信息、团队信息、任务列表和成员列表等
     * 
     * @param id 项目ID，路径参数，项目的唯一标识符
     * @return 包含项目详细信息的ApiResponse，状态码200表示成功，包含ProjectDetailVO数据
     * @throws IllegalArgumentException 当项目不存在时抛出
     * @throws SecurityException 当用户没有权限访问该项目时抛出
     */
    @GetMapping("/detail/{id}")
    fun detail(@PathVariable id: Long): Mono<ApiResponse<ProjectDetailVO>> {
        return projectApplicationService.getProjectDetail(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 查询项目成员列表
     * 支持按成员名称模糊查询，返回成员ID和成员名
     * 
     * @param request 请求参数
     * @return 项目成员简化列表，只包含ID和名称
     */
    @GetMapping("/members")
    fun getProjectMembers(
        @Validated request: GetProjectMembersRequest
    ): Mono<ApiResponse<List<ProjectMemberSimpleVO>>> {
        return projectApplicationService.getProjectMembers(request)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 获取项目任务分布数据
     * 包括任务优先级分布和任务状态分布
     *
     * @param id 项目ID
     * @return 任务分布数据
     */
    @GetMapping("/{id}/task-distribution")
    fun getTaskDistribution(@PathVariable id: Long): Mono<ApiResponse<TaskDistributionVO>> {
        return projectApplicationService.getTaskDistribution(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 获取项目任务状态趋势数据
     * 根据时间范围统计项目中不同状态的任务数量随时间的变化
     *
     * @param request 任务趋势请求对象，包含项目ID和时间范围
     * @return 任务状态趋势视图对象
     */
    @GetMapping("/task-status-trend")
    fun getTaskStatusTrend(@Validated request: TaskTrendRequest): Mono<ApiResponse<TaskStatusTrendVO>> {
        return projectApplicationService.getTaskStatusTrend(request)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 获取项目状态列表
     * 返回所有可用的项目状态，包括ID、名称和颜色
     * 项目状态是系统级别的，但需要项目ID进行权限检查
     *
     * @param id 项目ID
     * @return 项目状态列表
     */
    @GetMapping("/{id}/status/list")
    fun getProjectStatusList(@PathVariable id: Long): Mono<ApiResponse<List<ProjectStatusVO>>> {
        return projectApplicationService.getProjectStatusList(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 设置项目归档状态
     * 通过请求体中的archived字段控制要设置的归档状态
     *
     * @param id 项目ID
     * @param request 归档状态请求，包含状态和原因
     * @return 操作成功响应
     */
    @PostMapping("/{id}/archive-status")
    fun setArchiveStatus(
        @PathVariable id: Long,
        @RequestBody request: ProjectArchiveStatusRequest
    ): Mono<ApiResponse<Void>> {
        return projectApplicationService.setProjectArchiveStatus(id, request.archived, request.reason)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 获取项目优先级列表
     * 返回项目中所有可用的优先级，包括ID、名称、级别和分数
     *
     * @param id 项目ID
     * @return 项目优先级列表
     */
    @GetMapping("/{id}/priority/list")
    fun getProjectPriorityList(@PathVariable id: Long): Mono<ApiResponse<List<PrioritySystemVO>>> {
        return projectApplicationService.getProjectPrioritySystem(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 更新项目基本信息
     * 支持更新项目名称和描述
     *
     * @param id 项目ID
     * @param request 更新项目基本信息请求
     * @return 操作结果
     */
    @PostMapping("/{id}/update")
    fun updateProject(
        @PathVariable id: Long,
        @RequestBody @Validated request: UpdateProjectBasicInfoRequest
    ): Mono<ApiResponse<Void>> {
        return projectApplicationService.updateProject(id, request)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 获取项目角色列表
     * 返回项目中所有可用的角色，包括ID、名称、描述等信息
     *
     * @param id 项目ID
     * @return 项目角色列表
     */
    @GetMapping("/{id}/roles")
    fun getProjectRoles(@PathVariable id: Long): Mono<ApiResponse<List<ProjectRoleVO>>> {
        return projectApplicationService.getProjectRoles(id)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 创建项目角色
     * 只有项目管理员或所有者可以创建角色
     *
     * @param id 项目ID
     * @param request 创建项目角色请求
     * @return 创建的角色信息
     */
    @PostMapping("/{id}/role/create")
    fun createProjectRole(
        @PathVariable id: Long,
        @RequestBody @Validated request: CreateProjectRoleRequest
    ): Mono<ApiResponse<ProjectRoleVO>> {
        return projectApplicationService.createProjectRole(id, request)
            .map { ApiResponse.success(it) }
    }
}

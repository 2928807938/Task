package com.task.web.client.controller

import com.task.application.request.*
import com.task.application.service.TeamApplicationService
import com.task.application.vo.*
import com.task.shared.api.response.ApiResponse
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/**
 * 团队控制器
 * 提供团队相关的API接口
 */
@RestController
@RequestMapping("/api/client/team")
class TeamController(
    private val teamApplicationService: TeamApplicationService
) {

    /**
     * 获取团队首页综合数据
     *
     * @param request 团队首页请求
     * @return 团队首页综合数据
     */
    @GetMapping("/{teamId}/homepage")
    fun getTeamHomePage(
        @Validated request: TeamHomePageRequest
    ): Mono<ApiResponse<TeamHomePageVO>> {
        return teamApplicationService.getTeamHomePage(request.teamId)
            .map { ApiResponse.success(it) }
    }

    /**
     * 获取团队概览信息
     *
     * @param request 团队概览请求
     * @return 团队概览数据
     */
    @GetMapping("/{teamId}/overview")
    fun getTeamOverview(
        @Validated request: TeamOverviewRequest
    ): Mono<ApiResponse<TeamOverviewVO>> {
        return teamApplicationService.getTeamOverview(request.teamId)
            .map { ApiResponse.success(it) }
    }

    /**
     * 获取团队活跃度热力图数据
     *
     * @param request 团队活跃度热力图请求
     * @return 热力图数据点列表
     */
    @GetMapping("/{teamId}/activity-heatmap")
    fun getTeamActivityHeatmap(
        @Validated request: TeamActivityHeatmapRequest
    ): Mono<ApiResponse<List<ActivityHeatmapPointVO>>> {
        return teamApplicationService.getTeamActivityHeatmap(
            request.teamId, 
            request.startDate, 
            request.endDate
        ).map { ApiResponse.success(it) }
    }

    /**
     * 获取团队部门结构
     *
     * @param request 团队部门结构请求
     * @return 部门结构树
     */
    @GetMapping("/{teamId}/department-structure")
    fun getTeamDepartmentStructure(
        @Validated request: TeamDepartmentStructureRequest
    ): Mono<ApiResponse<List<DepartmentVO>>> {
        return teamApplicationService.getTeamDepartmentStructure(request.teamId)
            .map { ApiResponse.success(it) }
    }

    /**
     * 获取最近沟通记录
     *
     * @param request 最近沟通记录请求
     * @return 沟通记录列表
     */
    @GetMapping("/{teamId}/recent-communications")
    fun getRecentCommunicationRecords(
        @Validated request: RecentCommunicationRecordsRequest
    ): Mono<ApiResponse<List<CommunicationRecordVO>>> {
        return teamApplicationService.getRecentCommunicationRecords(
            request.teamId, 
            request.limit
        ).map { ApiResponse.success(it) }
    }
    
    /**
     * 获取当前用户团队列表
     * 
     * @param request 团队搜索请求
     * @return 团队简要信息列表，只包含团队的ID、名称和描述
     */
    @GetMapping("/my-teams")
    fun getCurrentUserTeams(
        @Validated request: TeamSearchRequest
    ): Mono<ApiResponse<List<TeamSimpleVO>>> {
        return teamApplicationService.getCurrentUserTeams(request.keyword)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 创建团队
     * 
     * @param request 创建团队请求
     * @return 创建的团队信息
     */
    @PostMapping("/create")
    fun createTeam(
        @Validated @RequestBody request: CreateTeamRequest
    ): Mono<ApiResponse<TeamSimpleVO>> {
        return teamApplicationService.createTeam(request)
            .map { ApiResponse.success(it) }
    }
    
    /**
     * 获取团队成员列表
     * 
     * @param request 获取团队成员请求
     * @return 团队成员列表
     */
    @GetMapping("/{teamId}/members")
    fun getTeamMembers(
        @Validated request: GetTeamMembersRequest
    ): Mono<ApiResponse<List<TeamMemberVO>>> {
        return teamApplicationService.getTeamMembers(request.teamId, request.memberName)
            .map { ApiResponse.success(it) }
    }
}
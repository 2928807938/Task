package com.task.application.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.task.application.request.TaskAssignmentRequest
import com.task.application.service.analyzer.ApiRequestHelper
import com.task.application.vo.LlmResultVO
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.llm.LlmResultTypeEnum
import com.task.domain.model.project.ProjectMember
import com.task.domain.repository.ProjectMemberRepository
import com.task.domain.repository.ProjectRoleRepository
import com.task.domain.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 任务分配应用服务
 * 处理任务分配相关的业务逻辑
 */
@Service
class TaskAssignmentApplicationService(
    private val apiRequestHelper: ApiRequestHelper,
    private val projectMemberRepository: ProjectMemberRepository,
    private val userRepository: UserRepository,
    private val projectRoleRepository: ProjectRoleRepository,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    
    /**
     * 处理流式任务分配请求
     * 查询项目成员信息并进行任务分配
     *
     * @param request 任务分配请求
     * @param projectId 项目ID
     * @return 流式任务分配结果，使用LlmResultVO格式
     */
    fun assignTaskStream(request: TaskAssignmentRequest): Flux<LlmResultVO> {
        logger.info("处理流式任务分配请求: {}", request.description)
        
        // 1. 查询项目成员信息
        return getProjectMembersWithDetails(request.projectId)
            .flatMapMany { membersInfo ->
                if (membersInfo.isEmpty()) {
                    logger.warn("项目{}没有成员信息", request.projectId)
                    return@flatMapMany Flux.just(LlmResultVO(content = "项目没有成员信息，无法分配任务", success = false, type = LlmResultTypeEnum.ANALYSIS_ERROR.code))
                }
                
                logger.info("成功获取项目成员信息，成员数量: {}", membersInfo.size)
                
                // 2. 根据成员信息和任务描述进行任务分配（这里只是示例逻辑，后续可以扩展）
                processTaskAssignment(request.projectId, request.description, membersInfo)
            }
            .onErrorResume { e ->
                logger.error("任务分配过程中发生错误: {}", e.message, e)
                Flux.just(LlmResultVO(content = "任务分配失败: ${e.message}", success = false, type = LlmResultTypeEnum.ANALYSIS_ERROR.code))
            }
    }
    
    /**
     * 获取项目成员详细信息，包括用户信息和角色信息
     * 
     * @param projectId 项目ID
     * @return 包含成员详情的数据类列表
     */
    private fun getProjectMembersWithDetails(projectId: Long): Mono<List<ProjectMemberDetail>> {
        logger.info("开始获取项目ID={}的成员详情", projectId)
        
        return projectMemberRepository.list {
                fieldOf(ProjectMember::projectId, ComparisonOperator.EQUALS, projectId)
            }
            .flatMap { member ->
                // 获取用户详细信息
                val userMono = userRepository.findById(member.userId)
                
                // 获取角色信息
                val roleMono = projectRoleRepository.findById(member.roleId)
                
                // 组合用户和角色信息
                Mono.zip(userMono, roleMono)
                    .map { tuple ->
                        val user = tuple.t1
                        val role = tuple.t2
                        
                        ProjectMemberDetail(
                            userId = user.id!!,
                            roleName = role.name,
                        )
                    }
            }
            .collectList()
            .doOnSuccess { members ->
                logger.info("成功获取项目ID={}的成员详情，共{}名成员", projectId, members.size)
            }
            .onErrorResume { e ->
                logger.error("获取项目成员详情失败: projectId={}, 错误: {}", projectId, e.message, e)
                Mono.just(emptyList())
            }
    }
    
    /**
     * 处理任务分配
     * 根据任务描述和成员信息调用外部API进行任务分配
     * 
     * @param taskDescription 任务描述
     * @param members 项目成员列表
     * @return 任务分配结果流，使用LlmResultVO格式
     */
    private fun processTaskAssignment(
        projectId: Long,
        taskDescription: String, 
        members: List<ProjectMemberDetail>
    ): Flux<LlmResultVO> {
        logger.info("开始处理任务分配，任务描述：{}", taskDescription)
        
        // 将成员信息转换为JSON字符串
        val membersJson = objectMapper.writeValueAsString(members)
        logger.debug("成员信息JSON: {}", membersJson)
        
        // 构建请求载荷
        val payload = mapOf(
            "project_id" to projectId,
            "user_input" to taskDescription,
            "comprehensive_analysis" to taskDescription,
            "team_member" to membersJson
        )
        
        // 创建分析开始的标记消息
        val startEvent = Flux.just(LlmResultVO(
            content = "分析开始",
            success = true,
            type = LlmResultTypeEnum.ANALYSIS_STARTED.code
        ))
        
        // 使用ApiRequestHelper发送流式请求
        val apiResponseFlow = apiRequestHelper.postStream("任务规划", payload)
            .map { response -> 
                // 这里可以添加对响应的处理逻辑，例如解析JSON
                logger.debug("收到API响应: {}", response)
                LlmResultVO(
                    content = response,
                    success = true,
                    type = LlmResultTypeEnum.ASSIGN_TASK.code
                )
            }
            
        // 合并开始事件和API响应流，分析完成消息将在Controller中添加
        return Flux.concat(startEvent, apiResponseFlow)
    }
    
    /**
     * 项目成员详情数据类
     * 包含用户信息和角色信息
     */
    data class ProjectMemberDetail(
        val userId: Long,
        val roleName: String
    )
}

package com.task.domain.model.project.state

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.project.ProjectStatus
import com.task.domain.model.project.ProjectStatusMapping
import com.task.domain.model.project.ProjectStatusTransition
import com.task.domain.repository.ProjectRepository
import com.task.domain.repository.ProjectStatusMappingRepository
import com.task.domain.repository.ProjectStatusRepository
import com.task.domain.repository.ProjectStatusTransitionRepository
import com.task.domain.state.DynamicStateMachine
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 项目状态机工厂
 * 
 * 负责创建和管理项目状态机实例
 */
@Component
class ProjectStateMachineFactory(
    private val projectRepository: ProjectRepository,
    private val statusRepository: ProjectStatusRepository,
    private val statusMappingRepository: ProjectStatusMappingRepository,
    private val transitionRepository: ProjectStatusTransitionRepository,
    private val actionExecutor: ProjectStateActionExecutor
) {
    private val logger = LoggerFactory.getLogger(ProjectStateMachineFactory::class.java)
    
    /**
     * 获取项目状态机
     * 
     * @param projectId 项目ID
     * @return 项目状态机实例
     */
    fun getProjectStateMachine(projectId: Long): Mono<DynamicStateMachine<Long, String, ProjectStateContext>> {
        return projectRepository.findById(projectId)
            .switchIfEmpty(Mono.error(IllegalArgumentException("项目不存在: $projectId")))
            .flatMap { project ->
                // 获取项目当前所有状态
                getProjectCurrentStatus(projectId)
                    .collectList()
                    .flatMap { currentStatuses ->
                        if (currentStatuses.isEmpty()) {
                            return@flatMap Mono.error<DynamicStateMachine<Long, String, ProjectStateContext>>(
                                IllegalStateException("项目没有有效状态，项目ID: $projectId")
                            )
                        }
                        
                        // 选择最新的状态作为当前状态（按ID降序）
                        val primaryStatus = currentStatuses.maxByOrNull { it.id }
                            ?: return@flatMap Mono.error<DynamicStateMachine<Long, String, ProjectStateContext>>(
                                IllegalStateException("项目状态无法确定，项目ID: $projectId")
                            )
                        
                        logger.info("获取到项目主要状态，项目ID={}，状态ID={}，状态名称={}，共{}\u4e2a状态", 
                            projectId, primaryStatus.id, primaryStatus.name, currentStatuses.size)
                        
                        // 获取所有项目状态
                        statusRepository.list<ProjectStatus> {}
                            .collectList()
                            .flatMap { statuses ->
                                // 获取所有状态转换规则
                                transitionRepository.list<ProjectStatusTransition> {}
                                    .collectList()
                                    .map { transitions ->
                                        buildStateMachine(primaryStatus.id, statuses, transitions)
                                    }
                            }
                    }
            }
    }
    
    /**
     * 获取项目当前状态
     * 
     * @param projectId 项目ID
     * @return 项目当前状态列表
     */
    private fun getProjectCurrentStatus(projectId: Long): Flux<ProjectStatus> {
        logger.info("获取项目当前状态，项目ID={}", projectId)
        
        // 1. 先从项目状态映射表中查询所有状态映射，获取statusId列表
        return statusMappingRepository.list {
            fieldOf(ProjectStatusMapping::projectId, ComparisonOperator.EQUALS, projectId)
        }
        .collectList()
        .flatMapMany { mappings ->
            if (mappings.isEmpty()) {
                return@flatMapMany Flux.error<ProjectStatus>(IllegalStateException("项目状态映射不存在，项目ID: $projectId"))
            }
            
            // 提取所有状态ID
            val statusIds = mappings.mapNotNull { it.statusId }
            logger.info("项目状态ID列表，项目ID={}，状态ID数量={}，状态ID={}", 
                projectId, statusIds.size, statusIds)
            
            if (statusIds.isEmpty()) {
                return@flatMapMany Flux.error<ProjectStatus>(IllegalStateException("项目状态ID列表为空，项目ID: $projectId"))
            }
            
            // 2. 通过statusId列表一次性查询所有状态
            statusRepository.list {
                fieldOf(ProjectStatus::id, ComparisonOperator.IN, statusIds)
            }
            .doOnNext { status -> 
                logger.info("找到项目状态，项目ID={}，状态ID={}，状态名称={}", 
                    projectId, status.id, status.name)
            }
            .switchIfEmpty(Flux.error(IllegalStateException("没有找到项目的有效状态，项目ID: $projectId")))
        }
    }
    
    /**
     * 构建项目状态机
     * 
     * @param currentStatusId 当前状态ID
     * @param statuses 所有项目状态
     * @param transitions 所有状态转换规则
     * @return 项目状态机实例
     */
    private fun buildStateMachine(
        currentStatusId: Long,
        statuses: List<ProjectStatus>,
        transitions: List<ProjectStatusTransition>
    ): DynamicStateMachine<Long, String, ProjectStateContext> {
        logger.info("构建项目状态机，当前状态ID: {}", currentStatusId)
        
        // 创建状态机构建器
        val builder = DynamicStateMachine.builder<Long, String, ProjectStateContext>(currentStatusId)
        
        // 添加状态转换规则
        transitions.filter { it.isEnabled }.forEach { transition ->
            builder.addEventTransition(
                fromState = transition.fromStatusId,
                event = transition.eventCode,
                toState = transition.toStatusId,
                guard = { context ->
                    if (transition.guardCondition != null) {
                        actionExecutor.evaluateCondition(transition.guardCondition, context)
                    } else {
                        true
                    }
                },
                action = { context ->
                    if (transition.actionCode != null) {
                        actionExecutor.executeAction(transition.actionCode, context).subscribe()
                    }
                }
            )
        }
        
        // 添加状态进入和退出动作
        statuses.forEach { status ->
            // 这里可以根据状态的特性添加通用的进入和退出动作
            builder.onEntry(status.id!!) { context ->
                logger.info("进入状态: {}，项目ID: {}", status.name, context.projectId)
                // 可以添加通用的状态进入动作
            }
            
            builder.onExit(status.id!!) { context ->
                logger.info("退出状态: {}，项目ID: {}", status.name, context.projectId)
                // 可以添加通用的状态退出动作
            }
        }
        
        return builder.build()
    }
}

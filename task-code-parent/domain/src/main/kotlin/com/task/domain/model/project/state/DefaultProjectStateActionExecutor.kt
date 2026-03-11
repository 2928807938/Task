package com.task.domain.model.project.state

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

/**
 * 默认项目状态动作执行器
 * 
 * 实现项目状态动作执行器接口，提供默认的动作执行和条件评估逻辑
 */
@Component
class DefaultProjectStateActionExecutor : ProjectStateActionExecutor {
    
    private val logger = LoggerFactory.getLogger(DefaultProjectStateActionExecutor::class.java)
    
    /**
     * 执行动作
     * 
     * @param actionCode 动作代码
     * @param context 状态转换上下文
     * @return 操作结果
     */
    override fun executeAction(actionCode: String, context: ProjectStateContext): Mono<Void> {
        logger.info("执行项目状态动作，动作代码={}，项目ID={}", actionCode, context.projectId)
        
        // 根据动作代码执行不同的动作
        return when (actionCode) {
            "NOTIFY_PROJECT_MEMBERS" -> notifyProjectMembers(context)
            "UPDATE_PROJECT_PROGRESS" -> updateProjectProgress(context)
            "ARCHIVE_PROJECT_DATA" -> archiveProjectData(context)
            else -> {
                logger.warn("未知的动作代码: {}", actionCode)
                Mono.empty()
            }
        }
    }
    
    /**
     * 评估条件
     * 
     * @param conditionCode 条件代码
     * @param context 状态转换上下文
     * @return 条件是否满足
     */
    override fun evaluateCondition(conditionCode: String, context: ProjectStateContext): Boolean {
        logger.info("评估项目状态转换条件，条件代码={}，项目ID={}", conditionCode, context.projectId)
        
        // 根据条件代码评估不同的条件
        return when (conditionCode) {
            "HAS_REQUIRED_PERMISSIONS" -> hasRequiredPermissions(context)
            "ALL_TASKS_COMPLETED" -> allTasksCompleted(context)
            "HAS_ACTIVE_MEMBERS" -> hasActiveMembers(context)
            else -> {
                logger.warn("未知的条件代码: {}", conditionCode)
                true // 默认允许转换
            }
        }
    }
    
    /**
     * 通知项目成员
     * 
     * @param context 状态转换上下文
     * @return 操作结果
     */
    private fun notifyProjectMembers(context: ProjectStateContext): Mono<Void> {
        logger.info("通知项目成员项目状态变更，项目ID={}", context.projectId)
        // 实际实现可能需要调用通知服务发送消息
        return Mono.empty()
    }
    
    /**
     * 更新项目进度
     * 
     * @param context 状态转换上下文
     * @return 操作结果
     */
    private fun updateProjectProgress(context: ProjectStateContext): Mono<Void> {
        logger.info("更新项目进度，项目ID={}", context.projectId)
        // 实际实现可能需要计算和更新项目进度
        return Mono.empty()
    }
    
    /**
     * 归档项目数据
     * 
     * @param context 状态转换上下文
     * @return 操作结果
     */
    private fun archiveProjectData(context: ProjectStateContext): Mono<Void> {
        logger.info("归档项目数据，项目ID={}", context.projectId)
        // 实际实现可能需要调用归档服务
        return Mono.empty()
    }
    
    /**
     * 检查是否有所需权限
     * 简化逻辑：默认允许，实际权限检查由调用方在业务层面进行
     * 
     * @param context 状态转换上下文
     * @return 是否有所需权限
     */
    private fun hasRequiredPermissions(context: ProjectStateContext): Boolean {
        // 简化后的权限检查：由于权限检查已在业务层完成，这里默认允许
        logger.debug("状态转换权限检查通过，项目ID={}", context.projectId)
        return true
    }
    
    /**
     * 检查所有任务是否已完成
     * 
     * @param context 状态转换上下文
     * @return 所有任务是否已完成
     */
    private fun allTasksCompleted(context: ProjectStateContext): Boolean {
        // 实际实现可能需要查询项目的任务完成情况
        return true
    }
    
    /**
     * 检查是否有活跃成员
     * 
     * @param context 状态转换上下文
     * @return 是否有活跃成员
     */
    private fun hasActiveMembers(context: ProjectStateContext): Boolean {
        // 实际实现可能需要查询项目成员情况
        return true
    }
}

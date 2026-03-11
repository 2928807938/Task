package com.task.domain.model.project.state

import reactor.core.publisher.Mono

/**
 * 项目状态动作执行器接口
 * 
 * 用于执行项目状态转换时的动作和评估条件
 */
interface ProjectStateActionExecutor {
    /**
     * 执行动作
     * 
     * @param actionCode 动作代码
     * @param context 状态转换上下文
     * @return 操作结果
     */
    fun executeAction(actionCode: String, context: ProjectStateContext): Mono<Void>
    
    /**
     * 评估条件
     * 
     * @param conditionCode 条件代码
     * @param context 状态转换上下文
     * @return 条件是否满足
     */
    fun evaluateCondition(conditionCode: String, context: ProjectStateContext): Boolean
}

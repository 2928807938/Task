package com.task.domain.state

import org.slf4j.LoggerFactory
import java.util.concurrent.ConcurrentHashMap

/**
 * 动态状态机
 * 
 * 用于管理基于ID或字符串的状态转换，适用于从数据库动态加载的状态
 * 支持事件驱动的状态转换和状态转换历史记录
 * 
 * @param S 状态类型，通常是 Long 或 String
 * @param E 事件类型，通常是 String
 * @param C 上下文类型
 */
class DynamicStateMachine<S : Any, E : Any, C : Any> private constructor(
    private var currentState: S,
    private val transitions: MutableMap<S, MutableMap<S, StateTransition<S, E, C>>>,
    private val eventTransitions: MutableMap<S, MutableMap<E, S>>,
    private val stateEntryActions: MutableMap<S, MutableList<(C) -> Unit>>,
    private val stateExitActions: MutableMap<S, MutableList<(C) -> Unit>>,
    private val transitionHistory: MutableList<TransitionRecord<S, E>>
) {
    private val logger = LoggerFactory.getLogger(DynamicStateMachine::class.java)

    /**
     * 状态转换记录
     * 用于记录状态机的转换历史
     */
    data class TransitionRecord<S : Any, E : Any>(
        val fromState: S,
        val toState: S,
        val event: E?,
        val timestamp: Long = System.currentTimeMillis()
    )

    /**
     * 状态转换定义
     * 包含状态转换的条件和动作
     */
    data class StateTransition<S : Any, E : Any, C : Any>(
        val fromState: S,
        val toState: S,
        val event: E? = null,
        val guard: ((C) -> Boolean)? = null,
        val action: ((C) -> Unit)? = null
    )

    /**
     * 获取当前状态
     */
    fun getCurrentState(): S = currentState

    /**
     * 获取状态转换历史记录
     */
    fun getTransitionHistory(): List<TransitionRecord<S, E>> = transitionHistory.toList()

    /**
     * 触发状态转换
     * 
     * @param toState 目标状态
     * @param context 状态转换上下文
     * @throws IllegalStateTransitionException 如果状态转换不合法
     */
    @Synchronized
    fun transitionTo(toState: S, context: C) {
        if (!canTransitionTo(toState)) {
            val errorMsg = "非法状态转换: ${currentState} -> ${toState}"
            logger.error(errorMsg)
            throw IllegalStateTransitionException(errorMsg)
        }

        val transition = transitions[currentState]!![toState]!!
        
        // 检查转换条件
        if (transition.guard != null && !transition.guard.invoke(context)) {
            val errorMsg = "状态转换条件不满足: ${currentState} -> ${toState}"
            logger.error(errorMsg)
            throw IllegalStateTransitionException(errorMsg)
        }

        logger.info("执行状态转换: {} -> {}", currentState, toState)
        
        // 执行退出动作
        stateExitActions[currentState]?.forEach { action ->
            try {
                action.invoke(context)
            } catch (e: Exception) {
                logger.error("执行状态退出动作时发生错误: {}", e.message, e)
            }
        }
        
        val fromState = currentState
        
        // 执行转换动作
        try {
            transition.action?.invoke(context)
        } catch (e: Exception) {
            logger.error("执行状态转换动作时发生错误: {}", e.message, e)
        }
        
        // 更新当前状态
        currentState = toState
        
        // 记录转换历史
        transitionHistory.add(TransitionRecord(fromState, toState, transition.event))
        
        // 执行进入动作
        stateEntryActions[toState]?.forEach { action ->
            try {
                action.invoke(context)
            } catch (e: Exception) {
                logger.error("执行状态进入动作时发生错误: {}", e.message, e)
            }
        }
    }

    /**
     * 通过事件触发状态转换
     * 
     * @param event 触发事件
     * @param context 状态转换上下文
     * @throws IllegalStateTransitionException 如果事件不能触发状态转换
     */
    @Synchronized
    fun trigger(event: E, context: C) {
        val toState = eventTransitions[currentState]?.get(event)
            ?: throw IllegalStateTransitionException("当前状态 ${currentState} 无法响应事件 ${event}")
        
        transitionTo(toState, context)
    }

    /**
     * 检查是否可以转换到指定状态
     * 
     * @param toState 目标状态
     * @return 是否可以转换
     */
    fun canTransitionTo(toState: S): Boolean {
        return transitions.containsKey(currentState) && transitions[currentState]?.containsKey(toState) == true
    }

    /**
     * 检查当前状态是否可以响应指定事件
     * 
     * @param event 事件
     * @return 是否可以响应
     */
    fun canHandle(event: E): Boolean {
        return eventTransitions.containsKey(currentState) && eventTransitions[currentState]?.containsKey(event) == true
    }

    /**
     * 状态机构建器
     */
    class Builder<S : Any, E : Any, C : Any>(private val initialState: S) {
        private val transitions = ConcurrentHashMap<S, MutableMap<S, StateTransition<S, E, C>>>()
        private val eventTransitions = ConcurrentHashMap<S, MutableMap<E, S>>()
        private val stateEntryActions = ConcurrentHashMap<S, MutableList<(C) -> Unit>>()
        private val stateExitActions = ConcurrentHashMap<S, MutableList<(C) -> Unit>>()

        /**
         * 添加状态转换规则
         * 
         * @param fromState 起始状态
         * @param toState 目标状态
         * @param guard 转换条件
         * @param action 转换动作
         * @return 构建器实例
         */
        fun addTransition(
            fromState: S,
            toState: S,
            guard: ((C) -> Boolean)? = null,
            action: ((C) -> Unit)? = null
        ): Builder<S, E, C> {
            transitions.computeIfAbsent(fromState) { ConcurrentHashMap() }[toState] =
                StateTransition(fromState, toState, null, guard, action)
            return this
        }

        /**
         * 添加事件驱动的状态转换规则
         * 
         * @param fromState 起始状态
         * @param event 触发事件
         * @param toState 目标状态
         * @param guard 转换条件
         * @param action 转换动作
         * @return 构建器实例
         */
        fun addEventTransition(
            fromState: S,
            event: E,
            toState: S,
            guard: ((C) -> Boolean)? = null,
            action: ((C) -> Unit)? = null
        ): Builder<S, E, C> {
            // 添加状态转换定义
            transitions.computeIfAbsent(fromState) { ConcurrentHashMap() }[toState] =
                StateTransition(fromState, toState, event, guard, action)
            
            // 添加事件映射
            eventTransitions.computeIfAbsent(fromState) { ConcurrentHashMap() }[event] = toState
            
            return this
        }

        /**
         * 添加状态进入动作
         * 
         * @param state 状态
         * @param action 进入动作
         * @return 构建器实例
         */
        fun onEntry(state: S, action: (C) -> Unit): Builder<S, E, C> {
            stateEntryActions.computeIfAbsent(state) { mutableListOf() }.add(action)
            return this
        }

        /**
         * 添加状态退出动作
         * 
         * @param state 状态
         * @param action 退出动作
         * @return 构建器实例
         */
        fun onExit(state: S, action: (C) -> Unit): Builder<S, E, C> {
            stateExitActions.computeIfAbsent(state) { mutableListOf() }.add(action)
            return this
        }

        /**
         * 构建状态机实例
         * 
         * @return 状态机实例
         */
        fun build(): DynamicStateMachine<S, E, C> {
            return DynamicStateMachine(
                initialState,
                transitions,
                eventTransitions,
                stateEntryActions,
                stateExitActions,
                mutableListOf()
            )
        }
    }

    companion object {
        /**
         * 创建状态机构建器
         * 
         * @param initialState 初始状态
         * @return 状态机构建器
         */
        fun <S : Any, E : Any, C : Any> builder(initialState: S): Builder<S, E, C> {
            return Builder(initialState)
        }
    }
}

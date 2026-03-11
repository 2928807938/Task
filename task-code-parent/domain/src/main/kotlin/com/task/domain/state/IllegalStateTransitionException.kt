package com.task.domain.state

/**
 * 非法状态转换异常
 * 
 * 当尝试执行不允许的状态转换时抛出此异常
 */
class IllegalStateTransitionException(message: String) : RuntimeException(message)

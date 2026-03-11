package com.task.domain.exception

/**
 * 退出登录异常
 * 当退出登录过程中发生错误时抛出
 */
class LogoutException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
}

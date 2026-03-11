package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 业务异常基类
 */
open class BusinessException(
    val code: Int = ResponseCode.OPERATION_FAILED.code,
    override val message: String = ResponseCode.OPERATION_FAILED.message,
    cause: Throwable? = null
) : RuntimeException(message, cause) {
    constructor(responseCode: ResponseCode, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        cause = cause
    )
}
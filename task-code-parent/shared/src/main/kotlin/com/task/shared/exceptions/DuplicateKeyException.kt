package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 数据重复异常
 * 用于处理数据唯一性冲突的情况
 */
class DuplicateKeyException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val field: String? = null,
    val value: Any? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, field: String? = null, value: Any? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        field = field,
        value = value,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, field: String? = null, value: Any? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        field = field,
        value = value,
        cause = cause
    )
}
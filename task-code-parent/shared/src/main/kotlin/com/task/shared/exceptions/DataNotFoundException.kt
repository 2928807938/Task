package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 数据未找到异常
 * 用于处理数据不存在的情况
 */
class DataNotFoundException(
    code: Int = ResponseCode.NOT_FOUND.code,
    message: String = ResponseCode.NOT_FOUND.message,
    val dataId: Any? = null,
    val dataType: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, dataId: Any? = null, dataType: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        dataId = dataId,
        dataType = dataType,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, dataId: Any? = null, dataType: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        dataId = dataId,
        dataType = dataType,
        cause = cause
    )
}
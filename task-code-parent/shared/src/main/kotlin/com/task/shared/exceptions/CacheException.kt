package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 缓存操作异常
 * 用于处理缓存操作失败的情况
 */
class CacheException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val cacheKey: String? = null,
    val operationType: String? = null,
    val errorDetail: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, cacheKey: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        cacheKey = cacheKey,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, cacheKey: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        cacheKey = cacheKey,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )
}
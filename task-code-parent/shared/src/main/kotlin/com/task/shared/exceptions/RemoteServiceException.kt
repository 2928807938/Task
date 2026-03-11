package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 远程服务调用异常
 * 用于处理远程服务调用失败的情况
 */
class RemoteServiceException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val serviceName: String? = null,
    val requestUrl: String? = null,
    val errorResponse: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, serviceName: String? = null, requestUrl: String? = null, errorResponse: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        serviceName = serviceName,
        requestUrl = requestUrl,
        errorResponse = errorResponse,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, serviceName: String? = null, requestUrl: String? = null, errorResponse: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        serviceName = serviceName,
        requestUrl = requestUrl,
        errorResponse = errorResponse,
        cause = cause
    )
}
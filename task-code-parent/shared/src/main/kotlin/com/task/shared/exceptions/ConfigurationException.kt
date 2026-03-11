package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 配置异常
 * 用于处理配置错误的情况
 */
class ConfigurationException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val configKey: String? = null,
    val configValue: Any? = null,
    val errorDetail: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, configKey: String? = null, configValue: Any? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        configKey = configKey,
        configValue = configValue,
        errorDetail = errorDetail,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, configKey: String? = null, configValue: Any? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        configKey = configKey,
        configValue = configValue,
        errorDetail = errorDetail,
        cause = cause
    )
}
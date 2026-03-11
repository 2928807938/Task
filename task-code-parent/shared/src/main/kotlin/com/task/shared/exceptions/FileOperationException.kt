package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 文件操作异常
 * 用于处理文件操作失败的情况
 */
class FileOperationException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val filePath: String? = null,
    val operationType: String? = null,
    val errorDetail: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, filePath: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        filePath = filePath,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, filePath: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        filePath = filePath,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )
}
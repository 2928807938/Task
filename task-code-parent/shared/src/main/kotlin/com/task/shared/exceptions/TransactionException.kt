package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 事务异常
 * 用于处理事务操作失败的情况
 */
class TransactionException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val transactionId: String? = null,
    val operationType: String? = null,
    val errorDetail: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, transactionId: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        transactionId = transactionId,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, transactionId: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        transactionId = transactionId,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )
}
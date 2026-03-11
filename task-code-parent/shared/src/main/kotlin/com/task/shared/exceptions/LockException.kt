package com.task.shared.exceptions
import com.task.shared.constants.ResponseCode

/**
 * 锁操作异常
 * 用于处理锁获取、释放等操作失败的情况
 */
class LockException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val lockKey: String? = null,
    val operationType: String? = null,
    val errorDetail: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, lockKey: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        lockKey = lockKey,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, lockKey: String? = null, operationType: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        lockKey = lockKey,
        operationType = operationType,
        errorDetail = errorDetail,
        cause = cause
    )
}
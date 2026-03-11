package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

/**
 * 数据访问异常
 * 用于处理数据库访问失败的情况
 */
class DataAccessException(
    code: Int = ResponseCode.OPERATION_FAILED.code,
    message: String = ResponseCode.OPERATION_FAILED.message,
    val dataSource: String? = null,
    val sql: String? = null,
    val errorDetail: String? = null,
    cause: Throwable? = null
) : BusinessException(code, message, cause) {
    constructor(responseCode: ResponseCode, dataSource: String? = null, sql: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = responseCode.message,
        dataSource = dataSource,
        sql = sql,
        errorDetail = errorDetail,
        cause = cause
    )

    constructor(responseCode: ResponseCode, message: String, dataSource: String? = null, sql: String? = null, errorDetail: String? = null, cause: Throwable? = null) : this(
        code = responseCode.code,
        message = message,
        dataSource = dataSource,
        sql = sql,
        errorDetail = errorDetail,
        cause = cause
    )
}
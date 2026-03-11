package com.task.shared.exceptions

/**
 * 权限拒绝异常
 * 当用户没有执行某个操作的权限时抛出
 */
class PermissionDeniedException(
    message: String,
    val permissionCode: String? = null,
    val resourceId: Long? = null,
    val resourceType: String? = null,
    cause: Throwable? = null
) : RuntimeException(message, cause) {
    
    constructor(
        message: String,
        permissionCode: String,
        cause: Throwable? = null
    ) : this(message, permissionCode, null, null, cause)
}
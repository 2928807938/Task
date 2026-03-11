package com.task.shared.constants

enum class ResponseCode(val code: Int, val message: String) {
    // HTTP成功状态码 (200-299)
    OK(200, "请求成功"),
    CREATED(201, "创建成功"),
    ACCEPTED(202, "请求已接受"),
    NO_CONTENT(204, "无内容返回"),

    // HTTP错误码 (400-599)
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未经授权的访问"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    METHOD_NOT_ALLOWED(405, "请求方法不允许"),
    CONFLICT(409, "资源冲突"),
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    SERVICE_UNAVAILABLE(503, "服务暂时不可用"),
    GATEWAY_TIMEOUT(504, "网关超时"),

    // 用户相关错误码 (1001-1099)
    INVALID_PARAMETER(1001, "无效的参数"),
    USER_NOT_FOUND(1002, "用户不存在"),
    USERNAME_ALREADY_EXISTS(1003, "用户名已存在"),
    INVALID_CREDENTIALS(1004, "无效的凭证"),
    OPERATION_FAILED(1005, "操作失败"),
    PASSWORD_ERROR(1006, "密码错误"),
    ACCOUNT_LOCKED(1007, "账号已锁定"),
    ACCOUNT_EXPIRED(1008, "账号已过期"),
    ACCOUNT_DISABLED(1009, "账号已禁用"),
    PASSWORD_EXPIRED(1010, "密码已过期"),

    // 权限相关错误码 (1100-1199)
    INSUFFICIENT_PERMISSIONS(1100, "权限不足"),
    PERMISSION_DENIED(1101, "权限拒绝"),
    TOKEN_EXPIRED(1102, "令牌已过期"),
    INVALID_TOKEN(1103, "无效的令牌"),
    TOKEN_REQUIRED(1104, "需要令牌"),

    // 验证码相关错误码 (1200-1299)
    CAPTCHA_ERROR(1200, "验证码错误"),
    CAPTCHA_EXPIRED(1201, "验证码已过期"),
    CAPTCHA_REQUIRED(1202, "需要验证码"),

    // 数据操作相关错误码 (1300-1399)
    DATA_NOT_FOUND(1300, "数据不存在"),
    DATA_ALREADY_EXISTS(1301, "数据已存在"),
    DATA_VALIDATION_FAILED(1302, "数据验证失败"),
    DATA_INTEGRITY_VIOLATION(1303, "数据完整性违规"),
    DATA_ACCESS_ERROR(1304, "数据访问错误"),
    DUPLICATE_KEY(1305, "数据已存在，请勿重复添加"),
    PARAM_VALIDATION_ERROR(1306, "参数验证失败"),
    PROJECT_ROLE_NAME_EXISTED(1307, "项目角色名称已存在"),

    // 系统级错误码 (2000-2099)
    DATABASE_ERROR(2000, "数据库异常"),
    CACHE_ERROR(2001, "缓存服务异常"),
    THIRD_PARTY_SERVICE_ERROR(2002, "第三方服务调用异常"),
    FILE_UPLOAD_ERROR(2003, "文件上传失败"),
    FILE_DOWNLOAD_ERROR(2004, "文件下载失败"),
    SYSTEM_BUSY(2005, "系统繁忙"),
    NETWORK_ERROR(2006, "网络异常"),
    CONFIGURATION_ERROR(2007, "系统配置错误"),
    RATE_LIMIT_EXCEEDED(2008, "请求频率超限")
}
/**
 * 响应码枚举
 * 与后端的ResponseCode保持一致
 */
export enum ResponseCode {
  // HTTP成功状态码 (200-299)
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // HTTP错误码 (400-599)
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,

  // 用户相关错误码 (1001-1099)
  INVALID_PARAMETER = 1001,
  USER_NOT_FOUND = 1002,
  USERNAME_ALREADY_EXISTS = 1003,
  INVALID_CREDENTIALS = 1004,
  OPERATION_FAILED = 1005,
  PASSWORD_ERROR = 1006,
  ACCOUNT_LOCKED = 1007,
  ACCOUNT_EXPIRED = 1008,
  ACCOUNT_DISABLED = 1009,
  PASSWORD_EXPIRED = 1010,
  EMAIL_ALREADY_REGISTERED = 1011,
  EMAIL_SEND_LIMIT_EXCEEDED = 1012,

  // 权限相关错误码 (1100-1199)
  INSUFFICIENT_PERMISSIONS = 1100,
  TOKEN_EXPIRED = 1101,
  INVALID_TOKEN = 1102,
  TOKEN_REQUIRED = 1103,

  // 验证码相关错误码 (1200-1299)
  CAPTCHA_ERROR = 1200,
  CAPTCHA_EXPIRED = 1201,
  CAPTCHA_REQUIRED = 1202,
  VERIFICATION_CODE_INVALID = 1203,

  // 数据操作相关错误码 (1300-1399)
  DATA_NOT_FOUND = 1300,
  DATA_ALREADY_EXISTS = 1301,
  DATA_VALIDATION_FAILED = 1302,
  DATA_INTEGRITY_VIOLATION = 1303,
  DATA_ACCESS_ERROR = 1304,
  DUPLICATE_KEY = 1305,
  PARAM_VALIDATION_ERROR = 1306,

  // 系统级错误码 (2000-2099)
  DATABASE_ERROR = 2000,
  CACHE_ERROR = 2001,
  THIRD_PARTY_SERVICE_ERROR = 2002,
  FILE_UPLOAD_ERROR = 2003,
  FILE_DOWNLOAD_ERROR = 2004,
  SYSTEM_BUSY = 2005,
  NETWORK_ERROR = 2006,
  CONFIGURATION_ERROR = 2007,
  RATE_LIMIT_EXCEEDED = 2008
}

/**
 * 响应码消息映射
 * 提供响应码对应的消息
 */
export const ResponseMessages: Record<ResponseCode, string> = {
  // HTTP成功状态码 (200-299)
  [ResponseCode.OK]: "请求成功",
  [ResponseCode.CREATED]: "创建成功",
  [ResponseCode.ACCEPTED]: "请求已接受",
  [ResponseCode.NO_CONTENT]: "无内容返回",

  // HTTP错误码 (400-599)
  [ResponseCode.BAD_REQUEST]: "请求参数错误",
  [ResponseCode.UNAUTHORIZED]: "未经授权的访问",
  [ResponseCode.FORBIDDEN]: "禁止访问",
  [ResponseCode.NOT_FOUND]: "资源不存在",
  [ResponseCode.METHOD_NOT_ALLOWED]: "请求方法不允许",
  [ResponseCode.CONFLICT]: "资源冲突",
  [ResponseCode.INTERNAL_SERVER_ERROR]: "服务器内部错误",
  [ResponseCode.SERVICE_UNAVAILABLE]: "服务暂时不可用",
  [ResponseCode.GATEWAY_TIMEOUT]: "网关超时",

  // 用户相关错误码 (1001-1099)
  [ResponseCode.INVALID_PARAMETER]: "无效的参数",
  [ResponseCode.USER_NOT_FOUND]: "用户不存在",
  [ResponseCode.USERNAME_ALREADY_EXISTS]: "用户名已存在",
  [ResponseCode.INVALID_CREDENTIALS]: "无效的凭证",
  [ResponseCode.OPERATION_FAILED]: "操作失败",
  [ResponseCode.PASSWORD_ERROR]: "密码错误",
  [ResponseCode.ACCOUNT_LOCKED]: "账号已锁定",
  [ResponseCode.ACCOUNT_EXPIRED]: "账号已过期",
  [ResponseCode.ACCOUNT_DISABLED]: "账号已禁用",
  [ResponseCode.PASSWORD_EXPIRED]: "密码已过期",
  [ResponseCode.EMAIL_ALREADY_REGISTERED]: "邮箱已被注册",
  [ResponseCode.EMAIL_SEND_LIMIT_EXCEEDED]: "发送邮件超过限制",

  // 权限相关错误码 (1100-1199)
  [ResponseCode.INSUFFICIENT_PERMISSIONS]: "权限不足",
  [ResponseCode.TOKEN_EXPIRED]: "令牌已过期",
  [ResponseCode.INVALID_TOKEN]: "无效的令牌",
  [ResponseCode.TOKEN_REQUIRED]: "需要令牌",

  // 验证码相关错误码 (1200-1299)
  [ResponseCode.CAPTCHA_ERROR]: "验证码错误",
  [ResponseCode.CAPTCHA_EXPIRED]: "验证码已过期",
  [ResponseCode.CAPTCHA_REQUIRED]: "需要验证码",
  [ResponseCode.VERIFICATION_CODE_INVALID]: "验证码无效",

  // 数据操作相关错误码 (1300-1399)
  [ResponseCode.DATA_NOT_FOUND]: "数据不存在",
  [ResponseCode.DATA_ALREADY_EXISTS]: "数据已存在",
  [ResponseCode.DATA_VALIDATION_FAILED]: "数据验证失败",
  [ResponseCode.DATA_INTEGRITY_VIOLATION]: "数据完整性违规",
  [ResponseCode.DATA_ACCESS_ERROR]: "数据访问错误",
  [ResponseCode.DUPLICATE_KEY]: "数据已存在，请勿重复添加",
  [ResponseCode.PARAM_VALIDATION_ERROR]: "参数验证失败",

  // 系统级错误码 (2000-2099)
  [ResponseCode.DATABASE_ERROR]: "数据库异常",
  [ResponseCode.CACHE_ERROR]: "缓存服务异常",
  [ResponseCode.THIRD_PARTY_SERVICE_ERROR]: "第三方服务调用异常",
  [ResponseCode.FILE_UPLOAD_ERROR]: "文件上传失败",
  [ResponseCode.FILE_DOWNLOAD_ERROR]: "文件下载失败",
  [ResponseCode.SYSTEM_BUSY]: "系统繁忙",
  [ResponseCode.NETWORK_ERROR]: "网络异常",
  [ResponseCode.CONFIGURATION_ERROR]: "系统配置错误",
  [ResponseCode.RATE_LIMIT_EXCEEDED]: "请求频率超限"
};

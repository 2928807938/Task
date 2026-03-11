package com.task.web.exception

import com.task.domain.exception.LogoutException
import com.task.domain.exception.TasksNeedReassignmentException
import com.task.shared.api.response.ApiResponse
import com.task.shared.constants.ResponseCode
import com.task.shared.exceptions.*
import com.task.web.config.TraceIdFilter
import jakarta.validation.ConstraintViolationException
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.http.HttpStatus
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.bind.support.WebExchangeBindException
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.ServerWebExchangeDecorator
import java.util.*
import java.util.regex.Pattern

@RestControllerAdvice
class GlobalExceptionHandler {
    private val log = LoggerFactory.getLogger(this::class.java)
    
    /**
     * 获取当前请求的traceId
     * 多级获取策略：
     * 1. 先从MDC中获取
     * 2. 然后从exchange属性中获取
     * 3. 最后生成一个新的
     */
    private fun getTraceId(exchange: ServerWebExchange?): String {
        // 1. 先从MDC中获取
        var traceId = MDC.get(TraceIdFilter.TRACE_ID_KEY)
        
        // 2. 如果MDC中没有，从exchange属性中获取
        if (traceId.isNullOrBlank() && exchange != null) {
            traceId = exchange.attributes[TraceIdFilter.TRACE_ID_KEY] as? String
        }
        
        // 3. 如果还是没有，生成一个新的
        if (traceId.isNullOrBlank()) {
            traceId = UUID.randomUUID().toString()
            log.warn("异常处理中未找到traceId，生成新的: {}", traceId)
            MDC.put(TraceIdFilter.TRACE_ID_KEY, traceId)
        }
        
        return traceId
    }
    
    /**
     * 获取ServerWebExchange实例
     */
    private fun getExchange(e: Exception): ServerWebExchange? {
        // 递归搜索异常链找出WebExchange
        var throwable: Throwable? = e
        while (throwable != null) {
            if (throwable is ServerWebExchangeDecorator) {
                return throwable.delegate
            }
            throwable = throwable.cause
        }
        return null
    }

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleBusinessException(e: BusinessException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("业务异常[{}]: {}", traceId, e.message)
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }


    /**
     * 处理其他未知异常
     */
    /**
     * 处理认证异常
     */
    @ExceptionHandler(AuthenticationException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleAuthenticationException(e: AuthenticationException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("认证异常[{}]: {}", traceId, e.message)
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理远程服务调用异常
     */
    @ExceptionHandler(RemoteServiceException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleRemoteServiceException(e: RemoteServiceException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error(
            "远程服务调用异常[{}]: service={}, url={}, error={}",
            traceId,
            e.serviceName,
            e.requestUrl,
            e.errorResponse,
            e
        )
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理事务异常
     */
    @ExceptionHandler(TransactionException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleTransactionException(e: TransactionException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error(
            "事务异常[{}]: transactionId={}, operationType={}, error={}",
            traceId,
            e.transactionId,
            e.operationType,
            e.errorDetail,
            e
        )
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理数据访问异常
     * 注意：为了安全起见，不向前端展示SQL错误详情
     * 并且会生成唯一错误跟踪码，便于排查
     */
    @ExceptionHandler(DataAccessException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleDataAccessException(e: DataAccessException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        // 生成错误跟踪码，如果已经有则使用现有的
        val errorId = e.message?.let { extractErrorId(it) } ?: generateErrorId()
        
        // 记录完整错误信息到日志，便于排查问题
        log.error(
            "数据访问异常[errorId={}]: dataSource={}, sql={}, error={}",
            errorId,
            e.dataSource,
            e.sql,
            e.errorDetail,
            e
        )
        // 返回给前端通用错误信息，不包含SQL详情，但包含错误跟踪码
        return ApiResponse.error("数据处理异常，请联系管理员并提供错误编号: $errorId", e.code.toString())
    }

    /**
     * 处理文件操作异常
     */
    @ExceptionHandler(FileOperationException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleFileOperationException(e: FileOperationException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        log.error(
            "文件操作异常[{}]: filePath={}, operationType={}, error={}",
            MDC.get("traceId"),
            e.filePath,
            e.operationType,
            e.errorDetail,
            e
        )
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理验证异常
     */
    @ExceptionHandler(ValidationException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleValidationException(e: ValidationException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("验证异常[{}]: {}", traceId, e.message)
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理参数校验异常（@Valid/@Validated注解的Bean参数）
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleMethodArgumentNotValidException(e: MethodArgumentNotValidException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("参数校验异常[{}]: {}", traceId, e.message)
        val message = e.bindingResult.fieldError?.defaultMessage ?: "请求参数格式错误"
        return ApiResponse.error(message, ResponseCode.INVALID_PARAMETER.code.toString())
    }

    /**
     * 处理单参数校验异常（如@Validated修饰的Controller方法参数）
     */
    @ExceptionHandler(ConstraintViolationException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleConstraintViolationException(e: ConstraintViolationException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("参数约束异常[{}]: {}", traceId, e.message)
        val message = e.constraintViolations.firstOrNull()?.message ?: "请求参数格式错误"
        return ApiResponse.error(message, ResponseCode.INVALID_PARAMETER.code.toString())
    }


    /**
     * 处理参数异常（IllegalArgumentException）的全局异常处理方法。
     * 捕获参数校验等相关异常，返回统一的API响应格式，响应码为200（OK），但标识参数错误。
     *
     * @param e 捕获到的 IllegalArgumentException 异常
     * @param exchange 当前 Web 请求上下文
     * @return ApiResponse<Nothing> 统一的错误响应对象，包含错误信息和错误码
     */
    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleIllegalArgumentException(
        e: IllegalArgumentException,
        exchange: ServerWebExchange
    ): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("参数约束异常[{}]: {}", traceId, e.message)
        // 直接取异常信息，若为空则给出默认提示
        val message = e.message ?: "请求参数格式错误"
        return ApiResponse.error(message, ResponseCode.INVALID_PARAMETER.code.toString())
    }

    /**
     * 处理WebFlux环境下的参数校验异常（@Valid/@Validated注解的Bean参数）
     */
    @ExceptionHandler(WebExchangeBindException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleWebExchangeBindException(e: WebExchangeBindException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("WebFlux参数绑定异常[{}]: {}", traceId, e.message)
        val message = e.bindingResult.fieldError?.defaultMessage ?: "请求参数格式错误"
        return ApiResponse.error(message, ResponseCode.INVALID_PARAMETER.code.toString())
    }

    /**
     * 处理非法访问异常
     */
    @ExceptionHandler(IllegalAccessException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleIllegalAccessException(e: IllegalAccessException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error("非法访问异常[{}]: {}", traceId, e.message, e)
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, ResponseCode.OPERATION_FAILED.code.toString())
    }

    /**
     * 处理授权异常
     */
    @ExceptionHandler(AuthorizationException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleAuthorizationException(e: AuthorizationException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("授权异常[{}]: {}", traceId, e.message)
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理权限拒绝异常
     * 当用户没有执行某个操作的权限时抛出
     */
    @ExceptionHandler(PermissionDeniedException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handlePermissionDeniedException(e: PermissionDeniedException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("权限拒绝异常[{}]: permissionCode={}, resourceId={}, resourceType={}, message={}", 
                traceId, e.permissionCode, e.resourceId, e.resourceType, e.message)
        val message = e.message ?: "您没有权限执行此操作"
        return ApiResponse.error(message, ResponseCode.PERMISSION_DENIED.code.toString())
    }

    /**
     * 处理缓存异常
     */
    @ExceptionHandler(CacheException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleCacheException(e: CacheException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error(
            "缓存异常[{}]: cacheKey={}, operationType={}, error={}",
            traceId,
            e.cacheKey,
            e.operationType,
            e.errorDetail,
            e
        )
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }
    /**
     * 处理配置异常
     */
    @ExceptionHandler(ConfigurationException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleConfigurationException(e: ConfigurationException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error(
            "配置异常[{}]: configKey={}, error={}",
            traceId,
            e.configKey,
            e.errorDetail,
            e
        )
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理数据未找到异常
     */
    @ExceptionHandler(DataNotFoundException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleDataNotFoundException(e: DataNotFoundException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("数据未找到异常[{}]: {}", traceId, e.message)
        val message = e.message ?: "数据未找到"
        return ApiResponse.error(message, e.code.toString())
    }

    /**
     * 处理重复键异常
     */
    @ExceptionHandler(DuplicateKeyException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleDuplicateKeyException(e: DuplicateKeyException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("重复键异常[{}]: {}", traceId, e.message)
        val message = e.message ?: "重复键异常"
        return ApiResponse.error(message, ResponseCode.DUPLICATE_KEY.code.toString())
    }

    /**
     * 处理锁异常
     */
    @ExceptionHandler(LockException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleLockException(e: LockException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error(
            "锁异常[{}]: lockKey={}, operationType={}, error={}",
            traceId,
            e.lockKey,
            e.operationType,
            e.errorDetail,
            e
        )
        val message = e.message ?: "系统处理异常，请稍后重试"
        return ApiResponse.error(message, e.code.toString())
    }
    
    /**
     * 处理退出登录异常
     */
    @ExceptionHandler(LogoutException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleLogoutException(e: LogoutException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.error("退出登录异常[{}]: {}", traceId, e.message, e)
        val message = e.message ?: "退出登录失败，请稍后重试"
        return ApiResponse.error(message, ResponseCode.OPERATION_FAILED.code.toString())
    }
    
    /**
     * 处理任务需要重新分配异常
     * 当移除项目成员时，如果该成员还有未完成的任务，就会抛出此异常
     */
    @ExceptionHandler(TasksNeedReassignmentException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleTasksNeedReassignmentException(e: TasksNeedReassignmentException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        log.warn("任务需要重新分配异常[{}]: {}, 任务数量={}", traceId, e.message, e.tasks.size)
        
        return ApiResponse.error(
            message = e.message ?: "成员还有未完成的任务，请先处理",
            code = ResponseCode.OPERATION_FAILED.code.toString()
        )
    }

    /**
     * 生成唯一错误跟踪码
     */
    private fun generateErrorId(): String {
        return UUID.randomUUID().toString().substring(0, 8)
    }
    
    /**
     * 从错误信息中提取错误跟踪码
     * 匹配格式: "...错误编号: abc12345..."
     */
    private fun extractErrorId(message: String): String? {
        val pattern = Pattern.compile("错误编号:*([a-zA-Z0-9]{8})")
        val matcher = pattern.matcher(message)
        return if (matcher.find()) matcher.group(1) else null
    }
    
    /**
     * 处理子任务截止日期验证异常
     * 当子任务截止日期晚于父任务截止日期时会抛出此异常
     */
    @ExceptionHandler(IllegalStateException::class)
    @ResponseStatus(HttpStatus.OK)
    fun handleIllegalStateException(e: IllegalStateException, exchange: ServerWebExchange): ApiResponse<Nothing> {
        val traceId = getTraceId(exchange)
        
        // 检查异常消息是否包含子任务截止日期相关内容
        if (e.message?.contains("子任务截止日期不能晚于父任务截止日期") == true) {
            log.warn("任务截止日期验证异常[{}]: {}", traceId, e.message)
            return ApiResponse.error(
                message = e.message ?: "子任务截止日期不能晚于父任务截止日期",
                code = ResponseCode.INVALID_PARAMETER.code.toString()
            )
        }
        
        // 其他IllegalStateException按照通用异常处理
        val errorId = generateErrorId()
        log.error("状态异常[traceId={}, errorId={}]: {}", traceId, errorId, e.message, e)
        return ApiResponse.error("操作无效: ${e.message}", ResponseCode.OPERATION_FAILED.code.toString())
    }
    
    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleException(e: Exception): ApiResponse<Nothing> {
        // 尝试从异常中获取交换上下文
        val exchange = getExchange(e)
        val traceId = getTraceId(exchange)
        
        // 生成错误跟踪码
        val errorId = generateErrorId()
        
        // 记录详细错误日志
        log.error("系统异常[traceId={}, errorId={}]: {}", traceId, errorId, e.message, e)
        
        // 返回给前端的错误信息中包含错误跟踪码
        return ApiResponse.error("系统处理异常，请联系管理员并提供错误编号: $errorId", 
            ResponseCode.INTERNAL_SERVER_ERROR.code.toString())
    }
}
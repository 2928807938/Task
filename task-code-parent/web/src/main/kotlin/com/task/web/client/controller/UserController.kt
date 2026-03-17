package com.task.web.client.controller

import com.task.application.request.*
import com.task.application.service.UserApplicationService
import com.task.application.vo.CurrentUserVO
import com.task.application.vo.LoginVo
import com.task.application.vo.UserBasicInfoVO
import com.task.shared.api.response.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/**
 * 用户控制器
 * 提供用户相关的API接口
 */
@RestController
@RequestMapping("/api/client/user")
class UserController(
    private val userApplicationService: UserApplicationService
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 用户注册
     */
    @PostMapping("/register")
    fun register(@RequestBody @Validated request: RegisterRequest): Mono<ApiResponse<Void>> {
        return userApplicationService.register(request)
            .then(Mono.just(ApiResponse.success()))
    }

    /**
     * 用户简易注册
     */
    @PostMapping("/simple-register")
    fun simpleRegister(@RequestBody @Validated request: SimpleRegisterRequest): Mono<ApiResponse<Void>> {
        return userApplicationService.simpleRegister(request)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): Mono<ApiResponse<LoginVo>> {
        return userApplicationService.login(request)
            .map { loginVo -> ApiResponse.success(loginVo) }
    }
    
    /**
     * 用户退出登录
     * 
     * 将当前令牌加入黑名单，防止令牌被再次使用。
     * 前端需要配合删除本地存储的令牌。
     */
    @PostMapping("/logout")
    fun logout(): Mono<ApiResponse<Void>> {
        log.info("退出登录：开始处理退出请求")
        
        // 直接调用应用服务的logout方法
        return userApplicationService.logout()
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 获取当前登录用户信息
     * 
     * @return 当前登录用户信息
     */
    @GetMapping("/current")
    fun getCurrentUser(): Mono<ApiResponse<CurrentUserVO>> {
        log.info("获取当前登录用户信息")
        
        return userApplicationService.getCurrentUser()
            .map { userInfo -> ApiResponse.success(userInfo) }
    }
    
    /**
     * 发送邮箱验证码
     * 
     * @param request 发送验证码请求
     * @return 操作结果
     */
    @PostMapping("/send-email-verification-code")
    fun sendEmailVerificationCode(@RequestBody @Validated request: SendEmailVerificationCodeRequest): Mono<ApiResponse<Void>> {
        log.info("发送邮箱验证码，邮箱：{}，类型：{}", request.email, request.type)
        return userApplicationService.sendEmailVerificationCode(request)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 修改密码
     * 
     * @param request 修改密码请求
     * @return 操作结果
     */
    @PostMapping("/change-password")
    fun changePassword(@RequestBody @Validated request: ChangePasswordRequest): Mono<ApiResponse<Void>> {
        log.info("修改密码请求，邮箱：{}", request.email)
        return userApplicationService.changePassword(request)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 根据邮箱或用户名查询用户列表
     * 
     * @param request 查询请求参数，包含查询参数和可选的项目ID
     * @return 用户基本信息列表（ID和名称、是否是当前用户自己、是否在指定项目中）
     */
    @GetMapping("/find-user-by-email-or-username")
    fun findUserByEmailOrUsername(
        @Validated request: FindUserRequest
    ): Mono<ApiResponse<List<UserBasicInfoVO>>> {
        log.info("根据邮箱或用户名查询用户，查询参数：{}，项目ID：{}", request.param, request.projectId)
        return userApplicationService.findUsersByEmailOrUsername(request)
            .map { list -> ApiResponse.success(list) }
    }
}

package com.task.application.service

import com.task.application.request.*
import com.task.application.utils.SecurityUtils
import com.task.application.vo.CurrentUserVO
import com.task.application.vo.LoginVo
import com.task.application.vo.UserBasicInfoVO
import com.task.domain.exception.LogoutException
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.permission.RolePermission
import com.task.domain.model.user.User
import com.task.domain.model.user.UserRole
import com.task.domain.model.user.command.RegisterUserCommand
import com.task.domain.operator.TokenOperator
import com.task.domain.repository.*
import com.task.domain.service.EmailService
import com.task.domain.service.ProjectService
import com.task.domain.service.UserService
import org.slf4j.LoggerFactory
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UserApplicationService(
    private val userService: UserService,
    private val tokenOperator: TokenOperator,
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository,
    private val rolePermissionRepository: RolePermissionRepository,
    private val userRoleRepository: UserRoleRepository,
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val securityUtils: SecurityUtils,
    private val projectService: ProjectService
) {

    /**
     * 用户注册
     */
    fun register(request: RegisterRequest): Mono<Void> {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("开始处理用户注册请求，邮箱：{}", request.email)
        
        // 先验证邮箱验证码
        return emailService.verifyCode(request.email, request.verificationCode, "register")
            .flatMap { isValid ->
                if (!isValid) {
                    logger.warn("验证码验证失败，邮箱：{}", request.email)
                    return@flatMap Mono.error<Void>(IllegalArgumentException("验证码无效或已过期"))
                }
                
                logger.info("验证码验证成功，准备注册用户，邮箱：{}", request.email)
                
                // 转换后直接使用
                val command = toRegisterCommand(request)
                
                // 调用领域服务处理注册逻辑
                userService.register(command)
            }
    }

    fun simpleRegister(request: SimpleRegisterRequest): Mono<Void> {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("开始处理用户简易注册请求，用户名：{}", request.username)

        if (request.password != request.confirmPassword) {
            return Mono.error(IllegalArgumentException("两次输入的密码不一致"))
        }

        return userService.simpleRegister(request.username, request.password)
    }
    
    /**
     * 用户登录
     */
    fun login(request: LoginRequest): Mono<LoginVo> {
        return userService.login(request.username, request.password)
            .flatMap { user ->
                // 获取用户权限列表
                getUserAuthorities(user)
                    .map { authorities ->
                        // 生成令牌
                        val token = user.id?.let { tokenOperator.createToken(it, user.username, authorities) } ?: ""
                        val expiresIn = tokenOperator.getTokenExpirationTime()

                        // 创建登录响应
                        LoginVo(
                            token = token,
                            expiresIn = expiresIn
                        )
                    }
            }
    }

    /**
     * 获取用户的权限列表
     *
     * @param user 用户对象
     * @return 权限编码列表
     */
    private fun getUserAuthorities(user: User): Mono<List<String>> {
        // 如果用户已经包含角色列表，直接使用
        if (user.roles.isNotEmpty()) {
            return Mono.just(user.roles.flatMap { it.permissions.map { permission -> permission.code } })
        }

        // 否则通过用户ID查询关联的所有角色ID
        return userRoleRepository.list { 
                fieldOf(UserRole::userId, ComparisonOperator.EQUALS, user.id ?: 0L)
            }
            .flatMap { userRole ->
                roleRepository.findById(userRole.roleId)
            }
            .flatMap { role ->
                // 如果角色已经包含权限列表，直接使用
                if (role.permissions.isNotEmpty()) {
                    Mono.just(role.permissions.map { it.code })
                } else {
                    // 否则通过角色ID查询关联的权限
                    rolePermissionRepository.list {
                        fieldOf(RolePermission::roleId, ComparisonOperator.EQUALS, role.id)
                    }
                        .flatMap { rolePermission ->
                            permissionRepository.findById(rolePermission.permissionId)
                        }
                        .map { permission -> permission.code }
                        .collectList()
                }
            }
            .collectList()
            .map { permissionLists -> permissionLists.flatten() }
            .defaultIfEmpty(emptyList())
    }

    /**
     * 将注册请求转换为注册命令
     */
    private fun toRegisterCommand(request: RegisterRequest): RegisterUserCommand {
        return RegisterUserCommand(
            username = request.username,
            email = request.email,
            password = request.password,
            verificationCode = request.verificationCode
        )
    }
    
    /**
     * 用户退出登录
     * 
     * @return 操作结果
     */
    fun logout(): Mono<Void> {
        val logger = LoggerFactory.getLogger(this::class.java)
        
        // 从安全上下文中获取当前用户的认证信息
        return ReactiveSecurityContextHolder.getContext()
            .flatMap { securityContext ->
                val authentication = securityContext.authentication
                if (authentication == null) {
                    logger.info("退出登录：用户未登录，无需处理")
                    return@flatMap Mono.empty<Void>()
                }
                
                // 从认证信息中获取令牌（在JwtAuthenticationFilter中设置为credentials）
                val token = authentication.credentials as? String
                if (token.isNullOrBlank()) {
                    logger.info("退出登录：令牌为空，无需处理")
                    return@flatMap Mono.empty<Void>()
                }
                
                // 获取令牌过期时间
                val expirationTime = tokenOperator.getTokenExpirationTime()
                logger.info("退出登录：准备将令牌加入黑名单，过期时间：{}秒", expirationTime)
                
                // 将令牌添加到黑名单
                tokenOperator.addToBlacklist(token, expirationTime)
                    .doOnSuccess { 
                        logger.info("退出登录：令牌已成功加入黑名单")
                        // 清理安全工具类中缓存的用户ID
                        securityUtils.clearAllUserIdCache()
                        logger.info("退出登录：已清理所有用户ID缓存")
                    }
                    .doOnError { e -> 
                        logger.error("退出登录：将令牌加入黑名单失败", e)
                        throw LogoutException("退出登录失败，请稍后重试", e)
                    }
            }
    }
    
    /**
     * 获取当前登录用户信息
     * 
     * @return 当前用户信息视图对象
     */
    fun getCurrentUser(): Mono<CurrentUserVO> {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("获取当前登录用户信息")

        return securityUtils.withCurrentUserId { userId ->
            // 从安全上下文中获取当前用户的认证信息
            ReactiveSecurityContextHolder.getContext()
                .flatMap { securityContext ->
                    val authentication = securityContext.authentication
                    if (authentication == null) {
                        logger.info("获取当前用户：用户未登录")
                        return@flatMap Mono.empty<CurrentUserVO>()
                    }

                    // 获取用户名和权限
                    val username = authentication.name
                    val authorities = authentication.authorities.map { it.authority }

                    // 返回用户信息
                    Mono.just(
                        CurrentUserVO(
                            username = username,
                            authorities = authorities
                        )
                    )
                }
                .switchIfEmpty(Mono.defer {
                    // 如果无法从安全上下文中获取用户信息，则通过用户ID查询
                    userService.getById(userId)
                        .flatMap { user ->
                            // 获取用户权限
                            getUserAuthorities(user)
                                .map { authorities ->
                                    CurrentUserVO(
                                        username = user.username,
                                        authorities = authorities
                                    )
                                }
                        }
                })
        }
    }
    
    /**
     * 发送邮箱验证码
     *
     * @param request 发送邮箱验证码请求
     * @return 操作结果
     */
    fun sendEmailVerificationCode(request: SendEmailVerificationCodeRequest): Mono<Void> {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("开始发送邮箱验证码，邮箱：{}，类型：{}", request.email, request.type)
        
        // 根据验证码类型进行不同处理
        return when (request.type) {
            "register" -> {
                // 注册验证码：检查邮箱是否已被注册
                userService.existsByEmail(request.email)
                    .flatMap { exists ->
                        if (exists) {
                            logger.info("邮箱已被注册，邮箱：{}", request.email)
                            Mono.error(IllegalArgumentException("该邮箱已被注册"))
                        } else {
                            // 邮箱未被注册，继续生成并发送验证码
                            generateAndSendCode(request.email, request.type)
                        }
                    }
            }
            "change_password" -> {
                // 修改密码验证码：检查邮箱是否存在
                userService.existsByEmail(request.email)
                    .flatMap { exists ->
                        if (!exists) {
                            logger.info("邮箱不存在，邮箱：{}", request.email)
                            Mono.error(IllegalArgumentException("该邮箱不存在，请先注册"))
                        } else {
                            // 邮箱存在，继续生成并发送验证码
                            generateAndSendCode(request.email, request.type)
                        }
                    }
            }
            else -> {
                // 其他类型的验证码，直接生成并发送
                Mono.error(IllegalArgumentException("不支持的验证码类型"))
            }
        }
    }
    
    /**
     * 生成并发送验证码
     * 
     * @param email 邮箱地址
     * @param type 验证码类型
     * @return 操作结果
     */
    private fun generateAndSendCode(email: String, type: String): Mono<Void> {
        return emailService.generateCode(email, type)
            .flatMap { code ->
                emailService.sendVerificationCode(email, code, type)
            }
    }
    
    /**
     * 修改密码
     *
     * @param request 修改密码请求
     * @return 操作结果
     */
    fun changePassword(request: ChangePasswordRequest): Mono<Void> {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("开始修改密码，邮箱：{}", request.email)
        
        // 验证验证码
        return emailService.verifyCode(request.email, request.verificationCode, "change_password")
            .flatMap { isValid ->
                if (!isValid) {
                    logger.warn("验证码无效，邮箱：{}", request.email)
                    return@flatMap Mono.error<Void>(IllegalArgumentException("验证码无效或已过期"))
                }
                
                // 验证码有效，修改密码
                userService.changePassword(request.email, request.newPassword)
                    .then()
                    .doOnSuccess { logger.info("密码修改成功，邮箱：{}", request.email) }
                    .doOnError { e -> logger.error("密码修改失败，邮箱：{}, 错误：{}", request.email, e.message) }
            }
    }

    /**
     * 根据请求对象查询用户基本信息列表
     *
     * @param request 查询请求对象，包含查询参数和项目ID
     * @return 用户基本信息列表（ID和名称、是否是当前用户自己、是否在指定项目中）
     */
    fun findUsersByEmailOrUsername(request: FindUserRequest): Mono<List<UserBasicInfoVO>> {
        return findUsersByEmailOrUsername(request.param, request.projectId)
    }

    /**
     * 根据邮箱或用户名查询用户基本信息列表
     *
     * @param param 查询参数，可以是邮箱或用户名
     * @param projectId 项目ID，如果提供则会额外返回用户是否在此项目中
     * @return 用户基本信息列表（ID和名称、是否是当前用户自己、是否在指定项目中）
     */
    fun findUsersByEmailOrUsername(param: String, projectId: Long?): Mono<List<UserBasicInfoVO>> {
        val logger = LoggerFactory.getLogger(this::class.java)
        logger.info("根据邮箱或用户名查询用户，查询参数：{}, 项目ID：{}", param, projectId)
        
        if (param.isBlank()) {
            return Mono.just(emptyList())
        }
        
        // 获取当前登录用户ID，用于判断是否是自己
        val currentUserIdMono = securityUtils.getCurrentUserId()
        
        // 查询项目成员列表（如果提供了projectId）
        val projectMembersMono = if (projectId != null) {
            // 使用领域服务查询项目成员，而不是直接调用仓库
            projectService.getProjectMembers(projectId)
                .collectList()
                .defaultIfEmpty(emptyList())
        } else {
            Mono.just(emptyList())
        }
        
        // 调用领域服务查询用户
        val usersMono = userService.findUsersByEmailOrUsername(param)
        
        // 合并三个数据源的结果
        return Mono.zip(usersMono, currentUserIdMono, projectMembersMono)
            .map { tuple ->
                val users = tuple.t1
                val currentUserId = tuple.t2
                val projectMembers = tuple.t3
                
                // 收集项目成员的用户ID
                val projectMemberUserIds = projectMembers.map { it.userId }.toSet()
                
                // 将用户实体列表转换为视图对象列表
                users.map { user ->
                    val userId = user.id!!
                    UserBasicInfoVO(
                        id = userId,
                        name = user.profile?.fullName ?: user.username,
                        email = user.email ?: "",
                        isSelf = userId == currentUserId, // 判断是否是当前登录用户
                        isInProject = projectMemberUserIds.contains(userId) // 判断是否是项目成员
                    )
                }
            }
            .doOnSuccess { logger.info("查询用户成功，查询参数：{}, 项目ID：{}, 找到用户数量：{}", param, projectId, it.size) }
            .doOnError { e -> logger.error("查询用户失败，查询参数：{}, 项目ID：{}, 错误：{}", param, projectId, e.message) }
    }
}

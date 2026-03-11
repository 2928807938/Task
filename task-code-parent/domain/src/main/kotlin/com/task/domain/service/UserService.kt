package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.user.User
import com.task.domain.model.user.UserProfile
import com.task.domain.model.user.UserStatusEnum
import com.task.domain.model.user.command.RegisterUserCommand
import com.task.domain.repository.UserProfileRepository
import com.task.domain.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.kotlin.core.util.function.component1
import reactor.kotlin.core.util.function.component2
import java.time.OffsetDateTime

/**
 * 用户服务
 * 负责处理与用户、用户认证、用户配置相关的领域逻辑
 */
@Service
class UserService(
    private val userRepository: UserRepository,
    private val userProfileRepository: UserProfileRepository,
    private val passwordEncoder: PasswordEncoder,
) {

    private val log = LoggerFactory.getLogger(this::class.java)


    /**
     * 用户注册
     *
     * @param command 用户注册命令
     * @return Mono<Void> 不返回内容的响应式流
     */
    fun register(command: RegisterUserCommand): Mono<Void> {
        // 验证命令参数
        command.validate()

        // 检查用户名是否存在
        val usernameCheck = userRepository.exists {
            fieldOf(User::username, ComparisonOperator.EQUALS, command.username)
        }

        // 检查邮箱是否存在
        val emailCheck = userRepository.exists {
            fieldOf(User::email, ComparisonOperator.EQUALS, command.email)
        }

        // 同时检查用户名和邮箱是否已存在
        return Mono.zip(usernameCheck, emailCheck)
            .flatMap { tuple ->
                val (usernameExists, emailExists) = tuple

                when {
                    usernameExists -> Mono.error(IllegalArgumentException("用户名已被使用"))
                    emailExists -> Mono.error(IllegalArgumentException("邮箱已被注册"))
                    else -> createUser(command)
                        .flatMap { user ->
                            // 先保存用户
                            userRepository.save(user).flatMap { savedUser ->
                                // 更新用户资料中的userId并保存
                                val profile = user.profile?.copy(userId = savedUser.id!!)
                                if (profile != null) {
                                    userProfileRepository.save(profile)
                                } else {
                                    Mono.just(savedUser)
                                }
                            }
                        }
                        .then()
                }
            }
    }
    
    /**
     * 用户登录
     *
     * @param username 用户名或邮箱
     * @param password 密码
     * @return Mono<User> 登录成功的用户信息
     */
    fun login(username: String, password: String): Mono<User> {
        // 参数非空校验
        if (username.isBlank() || password.isBlank()) {
            return Mono.error(IllegalArgumentException("用户名或密码不能为空"))
        }

        // 合并用户名/邮箱查找为一次查询（假设数据库支持OR查询）
        val userMono = userRepository.findOne {
            fieldOf(User::username, ComparisonOperator.EQUALS, username)
            or()
            fieldOf(User::email, ComparisonOperator.EQUALS, username)
        }

        return userMono
            .switchIfEmpty(Mono.defer {
                // 登录失败日志
                log.warn("登录失败：用户不存在，输入={} 时间={}", username, OffsetDateTime.now())
                Mono.error(IllegalArgumentException("用户名或密码错误"))
            })
            .flatMap { user ->
                // 校验用户状态
                if (user.status != null && user.status.name != "ACTIVE") {
                    log.warn("登录失败：用户状态异常，输入={} 状态={} 时间={}", username, user.status, OffsetDateTime.now())
                    return@flatMap Mono.error(IllegalArgumentException("用户名或密码错误"))
                }
                // 验证密码
                if (passwordEncoder.matches(password, user.passwordHash)) {
                    // 更新最后登录时间
                    val updatedUser = user.copy(lastLogin = OffsetDateTime.now())
                    userRepository.save(updatedUser).map { updatedUser }
                } else {
                    log.warn("登录失败：密码错误，输入={} 时间={}", username, OffsetDateTime.now())
                    Mono.error(IllegalArgumentException("用户名或密码错误"))
                }
            }
    }

    /**
     * 创建用户实体
     *
     * @param command 用户注册命令
     * @return 创建的用户实体
     */
    private fun createUser(command: RegisterUserCommand): Mono<User> {
        val now = OffsetDateTime.now()

        // 创建用户资料
        val userProfile = UserProfile(
            id = 0L, // 临时ID，将在保存时生成新ID (0L也会被识别为新记录)
            userId = 0L, // 临时ID，将在保存时更新
            createdAt = now
        )

        val user = User(
            id = null, // 明确设置为null，确保被识别为新记录
            username = command.username,
            passwordHash = passwordEncoder.encode(command.password),
            email = command.email,
            lastLogin = now,
            status = UserStatusEnum.ACTIVE,
            profile = userProfile,
            createdAt = now
        )

        return Mono.just(user)
    }
    
    /**
     * 批量获取用户信息
     *
     * @param userIds 用户ID列表
     * @return 用户ID到用户信息的映射
     */
    fun batchGetUserInfo(userIds: List<Long?>): Mono<Map<Long, User>> {
        if (userIds.isEmpty()) {
            return Mono.just(emptyMap())
        }
        
        return userRepository.list {
            fieldOf(User::id, ComparisonOperator.IN, userIds)
        }
        .collectMap { it.id!! }
    }
    
    /**
     * 批量获取用户名称
     *
     * @param userIds 用户ID列表
     * @return 用户ID到用户名称的映射
     */
    fun batchGetUserNames(userIds: List<Long?>): Mono<Map<Long, String>> {
        return batchGetUserInfo(userIds)
            .map { userMap ->
                userMap.mapValues { (_, user) ->
                    user.profile?.fullName ?: user.username
                }
            }
    }
    
    /**
     * 根据ID获取用户信息
     *
     * @param id 用户ID
     * @return 用户信息
     */
    fun getById(id: Long?): Mono<User> {
        return userRepository.findById(id!!)
            .switchIfEmpty(Mono.error(IllegalArgumentException("用户不存在")))
    }
    
    /**
     * 检查邮箱是否已被注册
     *
     * @param email 邮箱地址
     * @return 如果邮箱已被注册，返回true，否则返回false
     */
    fun existsByEmail(email: String): Mono<Boolean> {
        if (email.isBlank()) {
            return Mono.just(false)
        }
        
        // 使用Repository的exists方法结合字段比较操作
        return userRepository.exists {
            fieldOf(User::email, ComparisonOperator.EQUALS, email)
        }
    }
    
    /**
     * 根据邮箱查找用户
     *
     * @param email 邮箱地址
     * @return 用户信息
     */
    fun findByEmail(email: String): Mono<User> {
        if (email.isBlank()) {
            return Mono.error(IllegalArgumentException("邮箱不能为空"))
        }
        
        return userRepository.findOne {
            fieldOf(User::email, ComparisonOperator.EQUALS, email)
        }.switchIfEmpty(Mono.error(IllegalArgumentException("用户不存在")))
    }
    
    /**
     * 修改用户密码
     *
     * @param email 用户邮箱
     * @param newPassword 新密码
     * @return 更新后的用户实体
     */
    fun changePassword(email: String, newPassword: String): Mono<User> {
        if (email.isBlank() || newPassword.isBlank()) {
            return Mono.error(IllegalArgumentException("邮箱或密码不能为空"))
        }
        
        // 先查找用户
        return findByEmail(email)
            .flatMap { user ->
                // 更新密码
                val encodedPassword = passwordEncoder.encode(newPassword)
                val updatedUser = user.copy(
                    passwordHash = encodedPassword,
                    updatedAt = OffsetDateTime.now()
                )
                
                // 保存用户
                userRepository.save(updatedUser)
                    .doOnSuccess { log.info("用户密码修改成功，邮箱：{}", email) }
                    .doOnError { e -> log.error("用户密码修改失败，邮箱：{}, 错误：{}", email, e.message) }
            }
    }
    
    /**
     * 根据邮箱或用户名查询用户
     *
     * @param query 查询参数，可以是邮箱或用户名
     * @return 用户信息
     */
    fun findByEmailOrUsername(query: String): Mono<User> {
        if (query.isBlank()) {
            return Mono.error(IllegalArgumentException("查询参数不能为空"))
        }
        
        log.info("根据邮箱或用户名查询用户，查询参数：{}", query)
        
        // 使用邮箱或用户名查询用户
        return userRepository.findOne {
            fieldOf(User::username, ComparisonOperator.EQUALS, query)
            or()
            fieldOf(User::email, ComparisonOperator.EQUALS, query)
        }
        .switchIfEmpty(Mono.error(IllegalArgumentException("用户不存在")))
        .doOnSuccess { log.info("查询用户成功，查询参数：{}, 用户ID：{}", query, it.id) }
        .doOnError { e -> log.error("查询用户失败，查询参数：{}, 错误：{}", query, e.message) }
    }
    
    /**
     * 根据邮箱或用户名查询用户列表
     *
     * @param param 查询参数，可以是邮箱或用户名的部分内容
     * @return 用户信息列表
     */
    fun findUsersByEmailOrUsername(param: String): Mono<List<User>> {
        if (param.isBlank()) {
            return Mono.just(emptyList())
        }
        
        log.info("根据邮箱或用户名查询用户列表，查询参数：{}", param)
        
        // 使用邮箱或用户名模糊查询用户
        return userRepository.list {
            fieldOf(User::username, ComparisonOperator.EQUALS, param)
            or()
            fieldOf(User::email, ComparisonOperator.EQUALS, param)
        }
        .collectList()
        .doOnSuccess { log.info("查询用户列表成功，查询参数：{}, 找到用户数量：{}", param, it.size) }
        .defaultIfEmpty(emptyList())
    }
}

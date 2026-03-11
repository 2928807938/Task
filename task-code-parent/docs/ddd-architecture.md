# 项目DDD分层架构说明

## 项目架构概览

本项目采用领域驱动设计(DDD)的分层架构，清晰地划分了不同层次的职责，实现了关注点分离和高内聚低耦合的设计目标。项目主要分为以下几层：

```
task-code-parent/
├── application/     # 应用层：用例实现、DTO转换、流程编排
├── domain/          # 领域层：领域模型、领域服务、仓储接口
├── infrastructure/  # 基础设施层：仓储实现、持久化、外部服务集成
├── bootstrap/       # 启动层：应用程序启动配置
└── web/             # 表现层：控制器、视图、API接口
```

## 1. 仓储层 (Repository)

### 项目实现
在本项目中，仓储层分为两部分：
- 仓储接口定义在领域层 (`domain/src/main/kotlin/com/task/domain/repository`)
- 仓储实现位于基础设施层 (`infrastructure/src/main/kotlin/com/task/infrastructure/persistence/repositoryImpl`)

### 主要职责
- **数据持久化**：将领域对象保存到数据库
- **数据检索**：从数据库加载数据并重建领域对象
- **对象转换**：Record对象与领域对象之间的转换
- **关联处理**：处理单个聚合根内部的关联关系（如User和UserProfile）

### 关键特点
- 返回完整的领域对象，不返回Record对象
- 不包含业务逻辑
- 处理单个聚合根的持久化和重建
- 封装数据访问细节，隐藏底层实现

### 代码示例
```kotlin
@Repository
class UserRepositoryImpl(
    private val userMapper: UserMapper,
    private val userProfileMapper: UserProfileMapper,
    private val idGenerator: IdGeneratorService
) : UserRepository {
    override fun findById(id: Long): Mono<User> {
        return userMapper.findById(id)
            .flatMap { userRecord ->
                userProfileMapper.findByUserId(userRecord.id!!)
                    .map { profileRecord ->
                        toDomainUser(userRecord, profileRecord)
                    }
                    .defaultIfEmpty(toDomainUser(userRecord, null))
            }
    }
    
    // 其他方法...
}
```

## 2. 领域服务 (Domain Service)

### 项目实现
在本项目中，领域服务位于领域层 (`domain/src/main/kotlin/com/task/domain/service`)，采用直接实现方式而非接口实现方式，这符合微服务架构中的简化设计原则。

### 主要职责
- **业务规则实现**：实现核心业务逻辑和规则
- **多实体协调**：处理跨实体的业务操作
- **领域事件**：发布和处理领域事件
- **业务完整性**：确保业务操作的一致性

### 关键特点
- 操作领域对象，不处理DTO
- 通过仓储层访问数据，不直接访问数据库
- 不关心UI、安全等技术细节
- 实现不适合放在单个实体中的业务逻辑

### 代码示例
```kotlin
@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    fun registerUser(username: String, email: String, password: String): User {
        // 业务规则验证
        validateRegistrationData(username, email, password)
        
        // 创建用户对象
        val user = User(
            id = null,
            username = username,
            email = email,
            passwordHash = passwordEncoder.encode(password),
            status = UserStatusEnum.PENDING_ACTIVATION
        )
        
        // 保存用户
        return userRepository.save(user)
    }
    
    // 其他方法...
}
```

## 3. 应用层服务 (Application Service)

### 项目实现
在本项目中，应用层服务位于应用层 (`application/src/main/kotlin/com/task/application/service`)。

### 主要职责
- **用例实现**：实现具体的应用用例和场景
- **请求处理**：接收并验证用户输入
- **DTO转换**：DTO与领域对象之间的转换
- **事务管理**：定义应用级事务边界
- **安全授权**：执行用户认证和授权

### 关键特点
- 输入和输出都是DTO
- 编排多个领域服务的调用
- 处理异常并转换为友好响应
- 不包含业务逻辑，只负责流程编排

### 代码示例
```kotlin
@Service
class UserApplicationService(
    private val userService: UserService,
    private val emailService: EmailService
) {
    fun registerUser(request: UserRegistrationRequest): UserRegistrationResponse {
        // 验证请求数据
        validateRegistrationRequest(request)
        
        // 调用领域服务
        val user = userService.registerUser(
            username = request.username,
            email = request.email,
            password = request.password
        )
        
        // 发送激活邮件
        emailService.sendActivationEmail(user.email)
        
        // 返回响应DTO
        return UserRegistrationResponse(
            userId = user.id,
            username = user.username,
            message = "注册成功，请查收激活邮件"
        )
    }
    
    // 其他方法...
}
```

## 4. 三层职责对比

| 职责类型 | 仓储层 | 领域服务 | 应用层服务 |
|---------|-------|---------|-----------|
| 数据访问 | ✅ 直接访问 | ❌ 通过仓储访问 | ❌ 通过领域服务访问 |
| 业务逻辑 | ❌ 不包含 | ✅ 核心业务规则 | ⚠️ 业务流程编排 |
| 对象转换 | ✅ Record ↔ 领域对象 | ❌ 不处理 | ✅ 领域对象 ↔ DTO |
| 事务管理 | ⚠️ 基本事务 | ✅ 领域事务 | ✅ 应用事务 |
| 安全授权 | ❌ 不处理 | ⚠️ 业务规则检查 | ✅ 权限控制 |

## 5. 项目中的最佳实践

### 仓储层
- 仓储接口定义在领域层，实现在基础设施层
- 仓储返回完整的领域对象，不返回Record对象
- 使用Mapper处理数据库访问，使用DomainMapper处理对象转换
- 处理单个聚合根内部的关联关系（如User和UserProfile）

### 领域服务
- 直接使用具体的服务类，不使用接口
- 实现核心业务规则和逻辑
- 通过仓储层访问数据，不直接访问数据库
- 不依赖外部系统和UI

### 应用层服务
- 实现具体用例和场景
- 处理DTO与领域对象的转换
- 管理事务边界
- 实现安全和授权检查

通过这种清晰的职责划分，项目实现了高内聚低耦合的设计目标，使系统更加模块化、可维护，同时也为未来的分库分表等扩展做好了准备。

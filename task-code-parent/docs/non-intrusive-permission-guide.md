# 非入侵式权限校验使用指南

## 概述

本项目实现了基于AOP的非入侵式权限校验机制，通过注解的方式替代手动权限检查，让权限控制更加优雅和易维护。

## 架构设计

### 核心组件

1. **权限注解** (`@RequireProjectPermission`, `@RequireTaskPermission`)
2. **权限切面** (`PermissionAspect`)
3. **权限异常** (`PermissionDeniedException`)
4. **全局异常处理** (`GlobalExceptionHandler`)

### 优势

- ✅ **非入侵式**: 无需在业务逻辑中写权限检查代码
- ✅ **声明式**: 通过注解声明权限需求，代码更清晰
- ✅ **统一处理**: 集中的权限校验逻辑，易于维护
- ✅ **响应式支持**: 完美支持WebFlux响应式编程
- ✅ **灵活配置**: 支持不同权限类型和参数提取

## 使用方法

### 1. 项目权限校验

```kotlin
@RequireProjectPermission(
    permission = ProjectPermissions.PROJECT_VIEW,
    projectIdParam = "projectId"
)
fun getProjectInfo(projectId: Long): Mono<Project> {
    // 业务逻辑，无需手动权限检查
    return projectService.findById(projectId)
}

@RequireProjectPermission(
    permission = ProjectPermissions.TASK_CREATE,
    projectIdParam = "projectId"
)
fun createTask(projectId: Long, request: CreateTaskRequest): Mono<Task> {
    return taskService.createTask(projectId, request)
}

// 项目所有者专用操作
@RequireProjectPermission(
    ownerOnly = true,
    projectIdParam = "projectId",
    message = "只有项目所有者可以删除项目"
)
fun deleteProject(projectId: Long): Mono<Void> {
    return projectService.deleteProject(projectId)
}
```

### 2. 任务权限校验

```kotlin
@RequireTaskPermission(
    permission = ProjectPermissions.TASK_VIEW,
    taskIdParam = "taskId"
)
fun getTaskDetail(taskId: Long): Mono<TaskDetailVO> {
    return taskService.findTaskById(taskId)
        .flatMap { convertToTaskDetailVO(it) }
}

@RequireTaskPermission(
    permission = ProjectPermissions.TASK_EDIT,
    taskIdParam = "taskId"
)
fun updateTask(taskId: Long, request: UpdateTaskRequest): Mono<Task> {
    return taskService.updateTask(taskId, request)
}
```

### 3. 对比：入侵式 vs 非入侵式

#### 入侵式（旧方式）
```kotlin
fun getTaskDistribution(projectId: Long): Mono<TaskDistributionVO> {
    return securityUtils.withCurrentUserId { userId ->
        // 手动权限检查 - 入侵业务逻辑
        accessControlService.checkProjectAccess(userId, projectId)
            .then(Mono.zip(
                taskService.getTaskStatistics(projectId),
                projectService.getAllProjectStatuses(projectId).collectList()
            ))
            .flatMap { tuple ->
                // 业务逻辑
                buildTaskDistribution(tuple.t1, tuple.t2)
            }
    }
}
```

#### 非入侵式（新方式）
```kotlin
@RequireProjectPermission(
    permission = ProjectPermissions.PROJECT_TASK_STATS_VIEW,
    projectIdParam = "projectId"
)
fun getTaskDistribution(projectId: Long): Mono<TaskDistributionVO> {
    // 直接编写业务逻辑，权限由AOP处理
    return Mono.zip(
        taskService.getTaskStatistics(projectId),
        projectService.getAllProjectStatuses(projectId).collectList()
    ).flatMap { tuple ->
        buildTaskDistribution(tuple.t1, tuple.t2)
    }
}
```

## 注解详解

### @RequireProjectPermission

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| permission | String | 必填 | 权限代码，对应ProjectPermissions中的常量 |
| projectIdParam | String | "projectId" | 项目ID参数名 |
| ownerOnly | Boolean | false | 是否仅项目所有者可访问 |
| message | String | "用户无权限执行此操作" | 权限拒绝时的错误消息 |

### @RequireTaskPermission

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| permission | String | 必填 | 权限代码，对应ProjectPermissions中的常量 |
| taskIdParam | String | "taskId" | 任务ID参数名 |
| message | String | "用户无权限访问此任务" | 权限拒绝时的错误消息 |

## 权限类型

### 项目级权限
- `PROJECT_VIEW`: 查看项目
- `PROJECT_EDIT`: 编辑项目  
- `PROJECT_DELETE`: 删除项目
- `PROJECT_MANAGE`: 管理项目
- `TASK_VIEW`: 查看任务
- `TASK_CREATE`: 创建任务
- `TASK_EDIT`: 编辑任务
- `TASK_DELETE`: 删除任务
- `TASK_ASSIGN`: 分配任务
- `MEMBER_VIEW`: 查看成员
- `MEMBER_ADD`: 添加成员
- `MEMBER_REMOVE`: 移除成员
- `MEMBER_MANAGE`: 管理成员权限

## 错误处理

权限校验失败时，系统会抛出`PermissionDeniedException`异常，全局异常处理器会自动捕获并返回统一的错误响应：

```json
{
    "success": false,
    "message": "您没有权限执行此操作",
    "code": "1101",
    "data": null
}
```

## 最佳实践

### 1. 权限注解放置
```kotlin
// ✅ 正确：放在Service层方法上
@Service
class ProjectApplicationService {
    @RequireProjectPermission(permission = ProjectPermissions.PROJECT_VIEW)
    fun getProject(projectId: Long): Mono<Project> { }
}

// ❌ 错误：不要放在Controller层，应该在业务层校验
@RestController
class ProjectController {
    @RequireProjectPermission(permission = ProjectPermissions.PROJECT_VIEW)
    fun getProject(projectId: Long): Mono<Project> { }
}
```

### 2. 参数名称要求
```kotlin
// ✅ 正确：参数名与注解参数名匹配
@RequireProjectPermission(
    permission = ProjectPermissions.PROJECT_VIEW,
    projectIdParam = "projectId"  // 匹配方法参数名
)
fun getProject(projectId: Long): Mono<Project> { }

// ✅ 正确：自定义参数名
@RequireProjectPermission(
    permission = ProjectPermissions.PROJECT_VIEW,
    projectIdParam = "id"
)
fun getProject(id: Long): Mono<Project> { }
```

### 3. 权限粒度设计
```kotlin
// ✅ 正确：使用具体的权限
@RequireProjectPermission(permission = ProjectPermissions.TASK_CREATE)
fun createTask(projectId: Long, request: CreateTaskRequest): Mono<Task> { }

// ❌ 错误：权限过于宽泛
@RequireProjectPermission(permission = ProjectPermissions.PROJECT_MANAGE)
fun createTask(projectId: Long, request: CreateTaskRequest): Mono<Task> { }
```

## 技术实现细节

### AOP切面处理流程
1. 拦截带有权限注解的方法调用
2. 从RequestContextHolder获取当前用户ID
3. 从方法参数中提取资源ID（projectId/taskId）
4. 调用AccessControlService进行权限校验
5. 根据校验结果决定是否允许方法继续执行

### 响应式处理
切面完美支持响应式编程，会根据方法返回类型进行相应处理：
- `Mono<T>`: 权限校验失败时返回错误的Mono
- `Flux<T>`: 权限校验失败时返回错误的Flux  
- 其他类型: 同步执行权限校验

### 模块架构设计
- **权限注解和异常**: 位于`shared`模块，可被所有模块引用
- **权限切面**: 位于`domain`模块，直接依赖domain服务
- **RequestContextHolder**: 增强版，支持Long类型用户ID获取

### 依赖解决方案
为了避免循环依赖问题，我们将`PermissionAspect`放在domain模块而不是shared模块：

```
shared/
├── annotation/          # 权限注解
├── exceptions/          # 权限异常
└── context/            # 请求上下文

domain/
├── aspect/             # 权限切面 ✅
├── service/            # 领域服务
└── config/             # AOP配置
```

这样确保了：
- ✅ shared模块保持独立，不依赖任何业务模块
- ✅ domain模块可以直接使用领域服务进行权限校验
- ✅ application层可以正常使用权限注解

## 迁移指南

将现有的入侵式权限检查迁移到非入侵式：

1. **移除手动权限检查代码**
2. **添加权限注解**
3. **简化方法实现**
4. **测试权限校验**

### 迁移示例
```kotlin
// 迁移前
fun getProjectTasks(projectId: Long): Mono<PageData<TaskVO>> {
    return securityUtils.withCurrentUserId { userId ->
        accessControlService.checkProjectAccess(userId, projectId)
            .then(taskService.findTasksByProjectId(projectId))
            .flatMap { tasks -> convertToTaskVOs(tasks) }
    }
}

// 迁移后
@RequireProjectPermission(
    permission = ProjectPermissions.TASK_VIEW,
    projectIdParam = "projectId"
)
fun getProjectTasks(projectId: Long): Mono<PageData<TaskVO>> {
    return taskService.findTasksByProjectId(projectId)
        .flatMap { tasks -> convertToTaskVOs(tasks) }
}
```

通过这种方式，权限校验逻辑从业务代码中完全分离，使代码更加清晰和易维护。
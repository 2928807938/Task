# ReactiveTransactionalOutbox 迁移指南

## 概述

我们已经将 ReactiveTransactionalOutbox 从复杂的"支持多种事务传播"版本简化为实用的、诚实面对R2DBC限制的版本。

## 主要变更

### 1. 移除了不支持的功能

**移除的功能：**
- 复杂的事务传播行为模拟（NESTED、REQUIRES_NEW的假实现）
- 事务层级管理
- 复杂的事件隔离机制

**原因：**
R2DBC 不支持真正的嵌套事务和完整的独立事务，之前的实现是不诚实的模拟。

### 2. 简化的API

**新的参数：**
```kotlin
@ReactiveTransactionalOutbox(
    enableAsyncOperations: Boolean = false  // 新增：是否启用异步操作支持
)
```

**保留的方法：**
```kotlin
// 注册领域事件（在事务提交后发布）
ReactiveTransactionalOutbox.registerEvent(event)

// 新增：注册异步操作（在事务提交后异步执行）
ReactiveTransactionalOutbox.registerAsyncOperation { 
    // 异步操作逻辑
}
```

## 迁移步骤

### 1. 检查现有代码兼容性 ✅

**好消息：现有代码无需修改！**

当前项目中的使用方式已经兼容新版本：

```kotlin
@ReactiveTransactionalOutbox  // 默认 enableAsyncOperations = false
fun createProject(command: CreateProjectCommand): Mono<Project> {
    // 业务逻辑
    .doOnSuccess {
        // 注册事件，事务提交后发布
        registerEvent(ProjectCreatedEvent(...))
    }
}
```

### 2. 新功能：异步操作支持

如果你需要在事务提交后执行一些独立的操作（之前可能想用独立事务的场景），现在可以使用异步操作：

```kotlin
@ReactiveTransactionalOutbox(enableAsyncOperations = true)
fun createProject(command: CreateProjectCommand): Mono<Project> {
    return projectRepository.save(project)
        .doOnSuccess { savedProject ->
            // 注册事件（事务提交后发布）
            registerEvent(
                ProjectCreatedEvent(savedProject.id, command.ownerId)
            ).subscribe()
            
            // 注册异步操作（事务提交后异步执行）
            registerAsyncOperation {
                initProjectSystemsAsync(savedProject.id, command.config)
            }.subscribe()
        }
}

// 异步初始化操作
@ReactiveTransactionalOutbox(enableAsyncOperations = true)
fun initProjectSystemsAsync(projectId: Long, config: ProjectConfig): Mono<Void> {
    return Mono.when(
        initPrioritySystem(projectId, config.priorities),
        initNotificationSettings(projectId, config.notifications),
        initWorkflowRules(projectId, config.workflows)
    )
    .doOnSuccess {
        registerEvent(
            ProjectSystemsInitializedEvent(projectId)
        ).subscribe()
    }
    .then()
}
```

### 3. 最佳实践更新

#### 替代子事务的模式

**之前你可能想要（但不能）这样做：**
```kotlin
@ReactiveTransactionalOutbox(propagation = Propagation.REQUIRES_NEW) // ❌ 不可靠
fun auditOperation() {
    // 独立事务逻辑
}
```

**现在推荐这样做：**
```kotlin
@ReactiveTransactionalOutbox
fun mainOperation(): Mono<Result> {
    return repository.save(entity)
        .doOnSuccess { result ->
            // 主业务事件
            registerEvent(EntityUpdatedEvent(result.id)).subscribe()
            
            // 审计操作异步执行，失败不影响主业务
            registerAsyncOperation {
                auditService.recordChange(result.id, "UPDATE")
            }.subscribe()
        }
}
```

#### 错误隔离

异步操作的失败不会影响主业务流程：

```kotlin
@ReactiveTransactionalOutbox(enableAsyncOperations = true)
fun processOrder(order: Order): Mono<Order> {
    return orderRepository.save(order)
        .doOnSuccess { savedOrder ->
            // 主业务事件
            registerEvent(OrderCreatedEvent(savedOrder.id)).subscribe()
            
            // 这些异步操作失败不会影响订单创建
            registerAsyncOperation {
                emailService.sendConfirmation(savedOrder.userEmail)
            }.subscribe()
            
            registerAsyncOperation {
                inventoryService.updateStock(savedOrder.items)
            }.subscribe()
            
            registerAsyncOperation {
                analyticsService.recordPurchase(savedOrder)
            }.subscribe()
        }
}
```

## 性能影响

### 正面影响
- 移除了复杂的事务管理代码，性能更好
- 异步操作不阻塞主业务流程
- 更符合R2DBC的响应式特性

### 注意事项
- 异步操作在不同的线程池中执行，注意资源管理
- 异步操作失败时只记录日志，不会抛出异常

## 故障排除

### 1. 如果你之前依赖"独立事务"行为

**问题：** 之前的代码期望某些操作在独立事务中执行

**解决方案：** 使用异步操作代替
```kotlin
// 之前（不可靠）
@ReactiveTransactionalOutbox(propagation = Propagation.REQUIRES_NEW)
fun logAudit() { ... }

// 现在（可靠）
registerAsyncOperation {
    auditService.logOperation(details)
}
```

### 2. 如果需要确保异步操作成功

**问题：** 异步操作的失败默认只记录日志

**解决方案：** 在异步操作中添加重试逻辑
```kotlin
registerAsyncOperation {
    emailService.sendNotification(userId)
        .retry(3)
        .onErrorResume { e ->
            // 记录到失败队列中，供后续重试
            failureQueueService.enqueue("EMAIL", userId, e.message)
        }
}
```

### 3. 调试异步操作

启用日志来观察异步操作的执行：

```yaml
logging:
  level:
    com.task.domain.transaction.ReactiveTransactionalOutboxAspect: DEBUG
```

## 总结

这次重构的核心理念是"诚实面对技术限制，提供实用的解决方案"：

1. ✅ **保持兼容性** - 现有代码无需修改
2. ✅ **提供替代方案** - 异步操作代替独立事务  
3. ✅ **错误隔离** - 异步操作失败不影响主业务
4. ✅ **性能友好** - 移除复杂的模拟逻辑
5. ✅ **易于理解** - API简单直观

这个版本虽然功能"看起来更少"，但实际上更可靠、更实用、更符合R2DBC的特性。
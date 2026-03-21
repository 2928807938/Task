package com.task.domain.config

import com.task.domain.aspect.PermissionAspect
import com.task.domain.command.TaskCommandHandler
import com.task.domain.event.core.DomainEventBus
import com.task.domain.event.core.DomainEventConfig
import com.task.domain.event.core.DomainEventPublisher
import com.task.domain.event.task.TaskEventPublisher
import com.task.domain.model.project.state.DefaultProjectStateActionExecutor
import com.task.domain.model.project.state.ProjectStateMachineFactory
import com.task.domain.service.*
import com.task.domain.service.strategy.MainTaskEditStrategy
import com.task.domain.service.strategy.SubTaskEditStrategy
import com.task.domain.transaction.ReactiveTransactionalOutboxAspect
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

/**
 * 领域层自动配置类
 * 导入所有领域层的服务和配置
 */
@Configuration
@Import(
    // 配置类
    JacksonConfig::class,
    DomainEventConfig::class,
    AspectConfig::class,
    
    // 切面
    PermissionAspect::class,
    
    // 领域事件
    DomainEventBus::class,
    DomainEventPublisher::class,

    TaskCommandHandler::class,

    // 事务处理
    ReactiveTransactionalOutboxAspect::class,

    // 领域服务
    ActivityLogService::class,
    AgreementTermService::class,
    AttachmentService::class,
    ChangeLogService::class,
    CollaborationService::class,
    DocumentVersionService::class,
    InviteService::class,
    LlmPromptService::class,
    NotificationPreferenceService::class,
    NotificationService::class,
    AccessControlService::class,
    ProjectService::class,
    RequirementCategoryService::class,
    RequirementCompletenessService::class,
    RequirementConversationService::class,
    RequirementConversationListService::class,
    RequirementConversationTurnService::class,
    RequirementPriorityService::class,
    RequirementSuggestionService::class,
    RequirementSummaryAnalysisService::class,
    RequirementTaskBreakdownService::class,
    RequirementWorkloadService::class,
    ResourceService::class,
    RoleService::class,
    TagCategoryService::class,
    TaskDependencyService::class,
    TaskEventPublisher::class,
    TaskHistoryService::class,
    TaskService::class,
    TeamService::class,
    UserService::class,
    ProjectStateMachineFactory::class,
    DefaultProjectStateActionExecutor::class,

    SubTaskEditStrategy::class,
    MainTaskEditStrategy::class,
)
class DomainAutoConfiguration

package com.task.infrastructure.config

import com.task.infrastructure.adapter.EmailAdapter
import com.task.infrastructure.id.IdGeneratorService
import com.task.infrastructure.llm.LlmServiceImpl
import com.task.infrastructure.llm.OpenAiCompatibleClient
import com.task.infrastructure.llm.config.OpenAiCompatibleConfig
import com.task.infrastructure.llm.prompt.XmlWorkflowPromptProvider
import com.task.infrastructure.persistence.repositoryImpl.*
import com.task.infrastructure.security.jwt.JwtTokenProvider
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

/**
 * 基础设施自动配置类
 * 导入所有基础设施层的配置类和服务实现
 */
@Configuration
@Import(
    // 配置类
    R2dbcConfig::class,
    R2dbcConnectionConfig::class,
    RedisConfig::class,
    OpenAiCompatibleConfig::class,
    
    // 服务实现
    IdGeneratorService::class,
    LlmServiceImpl::class,
    
    // 组件
    OpenAiCompatibleClient::class,
    XmlWorkflowPromptProvider::class,
    JwtTokenProvider::class,

    EmailAdapter::class,

    // 仓库实现类
    ActivityLogRepositoryImpl::class,
    AgreementTermRepositoryImpl::class,
    AttachmentRepositoryImpl::class,
    ChangeLogRepositoryImpl::class,
    CollaborationRepositoryImpl::class,
    DocumentVersionRepositoryImpl::class,
    DomainEventRepositoryImpl::class,
    EventProcessingLogRepositoryImpl::class,
    InviteLinkRepositoryImpl::class,
    InvitePermissionRepositoryImpl::class,
    NotificationPreferenceRepositoryImpl::class,
    NotificationRepositoryImpl::class,
    PermissionRepositoryImpl::class,
    PriorityRepositoryImpl::class,
    ProjectArchiveRecordRepositoryImpl::class,
    ProjectMemberRepositoryImpl::class,
    ProjectRepositoryImpl::class,
    ProjectRolePermissionRepositoryImpl::class,
    ProjectRoleRepositoryImpl::class,
    ProjectStatusMappingRepositoryImpl::class,
    ProjectStatusRepositoryImpl::class,
    ProjectStatusTransitionRepositoryImpl::class,

    // 需求相关仓库实现类
    RequirementCategoryRepositoryImpl::class,
    RequirementCompletenessRepositoryImpl::class,
    RequirementConversationRepositoryImpl::class,
    RequirementConversationListRepositoryImpl::class,
    RequirementConversationTurnRepositoryImpl::class,
    RequirementPriorityRepositoryImpl::class,
    RequirementSuggestionRepositoryImpl::class,
    RequirementSummaryAnalysisRepositoryImpl::class,
    RequirementTaskBreakdownRepositoryImpl::class,
    RequirementWorkloadRepositoryImpl::class,

    RolePermissionRepositoryImpl::class,
    RoleRepositoryImpl::class,
    TagCategoryRepositoryImpl::class,
    TagRepositoryImpl::class,
    TaskRepositoryImpl::class,
    TaskCommentRepositoryImpl::class,
    TaskDependencyRepositoryImpl::class,
    TaskHistoryRepositoryImpl::class,
    TaskTagRepositoryImpl::class,
    TeamMemberRepositoryImpl::class,
    TeamRepositoryImpl::class,
    TeamRolePermissionRepositoryImpl::class,
    TeamRoleRepositoryImpl::class,
    TimeEntryRepositoryImpl::class,
    TimeEstimationRepositoryImpl::class,
    UserOauthRepositoryImpl::class,
    UserProfileRepositoryImpl::class,
    UserRepositoryImpl::class,
    UserRoleRepositoryImpl::class,

    MailConfig::class
)
class InfrastructureAutoConfiguration

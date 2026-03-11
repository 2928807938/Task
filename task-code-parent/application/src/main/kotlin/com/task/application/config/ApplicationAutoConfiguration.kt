package com.task.application.config

import com.task.application.assembler.TaskCommandAssembler
import com.task.application.service.*
import com.task.application.service.analyzer.*
import com.task.application.utils.JsonUtils
import com.task.application.utils.SecurityUtils
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

/**
 * 应用层自动配置类
 * 导入所有应用层的服务
 */
@Configuration
@Import(

    // 转换器
    TaskCommandAssembler::class,

    // 应用服务
    AgreementTermApplicationService::class,
    HomePageApplicationService::class,
    InviteApplicationService::class,
    ProjectApplicationService::class,
    AnalysisResultSummarizer::class,
    RequirementAnalysisApplicationService::class,
    RequirementAnalysisSessionService::class,
    RequirementConversationApplicationService::class,
    RequirementConversationListApplicationService::class,
    TaskApplicationService::class,
    TaskAssignmentApplicationService::class,
    TeamApplicationService::class,
    UserApplicationService::class,

    AnalyzerFactory::class,
    ApiRequestHelper::class,
    CompletenessAnalyzer::class,
    PriorityAnalyzer::class,
    RequirementTypeAnalyzer::class,
    SuggestionAnalyzer::class,
    SummaryAnalyzer::class,
    TaskBreakdownAnalyzer::class,
    WorkloadAnalyzer::class,

    // 工具类
    SecurityUtils::class,
    JsonUtils::class
)
class ApplicationAutoConfiguration

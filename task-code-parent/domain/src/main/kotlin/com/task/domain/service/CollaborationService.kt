package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.QueryConditionBuilder
import com.task.domain.model.common.fieldOf
import com.task.domain.model.team.Collaboration
import com.task.domain.repository.CollaborationRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

/**
 * 协作记录领域服务
 * 实现协作记录相关的业务逻辑
 */
@Service
class CollaborationService(
    private val collaborationRepository: CollaborationRepository
) {
    private val log = LoggerFactory.getLogger(this::class.java)

    
    
    /**
     * 查询协作记录列表（带自定义查询条件）
     * 
     * @param queryBuilder 查询条件构建函数
     * @return 协作记录实体流
     */
    fun list(queryBuilder: QueryConditionBuilder<Collaboration>.() -> Unit): Flux<Collaboration> {
        log.debug("查询协作记录列表（带自定义条件）")
        
        return collaborationRepository.list {
            // 默认添加未删除条件
            fieldOf(Collaboration::deleted, ComparisonOperator.EQUALS, 0)
            
            // 应用自定义查询条件
            this.queryBuilder()
        }
        .doOnComplete { log.debug("协作记录查询完成") }
    }
} 
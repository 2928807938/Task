package com.task.domain.service

import com.task.domain.model.agreement.AgreementTerm
import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.repository.AgreementTermRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 协议条款领域服务
 * 实现协议条款相关的业务操作
 */
@Service
class AgreementTermService(
    private val agreementTermRepository: AgreementTermRepository
) {

    /**
     * 创建新的协议条款
     * @param agreementTerm 待创建的协议条款实体
     * @return 创建后的协议条款实体
     */
    fun createTerm(agreementTerm: AgreementTerm): Mono<AgreementTerm> {
        return agreementTermRepository.save(agreementTerm)
    }

    /**
     * 更新协议条款
     * @param id 条款ID
     * @param title 更新后的标题
     * @param content 更新后的内容(Markdown格式)
     * @return 更新后的协议条款实体
     */
    fun updateTerm(id: Long, title: String, content: String): Mono<AgreementTerm> {
        return agreementTermRepository.findById(id)
            .flatMap { term ->
                val updatedTerm = term.update(title, content)
                agreementTermRepository.update(updatedTerm)
            }
    }

    /**
     * 根据唯一键获取条款
     * @param key 条款唯一标识键
     * @return 条款实体
     */
    fun getTermByKey(key: String): Mono<AgreementTerm> {
        return agreementTermRepository.findOne {
            fieldOf(AgreementTerm::key, ComparisonOperator.EQUALS, key)
        }
            .switchIfEmpty(Mono.error(IllegalArgumentException("未找到指定唯一键的条款: $key")))
    }

    /**
     * 获取所有有效的条款
     * @return 条款实体流
     */
    fun getAllTerms(): Flux<AgreementTerm> {
        return agreementTermRepository.list {
            fieldOf(AgreementTerm::deleted, ComparisonOperator.EQUALS, 0)
        }
    }

} 
package com.task.application.service

import com.task.application.request.CreateAgreementTermRequest
import com.task.application.request.UpdateAgreementTermRequest
import com.task.application.vo.AgreementTermVO
import com.task.domain.model.agreement.AgreementTerm
import com.task.domain.service.AgreementTermService
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

/**
 * 协议条款应用服务
 * 负责协调领域层和处理DTO转换
 */
@Service
class AgreementTermApplicationService(
    private val agreementTermService: AgreementTermService
) {
    /**
     * 创建新的协议条款
     */
    fun createTerm(request: CreateAgreementTermRequest): Mono<AgreementTermVO> {
        // 创建领域模型
        val term = AgreementTerm.create(
            key = request.key,
            title = request.title,
            content = request.content
        )
        
        // 保存并返回DTO
        return agreementTermService.createTerm(term)
            .map { AgreementTermVO.fromDomain(it) }
    }
    
    /**
     * 更新协议条款
     */
    fun updateTerm(id: Long, request: UpdateAgreementTermRequest): Mono<AgreementTermVO> {
        return agreementTermService.updateTerm(id, request.title, request.content)
            .map { AgreementTermVO.fromDomain(it) }
    }
    
    /**
     * 根据key查询条款
     */
    fun getTermByKey(key: String): Mono<AgreementTermVO> {
        return agreementTermService.getTermByKey(key)
            .map { AgreementTermVO.fromDomain(it) }
    }
    
    /**
     * 查询所有条款
     */
    fun getAllTerms(): Flux<AgreementTermVO> {
        return agreementTermService.getAllTerms()
            .map { AgreementTermVO.fromDomain(it) }
    }
}
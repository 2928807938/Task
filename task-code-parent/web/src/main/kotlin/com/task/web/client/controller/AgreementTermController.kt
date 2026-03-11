package com.task.web.client.controller

import com.task.application.service.AgreementTermApplicationService
import com.task.application.vo.AgreementTermVO
import com.task.shared.api.response.ApiResponse
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/**
 * 协议条款控制器
 * 提供协议条款相关的API接口，包括条款的CRUD操作
 */
@RestController("client-agreement-terms")
@RequestMapping("/api/client/agreement-terms")
class AgreementTermController(
    private val agreementTermApplicationService: AgreementTermApplicationService
) {
    /**
     * 根据KEY获取条款
     * 
     * @param key 条款KEY
     * @return 条款信息
     */
    @GetMapping("/key/{key}")
    fun getTermByKey(@PathVariable key: String): Mono<ApiResponse<AgreementTermVO>> {
        return agreementTermApplicationService.getTermByKey(key)
            .map { ApiResponse.success(it) }
    }

} 
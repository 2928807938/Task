package com.task.web.admin.controller

import com.task.application.request.CreateAgreementTermRequest
import com.task.application.request.UpdateAgreementTermRequest
import com.task.application.service.AgreementTermApplicationService
import com.task.application.vo.AgreementTermVO
import com.task.shared.api.response.ApiResponse
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono

/**
 * 协议条款控制器
 * 提供协议条款相关的API接口，包括条款的CRUD操作
 */
@RestController("admin-agreement-terms")
@RequestMapping("/api/admin/agreement-terms")
class AgreementTermController(
    private val agreementTermApplicationService: AgreementTermApplicationService
) {
    /**
     * 创建协议条款
     * 
     * @param request 创建条款请求
     * @return 创建结果
     */
    @PostMapping("/create")
    fun create(@RequestBody @Validated request: CreateAgreementTermRequest): Mono<ApiResponse<Void>> {
        return agreementTermApplicationService.createTerm(request)
            .then(Mono.just(ApiResponse.success()))
    }
    
    /**
     * 更新协议条款
     * 
     * @param id 条款ID
     * @param request 更新条款请求
     * @return 更新结果
     */
    @PutMapping("/update/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody @Validated request: UpdateAgreementTermRequest
    ): Mono<ApiResponse<Void>> {
        return agreementTermApplicationService.updateTerm(id, request)
            .then(Mono.just(ApiResponse.success()))
    }
    /**
     * 获取所有条款
     *
     * @return 所有条款列表
     */
    @GetMapping("/list")
    fun getList(): Mono<ApiResponse<List<AgreementTermVO>>> {
        return agreementTermApplicationService.getAllTerms()
            .collectList()
            .map { ApiResponse.success(it) }
    }

} 
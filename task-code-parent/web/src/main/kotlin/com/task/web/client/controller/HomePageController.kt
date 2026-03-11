package com.task.web.client.controller

import com.task.application.service.HomePageApplicationService
import com.task.application.vo.*
import com.task.shared.api.response.ApiResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

/**
 * 首页控制器
 */
@RestController
@RequestMapping("/api/client/homepage")
class HomePageController (
    private val homePageApplicationService: HomePageApplicationService
) {

    /**
     * 获取首页仪表盘数据
     * 
     * @return 首页仪表盘数据
     */
    @GetMapping("/dashboard")
    fun getDashboard(): Mono<ApiResponse<DashboardVO>> {
        return homePageApplicationService.getDashboard()
            .map { ApiResponse.success(it) }
    }
}

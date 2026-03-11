package com.task.domain.aspect

import com.task.domain.constants.ProjectPermissions
import com.task.domain.service.AccessControlService
import com.task.domain.service.TaskService
import com.task.shared.annotation.RequireProjectPermission
import com.task.shared.context.RequestContextHolder
import com.task.shared.exceptions.PermissionDeniedException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import reactor.core.publisher.Mono
import reactor.test.StepVerifier

/**
 * 权限切面测试
 * 验证基于注解的权限校验功能
 */
@ExtendWith(MockitoExtension::class)
@SpringJUnitConfig
class PermissionAspectTest {

    @Mock
    private lateinit var accessControlService: AccessControlService
    
    @Mock
    private lateinit var taskService: TaskService

    /**
     * 测试服务类，用于验证权限切面功能
     */
    class TestService(
        private val accessControlService: AccessControlService
    ) {
        @RequireProjectPermission(
            permission = ProjectPermissions.PROJECT_VIEW,
            projectIdParam = "projectId"
        )
        fun getProject(projectId: Long): Mono<String> {
            return Mono.just("Project-$projectId")
        }
        
        @RequireProjectPermission(
            ownerOnly = true,
            projectIdParam = "projectId"
        )
        fun deleteProject(projectId: Long): Mono<Void> {
            return Mono.empty()
        }
    }

    @Test
    fun `should allow access when user has permission`() {
        // 模拟用户有权限
        `when`(accessControlService.hasProjectPermission(1L, 100L, ProjectPermissions.PROJECT_VIEW))
            .thenReturn(Mono.just(true))
        
        val testService = TestService(accessControlService)
        val aspect = PermissionAspect(accessControlService, taskService)
        
        // 在有权限的情况下，应该能正常访问
        val result = RequestContextHolder.withUserId(1L) {
            testService.getProject(100L)
        }
        
        StepVerifier.create(result)
            .expectNext("Project-100")
            .verifyComplete()
    }

    @Test
    fun `should deny access when user has no permission`() {
        // 模拟用户没有权限
        `when`(accessControlService.hasProjectPermission(1L, 100L, ProjectPermissions.PROJECT_VIEW))
            .thenReturn(Mono.just(false))
        
        val testService = TestService(accessControlService)
        val aspect = PermissionAspect(accessControlService, taskService)
        
        // 在没有权限的情况下，应该抛出权限拒绝异常
        val result = RequestContextHolder.withUserId(1L) {
            testService.getProject(100L)
        }
        
        StepVerifier.create(result)
            .expectError(PermissionDeniedException::class.java)
            .verify()
    }

    @Test
    fun `should allow owner-only access for project owner`() {
        // 模拟用户是项目所有者
        `when`(accessControlService.checkProjectOwner(1L, 100L))
            .thenReturn(Mono.empty())
        
        val testService = TestService(accessControlService)
        val aspect = PermissionAspect(accessControlService, taskService)
        
        // 项目所有者应该能访问owner-only方法
        val result = RequestContextHolder.withUserId(1L) {
            testService.deleteProject(100L)
        }
        
        StepVerifier.create(result)
            .verifyComplete()
    }
}
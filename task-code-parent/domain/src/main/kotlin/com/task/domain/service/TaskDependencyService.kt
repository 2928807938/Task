package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.task.TaskDependency
import com.task.domain.repository.TaskDependencyRepository
import com.task.domain.repository.TaskRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 任务依赖关系服务
 * 管理任务之间的单向依赖关系，确保依赖的合理性，防止循环依赖
 */
@Service
class TaskDependencyService(
    private val taskDependencyRepository: TaskDependencyRepository,
    private val taskRepository: TaskRepository
) {
    private val logger = LoggerFactory.getLogger(TaskDependencyService::class.java)

    /**
     * 添加任务依赖关系
     * @param successorTaskId 后续任务ID（依赖于前置任务的任务）
     * @param predecessorTaskId 前置任务ID（被依赖的任务，必须先完成的任务）
     * @param description 依赖关系描述
     * @return 创建的依赖关系的Mono对象
     * @throws CircularDependencyException 如果添加此依赖会导致循环依赖
     */
    @Transactional
    fun addDependency(successorTaskId: Long, predecessorTaskId: Long, description: String?): Mono<TaskDependency> {
        // 1. 基本验证
        if (successorTaskId == predecessorTaskId) {
            return Mono.error(IllegalArgumentException("任务不能依赖自身"))
        }

        // 2. 检查任务是否存在
        return Mono.zip(
            taskRepository.findById(successorTaskId)
                .switchIfEmpty(Mono.error(IllegalArgumentException("后续任务不存在：ID=$successorTaskId"))),
            taskRepository.findById(predecessorTaskId)
                .switchIfEmpty(Mono.error(IllegalArgumentException("前置任务不存在：ID=$predecessorTaskId")))
        ).flatMap { tuple ->
            val successorTask = tuple.t1
            val predecessorTask = tuple.t2
            
            // 3. 检查是否存在重复依赖
            taskDependencyRepository.findOne {
                fieldOf(TaskDependency::successorTaskId, ComparisonOperator.EQUALS, successorTaskId)
                fieldOf(TaskDependency::predecessorTaskId, ComparisonOperator.EQUALS, predecessorTaskId)
            }.flatMap { existingDependency ->
                if (existingDependency != null) {
                    Mono.error<TaskDependency>(IllegalStateException("依赖关系已存在"))
                } else {
                    // 4. 检查是否会形成循环依赖
                    wouldCreateCircularDependency(successorTaskId, predecessorTaskId)
                        .flatMap { willCreateCircular ->
                            if (willCreateCircular) {
                                Mono.error(CircularDependencyException("添加此依赖将导致循环依赖"))
                            } else {
                                // 5. 创建新的依赖关系
                                val dependency = TaskDependency(
                                    successorTaskId = successorTaskId,
                                    predecessorTaskId = predecessorTaskId,
                                    description = description,
                                    successorTask = successorTask,
                                    predecessorTask = predecessorTask,
                                    createdAt = OffsetDateTime.now(),
                                    version = 1
                                )
                                
                                logger.info("创建依赖关系：后续任务[$successorTaskId] 依赖于 前置任务[$predecessorTaskId]")
                                
                                taskDependencyRepository.save(dependency)
                                    .doOnError { e ->
                                        logger.error("保存依赖关系失败: ${e.message}", e)
                                    }
                            }
                        }
                }
            }
        }
    }

    /**
     * 检查添加新依赖是否会形成循环依赖
     * @param successorTaskId 后续任务ID（依赖方）
     * @param predecessorTaskId 前置任务ID（被依赖方）
     * @return 如果会形成循环依赖返回true的Mono
     */
    private fun wouldCreateCircularDependency(successorTaskId: Long, predecessorTaskId: Long): Mono<Boolean> {
        // 如果B依赖于A，那么我们要确保A不直接或间接依赖于B
        // 检查A是否依赖于B（直接或间接）
        return isTaskDependentOn(predecessorTaskId, successorTaskId, mutableSetOf())
    }
    
    /**
     * 递归检查sourceTaskId是否直接或间接依赖于targetTaskId
     * @param sourceTaskId 源任务ID
     * @param targetTaskId 目标任务ID
     * @param visitedTasks 已访问的任务ID集合（用于避免无限递归）
     * @return 如果存在依赖路径返回true的Mono
     */
    private fun isTaskDependentOn(
        sourceTaskId: Long, 
        targetTaskId: Long, 
        visitedTasks: MutableSet<Long>
    ): Mono<Boolean> {
        // 防止无限递归
        if (sourceTaskId in visitedTasks) {
            return Mono.just(false)
        }
        visitedTasks.add(sourceTaskId)
        
        // 直接依赖检查
        if (sourceTaskId == targetTaskId) {
            return Mono.just(true)
        }
        
        // 获取sourceTaskId依赖的所有前置任务
        return taskDependencyRepository.list {
            fieldOf(TaskDependency::successorTaskId, ComparisonOperator.EQUALS, sourceTaskId)
        }
        .collectList()
        .flatMap { dependencies ->
            if (dependencies.isEmpty()) {
                return@flatMap Mono.just(false)
            }
            
            val predecessorIds = dependencies.map { it.predecessorTaskId }
            
            // 递归检查每个前置任务
            Flux.fromIterable(predecessorIds)
                .flatMap { predecessorId -> 
                    isTaskDependentOn(predecessorId, targetTaskId, visitedTasks)
                }
                .any { isDependent -> isDependent }
        }
    }
}

/**
 * 循环依赖异常
 */
class CircularDependencyException(message: String) : RuntimeException(message)

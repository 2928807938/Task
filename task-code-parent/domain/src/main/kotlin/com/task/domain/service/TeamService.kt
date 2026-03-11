package com.task.domain.service

import com.task.domain.model.common.ComparisonOperator
import com.task.domain.model.common.fieldOf
import com.task.domain.model.team.Team
import com.task.domain.model.team.TeamMember
import com.task.domain.repository.TeamMemberRepository
import com.task.domain.repository.TeamRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.OffsetDateTime

/**
 * 团队服务
 * 负责处理与团队、团队成员、团队角色相关的领域逻辑
 */
@Service
class TeamService (
    private val teamMemberRepository: TeamMemberRepository,
    private val teamRepository: TeamRepository
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    /**
     * 统计用户有权限访问的所有团队的成员总数
     *
     * @param userId 用户ID
     * @return 用户有权限访问的所有团队的成员总数
     */
    fun countUserTeamMembers(userId: Long): Mono<Int> {
        log.info("统计用户有权限访问的所有团队的成员总数: userId={}", userId)

        // 1. 查询用户所在的所有团队
        return teamMemberRepository.list {
            fieldOf(TeamMember::userId, ComparisonOperator.EQUALS, userId)
        }
            .map { it.teamId }
            .collectList()
            .flatMap { teamIds ->
                if (teamIds.isEmpty()) {
                    log.info("用户不属于任何团队: userId={}", userId)
                    return@flatMap Mono.just(0)
                }

                // 2. 统计这些团队的所有成员数量（去重）
                teamMemberRepository.list {
                    fieldOf(TeamMember::teamId, ComparisonOperator.IN, teamIds)
                }
                    .map { it.userId }
                    .distinct()
                    .count()
                    .map { it.toInt() }
            }
            .doOnSuccess { count ->
                log.info("用户有权限访问的所有团队的成员总数: userId={}, count={}", userId, count)
            }
            .onErrorResume { e ->
                log.error("统计用户有权限访问的所有团队的成员总数失败: userId={}, 错误: {}", userId, e.message, e)
                Mono.just(0)
            }
    }

    /**
     * 获取团队成员数量
     *
     * @param teamId 团队ID
     * @return 团队成员数量
     */
    fun countTeamMembers(teamId: Long): Mono<Int> {
        log.info("获取团队成员数量: teamId={}", teamId)

        return teamMemberRepository.list {
            fieldOf(TeamMember::teamId, ComparisonOperator.EQUALS, teamId)
        }
            .count()
            .map { it.toInt() }
            .doOnSuccess { count ->
                log.info("团队成员数量: teamId={}, count={}", teamId, count)
            }
            .onErrorResume { e ->
                log.error("获取团队成员数量失败: teamId={}, 错误: {}", teamId, e.message, e)
                Mono.just(0)
            }
    }

    /**
     * 获取指定时间点的团队成员数量
     *
     * @param teamId 团队ID
     * @param asOf 时间点
     * @return 团队成员数量
     */
    fun countTeamMembersAsOf(teamId: Long, asOf: OffsetDateTime): Mono<Int> {
        log.info("获取指定时间点的团队成员数量: teamId={}, asOf={}", teamId, asOf)

        return teamMemberRepository.list {
            fieldOf(TeamMember::teamId, ComparisonOperator.EQUALS, teamId)
            fieldOf(TeamMember::joinedAt, ComparisonOperator.LESS_OR_EQUAL, asOf)
        }
            .count()
            .map { it.toInt() }
            .doOnSuccess { count ->
                log.info("指定时间点的团队成员数量: teamId={}, asOf={}, count={}", teamId, asOf, count)
            }
            .onErrorResume { e ->
                log.error("获取指定时间点的团队成员数量失败: teamId={}, asOf={}, 错误: {}", teamId, asOf, e.message, e)
                Mono.just(0)
            }
    }

    /**
     * 获取团队成员ID列表
     *
     * @param teamId 团队ID
     * @return 团队成员ID列表
     */
    fun getTeamMemberIds(teamId: Long): Mono<List<Long>> {
        log.info("获取团队成员ID列表: teamId={}", teamId)

        return teamMemberRepository.list {
            fieldOf(TeamMember::teamId, ComparisonOperator.EQUALS, teamId)
        }
            .map { it.userId }
            .collectList()
            .doOnSuccess { memberIds ->
                log.info("团队成员ID列表: teamId={}, count={}", teamId, memberIds.size)
            }
            .onErrorResume { e ->
                log.error("获取团队成员ID列表失败: teamId={}, 错误: {}", teamId, e.message, e)
                Mono.just(emptyList())
            }
    }
    
    /**
     * 获取用户所属的所有团队ID
     *
     * @param userId 用户ID
     * @return 用户所属的团队ID列表
     */
    fun getUserTeamIds(userId: Long): Mono<List<Long>> {
        log.info("获取用户所属的所有团队ID: userId={}", userId)
        
        return teamMemberRepository.list {
            fieldOf(TeamMember::userId, ComparisonOperator.EQUALS, userId)
        }
            .map { it.teamId }
            .collectList()
            .doOnSuccess { teamIds ->
                log.info("用户所属的团队ID列表: userId={}, count={}", userId, teamIds.size)
            }
            .onErrorResume { e ->
                log.error("获取用户所属的团队ID列表失败: userId={}, 错误: {}", userId, e.message, e)
                Mono.just(emptyList())
            }
    }
    
    /**
     * 创建新团队
     *
     * @param name 团队名称
     * @param description 团队描述
     * @param creatorId 创建者ID
     * @return 创建的团队
     */
    fun createTeam(name: String, description: String?, creatorId: Long): Mono<Team> {
        log.info("创建新团队: name={}, creatorId={}", name, creatorId)
        
        // 创建团队实体
        val now = OffsetDateTime.now()
        val team = Team(
            id = 0, // 会由数据库自动生成ID
            name = name,
            description = description,
            creatorId = creatorId,
            createdAt = now
        )
        
        // 保存团队
        return teamRepository.save(team)
            .flatMap { savedTeam ->
                // 添加团队领导者作为成员
                val leaderMember = TeamMember(
                    id = 0, // 会由数据库自动生成ID
                    teamId = savedTeam.id,
                    userId = creatorId, // 创建者作为团队领导者
                    roleId = 1, // 领导者角色ID
                    joinedAt = now,
                    createdAt = now
                )
                
                // 保存团队成员
                teamMemberRepository.save(leaderMember)
                    .thenReturn(savedTeam)
            }
            .doOnSuccess { savedTeam ->
                log.info("成功创建团队: id={}, name={}", savedTeam.id, savedTeam.name)
            }
            .onErrorResume { e ->
                log.error("创建团队失败: name={}, 错误: {}", name, e.message, e)
                Mono.error(e)
            }
    }
}

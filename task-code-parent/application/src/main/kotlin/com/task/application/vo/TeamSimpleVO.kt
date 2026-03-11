package com.task.application.vo

import com.task.domain.model.team.Team

/**
 * 团队简要信息视图对象
 * 仅包含团队基本信息：ID、名称和描述
 */
data class TeamSimpleVO(

    /**
     * 团队ID
     */
    val id: Long,

    /**
     * 团队名称
     */
    val name: String,

    /**
     * 团队描述
     */
    val description: String?
) {
    companion object {
        /**
         * 从领域模型创建视图对象
         *
         * @param team 团队领域模型
         * @return 团队简要信息视图对象
         */
        fun fromDomain(team: Team): TeamSimpleVO {
            return TeamSimpleVO(
                id = team.id,
                name = team.name,
                description = team.description
            )
        }
    }
}

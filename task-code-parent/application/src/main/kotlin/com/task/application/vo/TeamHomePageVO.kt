package com.task.application.vo

/**
 * 团队首页数据传输对象
 * 包含团队首页所有相关数据
 */
data class TeamHomePageVO(

    /**
     * 团队概览信息
     */
    val overview: TeamOverviewVO,

    /**
     * 活跃度热力图数据
     */
    val activityHeatmap: List<ActivityHeatmapPointVO>,

    /**
     * 部门结构
     */
    val departmentStructure: List<DepartmentVO>,

    /**
     * 最近沟通记录
     */
    val recentCommunications: List<CommunicationRecordVO>
)
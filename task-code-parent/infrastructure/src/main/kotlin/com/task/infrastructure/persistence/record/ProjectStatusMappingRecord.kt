package com.task.infrastructure.persistence.record

import com.task.infrastructure.persistence.base.BaseRecord
import org.springframework.data.relational.core.mapping.Table

/**
 * 项目状态映射表记录类
 * 映射到数据库中的t_project_status_mapping表，存储项目与状态的关联关系
 */
@Table("t_project_status_mapping")
data class ProjectStatusMappingRecord(

    /**
     * 项目ID
     */
    var projectId: Long,
    
    /**
     * 状态ID
     */
    var statusId: Long

) : BaseRecord()

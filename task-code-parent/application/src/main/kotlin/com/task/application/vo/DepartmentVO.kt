package com.task.application.vo

/**
 * 部门数据传输对象
 * 支持嵌套结构，表示部门层级关系
 */
data class DepartmentVO(
    // 部门ID
    val id: Long,
    // 部门名称
    val name: String,
    // 部门人数
    val memberCount: Int,
    // 子部门列表
    val subDepartments: List<DepartmentVO> = emptyList()
)
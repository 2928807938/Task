package com.task.domain.model.common

/**
 * 比较操作符枚举类
 * 用于定义搜索条件中的比较操作
 */
enum class ComparisonOperator {
    EQUALS,           // 等于
    NOT_EQUALS,       // 不等于
    GREATER_THAN,     // 大于
    LESS_THAN,        // 小于
    GREATER_OR_EQUAL, // 大于等于
    LESS_OR_EQUAL,    // 小于等于
    LIKE,            // 模糊匹配
    NOT_LIKE,        // 不匹配
    IN,              // 包含于
    NOT_IN,          // 不包含于
    BETWEEN,         // 介于...之间
    NOT_BETWEEN,     // 不介于...之间
    IS_NULL,         // 为空
    IS_NOT_NULL,     // 不为空
    EXISTS,          // 存在
    NOT_EXISTS,      // 不存在
    STARTS_WITH,     // 以...开始
    ENDS_WITH,       // 以...结束
    CONTAINS,        // 包含
    NOT_CONTAINS,    // 不包含
    ARRAY_CONTAINS,  // 数组包含
    ARRAY_EMPTY,     // 数组为空
    ARRAY_NOT_EMPTY, // 数组不为空
    ALL,             // 全部匹配
    ANY,             // 任意匹配
    SOME,            // 部分匹配
    OVERLAPS,        // 重叠
    MATCH,           // 匹配
    MATCH_REGEX,     // 正则匹配
    MATCH_CASE_INSENSITIVE,  // 不区分大小写匹配
    SIMILAR_TO,      // 相似匹配
    ILIKE,           // 不区分大小写的模糊匹配
    FULL_TEXT,       // 全文搜索
    JSONB_CONTAINS,  // JSON包含
    JSONB_EXISTS,    // JSON字段存在
    ARRAY_APPEND,    // 数组追加
    ARRAY_REMOVE,    // 数组移除
    ARRAY_REPLACE,   // 数组替换
    FULL_TEXT_SEARCH_AND,  // 全文搜索AND
    FULL_TEXT_SEARCH_OR,   // 全文搜索OR
    RANGE_CONTAINS,  // 范围包含
    RANGE_OVERLAPS,  // 范围重叠
    RANGE_LEFT_OF,   // 范围在左
    RANGE_RIGHT_OF,  // 范围在右
    RANGE_ADJACENT,  // 范围相邻
    RANGE_UNION,     // 范围合并
    GEO_CONTAINS,    // 地理位置包含
    GEO_WITHIN       // 地理位置在范围内
}
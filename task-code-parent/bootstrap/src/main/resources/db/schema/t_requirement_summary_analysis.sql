-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_summary_analysis;

-- 需求总结分析表
-- 存储需求的总结和分析信息
CREATE TABLE t_requirement_summary_analysis (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    summary_json TEXT NOT NULL, -- 存储摘要信息，包含title, overview, keyPoints, challenges, opportunities，JSON格式的字符串
    task_arrangement_json TEXT NOT NULL, -- 存储任务安排信息，包含phases, resourceRecommendations, riskManagement，JSON格式的字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_summary_analysis_requirement_id ON t_requirement_summary_analysis(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_summary_analysis IS '需求总结分析表，用于存储需求的总结和分析信息';
COMMENT ON COLUMN t_requirement_summary_analysis.id IS '主键ID';
COMMENT ON COLUMN t_requirement_summary_analysis.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_summary_analysis.summary_json IS '摘要信息，JSON格式的字符串，包含title, overview, keyPoints, challenges, opportunities字段，其中keyPoints、challenges、opportunities为字符串数组';
COMMENT ON COLUMN t_requirement_summary_analysis.task_arrangement_json IS '任务安排信息，JSON格式的字符串，包含phases, resourceRecommendations, riskManagement字段，具体结构如下：
- phases包含name、description、estimatedWorkload、suggestedTimeframe、tasks字段，其中tasks包含name、priority、estimatedWorkload、dependencies、assignmentSuggestion，dependencies为字符串数组
- resourceRecommendations包含personnel、skills、tools字段，均为字符串数组
- riskManagement包含risk、impact、mitigation字段，均为字符串数组';
COMMENT ON COLUMN t_requirement_summary_analysis.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_summary_analysis.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_summary_analysis.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_summary_analysis.version IS '版本号，用于乐观锁'; 
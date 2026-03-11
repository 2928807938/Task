-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_completeness;

-- 需求完整度检查表
-- 存储需求的完整度评估信息
CREATE TABLE t_requirement_completeness (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    overall_completeness VARCHAR(50) NOT NULL, -- 总体完整度
    aspects_json TEXT, -- 各方面完整度，包含name和completeness字段，JSON格式的字符串
    optimization_suggestions_json TEXT, -- 优化建议，包含icon和content字段，JSON格式的字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_completeness_requirement_id ON t_requirement_completeness(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_completeness IS '需求完整度检查表，用于评估需求的完整度';
COMMENT ON COLUMN t_requirement_completeness.id IS '主键ID';
COMMENT ON COLUMN t_requirement_completeness.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_completeness.overall_completeness IS '总体完整度评估，如"高"、"中"、"低"';
COMMENT ON COLUMN t_requirement_completeness.aspects_json IS '各方面完整度评估，JSON格式的字符串，包含name和completeness字段';
COMMENT ON COLUMN t_requirement_completeness.optimization_suggestions_json IS '优化建议，JSON格式的字符串，包含icon和content字段';
COMMENT ON COLUMN t_requirement_completeness.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_completeness.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_completeness.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_completeness.version IS '版本号，用于乐观锁'; 
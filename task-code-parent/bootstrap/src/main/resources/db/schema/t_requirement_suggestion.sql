-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_suggestion;

-- 需求智能建议表
-- 存储需求的智能建议信息
CREATE TABLE t_requirement_suggestion (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    suggestions_json TEXT, -- 建议列表，包含type、title、icon、color、description字段，JSON格式的字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_suggestion_requirement_id ON t_requirement_suggestion(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_suggestion IS '需求智能建议表，用于存储系统对需求的智能建议';
COMMENT ON COLUMN t_requirement_suggestion.id IS '主键ID';
COMMENT ON COLUMN t_requirement_suggestion.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_suggestion.suggestions_json IS '建议列表，JSON格式的字符串，包含type、title、icon、color、description字段';
COMMENT ON COLUMN t_requirement_suggestion.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_suggestion.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_suggestion.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_suggestion.version IS '版本号，用于乐观锁'; 
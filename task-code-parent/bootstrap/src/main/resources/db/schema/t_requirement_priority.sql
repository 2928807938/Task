-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_priority;

-- 需求优先级表
-- 存储需求的优先级、排期和相关因素信息
CREATE TABLE t_requirement_priority (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    priority_json TEXT, -- 存储优先级信息，包含level、score、analysis，JSON格式的字符串
    scheduling_json TEXT, -- 存储排期信息，包含recommendation，JSON格式的字符串
    factors_json TEXT, -- 存储因素信息，包含difficulty、resourceMatch、dependencies，JSON格式的字符串
    justification TEXT, -- 排期建议理由
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_priority_requirement_id ON t_requirement_priority(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_priority IS '需求优先级表，用于存储需求的优先级和排期信息';
COMMENT ON COLUMN t_requirement_priority.id IS '主键ID';
COMMENT ON COLUMN t_requirement_priority.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_priority.priority_json IS '优先级信息，JSON格式的字符串，包含level、score、analysis字段';
COMMENT ON COLUMN t_requirement_priority.scheduling_json IS '排期信息，JSON格式的字符串，包含recommendation字段';
COMMENT ON COLUMN t_requirement_priority.factors_json IS '影响因素，JSON格式的字符串，包含difficulty、resourceMatch、dependencies字段';
COMMENT ON COLUMN t_requirement_priority.justification IS '排期建议理由';
COMMENT ON COLUMN t_requirement_priority.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_priority.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_priority.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_priority.version IS '版本号，用于乐观锁'; 
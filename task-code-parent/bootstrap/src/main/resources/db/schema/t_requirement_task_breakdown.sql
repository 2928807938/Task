-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_task_breakdown;

-- 需求任务拆分表
-- 存储需求的任务拆分信息
CREATE TABLE t_requirement_task_breakdown (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    main_task TEXT NOT NULL, -- 主任务描述
    sub_tasks_json TEXT NOT NULL, -- 子任务列表，包含id,task_id,description,dependency,priority,parallel_group字段，JSON格式的字符串
    parallelism_score INT, -- 并行度评分
    parallel_execution_tips TEXT, -- 并行执行提示
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_task_breakdown_requirement_id ON t_requirement_task_breakdown(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_task_breakdown IS '需求任务拆分表，用于存储需求的任务拆分信息';
COMMENT ON COLUMN t_requirement_task_breakdown.id IS '主键ID';
COMMENT ON COLUMN t_requirement_task_breakdown.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_task_breakdown.main_task IS '主任务描述';
COMMENT ON COLUMN t_requirement_task_breakdown.sub_tasks_json IS '子任务列表，JSON格式的字符串，包含id,task_id,description,dependency,priority,parallel_group字段，其中dependency为JSON格式包含task_id';
COMMENT ON COLUMN t_requirement_task_breakdown.parallelism_score IS '并行度评分，用于评估任务的并行可行性';
COMMENT ON COLUMN t_requirement_task_breakdown.parallel_execution_tips IS '并行执行提示，提供任务并行执行的建议';
COMMENT ON COLUMN t_requirement_task_breakdown.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_task_breakdown.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_task_breakdown.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_task_breakdown.version IS '版本号，用于乐观锁'; 
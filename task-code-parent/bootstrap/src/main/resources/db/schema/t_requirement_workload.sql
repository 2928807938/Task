-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_workload;

-- 需求工作量表
-- 存储需求的工作量估计信息
CREATE TABLE t_requirement_workload (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    optimistic_json VARCHAR(20) NOT NULL, -- 乐观估计，JSON字符串
    most_likely_json VARCHAR(20) NOT NULL, -- 最可能估计，JSON字符串
    pessimistic_json VARCHAR(20) NOT NULL, -- 悉观估计，JSON字符串
    expected_json VARCHAR(20) NOT NULL, -- 期望工作量，JSON字符串
    standard_deviation_json VARCHAR(20) NOT NULL, -- 标准差，JSON字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_workload_requirement_id ON t_requirement_workload(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_workload IS '需求工作量表，用于存储需求的工作量估计信息';
COMMENT ON COLUMN t_requirement_workload.id IS '主键ID';
COMMENT ON COLUMN t_requirement_workload.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_workload.optimistic_json IS '乐观工作量估计，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.most_likely_json IS '最可能工作量估计，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.pessimistic_json IS '悉观工作量估计，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.expected_json IS '期望工作量，通常通过(optimistic + 4*most_likely + pessimistic)/6计算，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.standard_deviation_json IS '标准差，用于衡量估计的不确定性，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_workload.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_workload.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_workload.version IS '版本号，用于乐观锁'; 
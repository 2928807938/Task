-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_time_estimation;

-- 创建时间估计表
-- 此表用于存储任务的时间估计信息
CREATE TABLE t_time_estimation
(
    -- 时间估计唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 关联的任务ID，不允许为空，关联t_task表
    task_id         BIGINT           NOT NULL,

    -- 预计完成所需的小时数，不允许为空
    estimated_hours DOUBLE PRECISION NOT NULL,

    -- 估计创建者ID，不允许为空，关联t_user表
    created_by_id   BIGINT           NOT NULL,

    -- 基线类型，例如"初始估计"、"修订估计"等，不允许为空
    baseline_type   VARCHAR(50)      NOT NULL,

    -- 估计理由，记录为什么做出这样的估计，可为空
    justification   TEXT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT              NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at      TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version         INT              NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询时间估计的性能
CREATE INDEX idx_time_estimation_task_id ON t_time_estimation (task_id);

-- 创建索引：创建者ID索引，提高按创建者查询时间估计的性能
CREATE INDEX idx_time_estimation_created_by_id ON t_time_estimation (created_by_id);

-- 创建索引：基线类型索引，提高按基线类型查询的性能
CREATE INDEX idx_time_estimation_baseline_type ON t_time_estimation (baseline_type);

-- 添加表注释
COMMENT ON TABLE t_time_estimation IS '时间估计表，存储任务的时间估计信息';
COMMENT ON COLUMN t_time_estimation.id IS '时间估计唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_time_estimation.task_id IS '关联的任务ID，关联t_task表';
COMMENT ON COLUMN t_time_estimation.estimated_hours IS '预计完成所需的小时数';
COMMENT ON COLUMN t_time_estimation.created_by_id IS '估计创建者ID，关联t_user表';
COMMENT ON COLUMN t_time_estimation.baseline_type IS '基线类型，例如"初始估计"、"修订估计"等';
COMMENT ON COLUMN t_time_estimation.justification IS '估计理由，记录为什么做出这样的估计';
COMMENT ON COLUMN t_time_estimation.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_time_estimation.created_at IS '记录创建时间';
COMMENT ON COLUMN t_time_estimation.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_time_estimation.version IS '乐观锁版本号，用于并发控制';
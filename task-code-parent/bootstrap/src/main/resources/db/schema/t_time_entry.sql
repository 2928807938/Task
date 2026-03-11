-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_time_entry;

-- 创建时间记录表
-- 此表用于存储用户在任务上花费的时间记录
CREATE TABLE t_time_entry
(
    -- 时间记录唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id           BIGINT PRIMARY KEY,

    -- 所属任务ID，不允许为空，关联t_task表
    task_id      BIGINT      NOT NULL,

    -- 用户ID，不允许为空，关联t_user表
    user_id      BIGINT      NOT NULL,

    -- 开始时间，不允许为空
    start_time   TIMESTAMPTZ NOT NULL,

    -- 结束时间，可为空（表示时间记录正在进行中）
    end_time     TIMESTAMPTZ,

    -- 持续时间（秒），可为空（如果end_time为空则此字段也为空）
    duration     BIGINT,

    -- 描述，可为空
    description  TEXT,

    -- 计费类型，整数，默认为1（标准计费）
    -- 0=不可计费，1=标准计费，2=折扣计费，3=加急计费，4=固定计费
    billing_type INT         NOT NULL DEFAULT 1,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted      INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at   TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version      INT         NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询时间记录的性能
CREATE INDEX idx_time_entry_task_id ON t_time_entry (task_id);

-- 创建索引：用户ID索引，提高按用户查询时间记录的性能
CREATE INDEX idx_time_entry_user_id ON t_time_entry (user_id);

-- 创建索引：开始时间索引，提高按时间段查询的性能
CREATE INDEX idx_time_entry_start_time ON t_time_entry (start_time);

-- 创建索引：结束时间索引，提高按时间段查询的性能
CREATE INDEX idx_time_entry_end_time ON t_time_entry (end_time);

-- 创建索引：计费类型索引，提高按计费类型查询的性能
CREATE INDEX idx_time_entry_billing_type ON t_time_entry (billing_type);

-- 添加表注释
COMMENT ON TABLE t_time_entry IS '时间记录表，存储用户在任务上花费的时间记录';
COMMENT ON COLUMN t_time_entry.id IS '时间记录唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_time_entry.task_id IS '所属任务ID，关联t_task表';
COMMENT ON COLUMN t_time_entry.user_id IS '用户ID，关联t_user表';
COMMENT ON COLUMN t_time_entry.start_time IS '开始时间';
COMMENT ON COLUMN t_time_entry.end_time IS '结束时间，可为空（表示时间记录正在进行中）';
COMMENT ON COLUMN t_time_entry.duration IS '持续时间（秒），如果end_time为空则此字段也为空';
COMMENT ON COLUMN t_time_entry.description IS '描述';
COMMENT ON COLUMN t_time_entry.billing_type IS '计费类型：0=不可计费，1=标准计费，2=折扣计费，3=加急计费，4=固定计费';
COMMENT ON COLUMN t_time_entry.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_time_entry.created_at IS '记录创建时间';
COMMENT ON COLUMN t_time_entry.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_time_entry.version IS '乐观锁版本号，用于并发控制';
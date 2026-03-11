-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_task_tag;

-- 创建任务标签关联表
-- 此表用于存储任务与标签之间的多对多关系
CREATE TABLE t_task_tag
(
    -- 关联记录唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id         BIGINT PRIMARY KEY,

    -- 任务ID，不允许为空，关联t_task表
    task_id    BIGINT      NOT NULL,

    -- 标签ID，不允许为空，关联t_tag表
    tag_id     BIGINT      NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version    INT         NOT NULL DEFAULT 0,

    -- 创建唯一约束：确保一个任务只能关联一个标签一次
    CONSTRAINT uk_task_tag UNIQUE (task_id, tag_id)
);

-- 创建索引：任务ID索引，提高按任务查询标签的性能
CREATE INDEX idx_task_tag_task_id ON t_task_tag (task_id);

-- 创建索引：标签ID索引，提高按标签查询任务的性能
CREATE INDEX idx_task_tag_tag_id ON t_task_tag (tag_id);

-- 添加表注释
COMMENT ON TABLE t_task_tag IS '任务标签关联表，存储任务与标签之间的多对多关系';
COMMENT ON COLUMN t_task_tag.id IS '关联记录唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_tag.task_id IS '任务ID，关联t_task表';
COMMENT ON COLUMN t_task_tag.tag_id IS '标签ID，关联t_tag表';
COMMENT ON COLUMN t_task_tag.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task_tag.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_tag.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task_tag.version IS '乐观锁版本号，用于并发控制';
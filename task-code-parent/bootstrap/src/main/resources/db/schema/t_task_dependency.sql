-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_task_dependency;

-- 创建任务依赖关系表
-- 此表用于存储任务之间的依赖关系，实现多对多的依赖结构
CREATE TABLE t_task_dependency
(
    -- 依赖关系唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id                 BIGINT PRIMARY KEY,
    
    -- 依赖方任务ID，不允许为空，关联t_task表
    task_id            BIGINT NOT NULL,
    
    -- 被依赖任务ID，不允许为空，关联t_task表
    depends_on_task_id BIGINT NOT NULL,
    
    -- 依赖关系说明，可为空
    description        TEXT,
    
    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted            INT NOT NULL DEFAULT 0,
    
    -- 记录创建时间，使用带时区的时间戳类型
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at         TIMESTAMPTZ,
    
    -- 乐观锁版本号，用于并发控制
    version            INT NOT NULL DEFAULT 0,
    
    -- 添加唯一约束，确保同一对任务之间只能存在一个依赖关系
    CONSTRAINT uk_task_dependency UNIQUE (task_id, depends_on_task_id)
    
    -- 外键约束已删除以允许删除t_task表
    -- CONSTRAINT fk_task_dependency_task FOREIGN KEY (task_id) REFERENCES t_task (id),
    -- CONSTRAINT fk_task_dependency_depends_on_task FOREIGN KEY (depends_on_task_id) REFERENCES t_task (id)
);

-- 创建索引：依赖方任务ID索引，提高查询任务依赖关系的性能
CREATE INDEX idx_task_dependency_task_id ON t_task_dependency (task_id);

-- 创建索引：被依赖任务ID索引，提高查询依赖于特定任务的关系性能
CREATE INDEX idx_task_dependency_depends_on_task_id ON t_task_dependency (depends_on_task_id);

-- 添加表注释
COMMENT ON TABLE t_task_dependency IS '任务依赖关系表，存储任务之间的依赖关系';
COMMENT ON COLUMN t_task_dependency.id IS '依赖关系唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_dependency.task_id IS '依赖方任务ID，表示哪个任务依赖其他任务';
COMMENT ON COLUMN t_task_dependency.depends_on_task_id IS '被依赖任务ID，表示被哪个任务所依赖';
COMMENT ON COLUMN t_task_dependency.description IS '依赖关系说明，描述为什么存在此依赖';
COMMENT ON COLUMN t_task_dependency.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task_dependency.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_dependency.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task_dependency.version IS '乐观锁版本号，用于并发控制';

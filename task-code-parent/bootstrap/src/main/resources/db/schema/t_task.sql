-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_task;

-- 创建任务表
-- 此表用于存储系统中的所有任务信息
CREATE TABLE t_task
(
    -- 任务唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id             BIGINT PRIMARY KEY,

    -- 任务标题，不允许为空，最大长度200个字符
    title          VARCHAR(200) NOT NULL,

    -- 任务描述，可为空，使用TEXT类型存储长文本
    description    TEXT,

    -- 所属项目ID，不允许为空，关联t_project表
    project_id     BIGINT       NOT NULL,

    -- 父任务ID，可为空，关联t_task表自身，用于实现任务层级结构
    parent_task_id BIGINT,

    -- 需求对话列表ID，可为空，关联t_requirement_conversation_list表
    conversation_list_id BIGINT,

    -- 任务状态ID，不允许为空，关联t_task_status表
    status_id      BIGINT       NOT NULL,

    -- 任务优先级ID，不允许为空，关联t_priority表
    priority_id    BIGINT       NOT NULL,

    -- 任务创建者ID，不允许为空，关联t_user表
    creator_id     BIGINT       NOT NULL,

    -- 任务负责人ID，可为空，关联t_user表
    assignee_id    BIGINT,

    -- 任务开始时间，可为空
    start_time     TIMESTAMPTZ,

    -- 任务截止时间，可为空
    due_date       TIMESTAMPTZ,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted        INT          NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at     TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version        INT          NOT NULL DEFAULT 0
);

-- 创建索引：项目ID索引，提高按项目查询任务的性能
CREATE INDEX idx_task_project_id ON t_task (project_id);

-- 创建索引：父任务ID索引，提高查询子任务的性能
CREATE INDEX idx_task_parent_task_id ON t_task (parent_task_id);

-- 创建索引：需求对话列表ID索引，提高关联查询性能
CREATE INDEX idx_task_conversation_list_id ON t_task (conversation_list_id);

-- 创建索引：状态ID索引，提高按状态查询任务的性能
CREATE INDEX idx_task_status_id ON t_task (status_id);

-- 创建索引：优先级ID索引，提高按优先级查询任务的性能
CREATE INDEX idx_task_priority_id ON t_task (priority_id);

-- 创建索引：创建者ID索引，提高按创建者查询任务的性能
CREATE INDEX idx_task_creator_id ON t_task (creator_id);

-- 创建索引：负责人ID索引，提高按负责人查询任务的性能
CREATE INDEX idx_task_assignee_id ON t_task (assignee_id);

-- 创建索引：开始时间索引，提高按开始时间查询任务的性能
CREATE INDEX idx_task_start_time ON t_task (start_time);

-- 创建索引：截止日期索引，提高按截止日期查询任务的性能
CREATE INDEX idx_task_due_date ON t_task (due_date);

-- 添加表注释
COMMENT ON TABLE t_task IS '任务表，存储系统中的所有任务信息';
COMMENT ON COLUMN t_task.id IS '任务唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task.title IS '任务标题';
COMMENT ON COLUMN t_task.description IS '任务描述';
COMMENT ON COLUMN t_task.project_id IS '所属项目ID，关联t_project表';
COMMENT ON COLUMN t_task.parent_task_id IS '父任务ID，关联t_task表自身，用于实现任务层级结构';
COMMENT ON COLUMN t_task.conversation_list_id IS '需求对话列表ID，关联t_requirement_conversation_list表';
COMMENT ON COLUMN t_task.status_id IS '任务状态ID，关联t_task_status表';
COMMENT ON COLUMN t_task.priority_id IS '任务优先级ID，关联t_priority表';
COMMENT ON COLUMN t_task.creator_id IS '任务创建者ID，关联t_user表';
COMMENT ON COLUMN t_task.assignee_id IS '任务负责人ID，关联t_user表';
COMMENT ON COLUMN t_task.start_time IS '任务开始时间';
COMMENT ON COLUMN t_task.due_date IS '任务截止日期';
COMMENT ON COLUMN t_task.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task.version IS '乐观锁版本号，用于并发控制';
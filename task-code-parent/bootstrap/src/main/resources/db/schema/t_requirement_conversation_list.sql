-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_conversation_list;

-- 需求对话列表表（基础版）
-- 仅包含主键ID和通用审计字段
CREATE TABLE t_requirement_conversation_list
(
    -- 对话列表唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id         BIGINT PRIMARY KEY,

    -- 所属项目ID，关联 t_project.id
    project_id BIGINT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version    INT         NOT NULL DEFAULT 0
);

CREATE INDEX idx_t_req_conv_list_project_id ON t_requirement_conversation_list(project_id);

-- 添加表注释
COMMENT ON TABLE t_requirement_conversation_list IS '需求对话列表表（基础版），包含项目归属与通用审计字段';
COMMENT ON COLUMN t_requirement_conversation_list.id IS '对话列表唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_requirement_conversation_list.project_id IS '所属项目ID，关联t_project表';
COMMENT ON COLUMN t_requirement_conversation_list.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_conversation_list.created_at IS '记录创建时间';
COMMENT ON COLUMN t_requirement_conversation_list.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_requirement_conversation_list.version IS '乐观锁版本号，用于并发控制';

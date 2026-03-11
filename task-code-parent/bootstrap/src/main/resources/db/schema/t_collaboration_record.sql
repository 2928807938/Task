-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_collaboration_record;

-- 创建协作记录表
-- 此表用于存储任务的协作交流信息，支持@用户功能
CREATE TABLE t_collaboration_record
(
    -- 记录唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id                BIGINT PRIMARY KEY,

    -- 所属任务ID，不允许为空，关联t_task表
    task_id           BIGINT      NOT NULL,

    -- 消息发送者ID，不允许为空，关联t_user表
    sender_id         BIGINT      NOT NULL,

    -- 被@的用户ID，可为空，关联t_user表
    mentioned_user_id BIGINT,

    -- 消息内容，不允许为空，使用TEXT类型存储长文本
    content           TEXT        NOT NULL,

    -- 消息类型：MENTION(@消息)、NORMAL(普通消息)
    type              VARCHAR(20) NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted           INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at        TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version           INT         NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询协作记录的性能
CREATE INDEX idx_collaboration_task_id ON t_collaboration_record (task_id);

-- 创建索引：发送者ID索引，提高按发送者查询协作记录的性能
CREATE INDEX idx_collaboration_sender_id ON t_collaboration_record (sender_id);

-- 创建索引：被@用户ID索引，提高查询@某用户记录的性能
CREATE INDEX idx_collaboration_mentioned_user_id ON t_collaboration_record (mentioned_user_id);

-- 添加表注释
COMMENT ON TABLE t_collaboration_record IS '协作记录表，存储任务的协作交流信息';
COMMENT ON COLUMN t_collaboration_record.id IS '记录唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_collaboration_record.task_id IS '所属任务ID，关联t_task表';
COMMENT ON COLUMN t_collaboration_record.sender_id IS '消息发送者ID，关联t_user表';
COMMENT ON COLUMN t_collaboration_record.mentioned_user_id IS '被@用户ID，关联t_user表';
COMMENT ON COLUMN t_collaboration_record.content IS '消息内容';
COMMENT ON COLUMN t_collaboration_record.type IS '消息类型:MENTION(@消息),NORMAL(普通消息)';
COMMENT ON COLUMN t_collaboration_record.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_collaboration_record.created_at IS '记录创建时间';
COMMENT ON COLUMN t_collaboration_record.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_collaboration_record.version IS '乐观锁版本号，用于并发控制'; 
-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_task_comment;

-- 创建任务评论表
-- 此表用于存储任务的评论信息，支持评论回复功能
CREATE TABLE t_task_comment
(
    -- 评论唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id                BIGINT PRIMARY KEY,

    -- 所属任务ID，不允许为空，关联t_task表
    task_id           BIGINT      NOT NULL,

    -- 评论作者ID，不允许为空，关联t_user表
    author_id         BIGINT      NOT NULL,

    -- 评论内容，不允许为空，使用TEXT类型存储长文本
    content           TEXT        NOT NULL,

    -- 父评论ID，可为空，关联t_task_comment表自身，用于实现评论回复功能
    parent_comment_id BIGINT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted           INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at        TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version           INT         NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询评论的性能
CREATE INDEX idx_task_comment_task_id ON t_task_comment (task_id);

-- 创建索引：作者ID索引，提高按作者查询评论的性能
CREATE INDEX idx_task_comment_author_id ON t_task_comment (author_id);

-- 创建索引：父评论ID索引，提高查询回复的性能
CREATE INDEX idx_task_comment_parent_id ON t_task_comment (parent_comment_id);

-- 添加表注释
COMMENT ON TABLE t_task_comment IS '任务评论表，存储任务的评论信息';
COMMENT ON COLUMN t_task_comment.id IS '评论唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_comment.task_id IS '所属任务ID，关联t_task表';
COMMENT ON COLUMN t_task_comment.author_id IS '评论作者ID，关联t_user表';
COMMENT ON COLUMN t_task_comment.content IS '评论内容';
COMMENT ON COLUMN t_task_comment.parent_comment_id IS '父评论ID，关联t_task_comment表自身，用于实现评论回复功能';
COMMENT ON COLUMN t_task_comment.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task_comment.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_comment.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task_comment.version IS '乐观锁版本号，用于并发控制';
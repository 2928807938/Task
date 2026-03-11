-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_invite_link;

-- 邀请链接表
CREATE TABLE t_invite_link
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 邀请链接的唯一代码
    code            VARCHAR(32)               NOT NULL,

    -- 创建者ID，关联t_user表
    creator_id      BIGINT                    NOT NULL,

    -- 项目ID，关联t_project表，可为空表示系统级邀请
    project_id      BIGINT,

    -- 链接有效期截止时间
    expire_at       TIMESTAMP WITH TIME ZONE  NOT NULL,

    -- 最大使用次数，null表示不限制
    max_usage_count INT,

    -- 当前已使用次数
    used_count      INT                       NOT NULL DEFAULT 0,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT                       NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at      TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version         INT                       NOT NULL DEFAULT 0
);

-- 创建索引
CREATE UNIQUE INDEX idx_invite_link_code ON t_invite_link (code) WHERE deleted = 0;
CREATE INDEX idx_invite_link_creator ON t_invite_link (creator_id) WHERE deleted = 0;
CREATE INDEX idx_invite_link_project ON t_invite_link (project_id) WHERE deleted = 0;
CREATE INDEX idx_invite_link_expire ON t_invite_link (expire_at) WHERE deleted = 0;

-- 添加注释
COMMENT ON TABLE t_invite_link IS '邀请链接表';
COMMENT ON COLUMN t_invite_link.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_invite_link.code IS '邀请链接的唯一代码';
COMMENT ON COLUMN t_invite_link.creator_id IS '创建者ID，关联t_user表';
COMMENT ON COLUMN t_invite_link.project_id IS '项目ID，关联t_project表，可为空表示系统级邀请';
COMMENT ON COLUMN t_invite_link.expire_at IS '链接有效期截止时间';
COMMENT ON COLUMN t_invite_link.max_usage_count IS '最大使用次数，null表示不限制';
COMMENT ON COLUMN t_invite_link.used_count IS '当前已使用次数';
COMMENT ON COLUMN t_invite_link.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_invite_link.created_at IS '记录创建时间';
COMMENT ON COLUMN t_invite_link.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_invite_link.version IS '乐观锁版本号，用于并发控制';
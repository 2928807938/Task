-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_user;

-- 系统用户表
CREATE TABLE t_user
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id            BIGINT PRIMARY KEY,

    -- 用户名，登录时使用，不可重复
    username      VARCHAR(50)              NOT NULL,

    -- 密码的哈希值，不存储明文密码
    password_hash VARCHAR(255)             NOT NULL,

    -- 用户电子邮箱，用于通知和找回密码，可为空；有值时不可重复
    email         VARCHAR(100),

    -- 用户最后登录时间
    last_login    TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 用户状态编码：1表示活跃可用，0表示已停用
    status        SMALLINT                 NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted       SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束
    CONSTRAINT uk_user_username UNIQUE (username, deleted),
    CONSTRAINT uk_user_email UNIQUE (email, deleted)
);

-- 添加索引
CREATE INDEX idx_user_status ON t_user (status);
CREATE INDEX idx_user_deleted ON t_user (deleted);

-- 添加注释
COMMENT
ON TABLE t_user IS '系统用户表，存储所有用户的基本信息和认证信息';
COMMENT
ON COLUMN t_user.id IS '用户唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user.username IS '用户名，登录时使用，不可重复';
COMMENT
ON COLUMN t_user.password_hash IS '密码的哈希值，不存储明文密码';
COMMENT
ON COLUMN t_user.email IS '用户电子邮箱，用于通知和找回密码，可为空；有值时不可重复';
COMMENT
ON COLUMN t_user.last_login IS '用户最后登录时间';
COMMENT
ON COLUMN t_user.status IS '用户状态编码：1表示活跃可用，0表示已停用';
COMMENT
ON COLUMN t_user.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user.version IS '乐观锁版本号，用于并发控制';

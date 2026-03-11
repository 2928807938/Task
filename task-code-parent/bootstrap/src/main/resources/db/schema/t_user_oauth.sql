-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_user_oauth;

-- 用户第三方登录表记录表
CREATE TABLE t_user_oauth
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id            BIGINT PRIMARY KEY,

    -- 关联的用户ID
    user_id       BIGINT                   NOT NULL,

    -- 提供商类型
    provider      SMALLINT                 NOT NULL,

    -- 第三方平台的用户ID
    provider_uid  VARCHAR(255)             NOT NULL,

    -- 访问令牌
    access_token  TEXT,

    -- 刷新令牌
    refresh_token TEXT,

    -- 令牌过期时间
    token_expires TIMESTAMP WITH TIME ZONE,

    -- 存储第三方平台的额外数据（JSONB类型）
    provider_data JSONB,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted       SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一用户在同一平台只有一个关联（考虑逻辑删除）
    CONSTRAINT uk_user_oauth UNIQUE (user_id, provider, provider_uid, deleted)
);

-- 添加索引
CREATE INDEX idx_user_oauth_user_id ON t_user_oauth (user_id);
CREATE INDEX idx_user_oauth_provider ON t_user_oauth (provider);
CREATE INDEX idx_user_oauth_deleted ON t_user_oauth (deleted);

-- 添加注释
COMMENT
ON TABLE t_user_oauth IS '用户第三方登录表，存储用户的第三方账号关联信息';
COMMENT
ON COLUMN t_user_oauth.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user_oauth.user_id IS '关联的用户ID';
COMMENT
ON COLUMN t_user_oauth.provider IS '提供商类型，对应OAuthProviderEnum';
COMMENT
ON COLUMN t_user_oauth.provider_uid IS '第三方平台的用户ID';
COMMENT
ON COLUMN t_user_oauth.access_token IS '访问令牌';
COMMENT
ON COLUMN t_user_oauth.refresh_token IS '刷新令牌';
COMMENT
ON COLUMN t_user_oauth.token_expires IS '令牌过期时间';
COMMENT
ON COLUMN t_user_oauth.provider_data IS '存储第三方平台的额外数据';
COMMENT
ON COLUMN t_user_oauth.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user_oauth.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user_oauth.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user_oauth.version IS '乐观锁版本号，用于并发控制';
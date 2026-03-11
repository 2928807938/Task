-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_user_profile;

-- 用户个人资料表记录表
CREATE TABLE t_user_profile
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 关联的用户ID，一对一关系
    user_id    BIGINT                   NOT NULL,

    -- 用户全名，真实姓名
    full_name  VARCHAR(100),

    -- 用户联系电话
    phone      VARCHAR(20),

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保一个用户只有一个资料记录（考虑逻辑删除）
    CONSTRAINT uk_user_profile_user_id UNIQUE (user_id, deleted)
);

-- 添加索引
CREATE INDEX idx_user_profile_deleted ON t_user_profile (deleted);

-- 添加注释
COMMENT
ON TABLE t_user_profile IS '用户个人资料表，存储用户的扩展信息';
COMMENT
ON COLUMN t_user_profile.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user_profile.user_id IS '关联的用户ID，一对一关系';
COMMENT
ON COLUMN t_user_profile.full_name IS '用户全名，真实姓名';
COMMENT
ON COLUMN t_user_profile.phone IS '用户联系电话';
COMMENT
ON COLUMN t_user_profile.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user_profile.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user_profile.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user_profile.version IS '乐观锁版本号，用于并发控制';
-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_user_role;

-- 用户角色关联记表
CREATE TABLE t_user_role
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 用户ID
    user_id    BIGINT                   NOT NULL,

    -- 角色ID
    role_id    BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一用户不会重复关联同一角色（考虑逻辑删除）
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id, deleted)
);

-- 添加索引
CREATE INDEX idx_user_role_user_id ON t_user_role (user_id);
CREATE INDEX idx_user_role_role_id ON t_user_role (role_id);
CREATE INDEX idx_user_role_deleted ON t_user_role (deleted);

-- 添加注释
COMMENT
ON TABLE t_user_role IS '用户角色关联表，实现用户与角色的多对多关联';
COMMENT
ON COLUMN t_user_role.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user_role.user_id IS '用户ID';
COMMENT
ON COLUMN t_user_role.role_id IS '角色ID';
COMMENT
ON COLUMN t_user_role.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user_role.version IS '乐观锁版本号，用于并发控制';
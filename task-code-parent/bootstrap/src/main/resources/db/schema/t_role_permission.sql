-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_role_permission;

-- 角色-权限关联表记录表
CREATE TABLE t_role_permission
(
    -- 关联记录唯一标识，使用BIGINT类型
    -- 采用TSID格式（有序的分布式ID）
    id            BIGINT PRIMARY KEY,

    -- 关联的角色ID
    -- 外键引用t_roles表的id字段
    role_id       BIGINT      NOT NULL,

    -- 关联的权限ID
    -- 外键引用t_permissions表的id字段
    permission_id BIGINT      NOT NULL,

    -- 逻辑删除标志，0表示未删除，非0值表示已删除
    deleted       INTEGER     NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMPTZ NOT NULL,

    -- 记录最后更新时间
    updated_at    TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER     NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保一个角色不会重复关联同一个权限
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
);

-- 添加注释
COMMENT
ON TABLE t_role_permission IS '角色-权限关联表，存储角色与权限之间的多对多关系';
COMMENT
ON COLUMN t_role_permission.id IS '关联记录唯一标识';
COMMENT
ON COLUMN t_role_permission.role_id IS '关联的角色ID';
COMMENT
ON COLUMN t_role_permission.permission_id IS '关联的权限ID';
COMMENT
ON COLUMN t_role_permission.deleted IS '逻辑删除标志，0表示未删除';
COMMENT
ON COLUMN t_role_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_role_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_role_permission.version IS '乐观锁版本号';

-- 创建索引以提高查询性能
CREATE INDEX idx_role_permission_role_id ON t_role_permission (role_id);
CREATE INDEX idx_role_permission_permission_id ON t_role_permission (permission_id);
CREATE INDEX idx_role_permission_deleted ON t_role_permission (deleted);

-- 添加索引注释
COMMENT
ON INDEX idx_role_permission_role_id IS '角色ID索引，用于查询角色的所有权限';
COMMENT
ON INDEX idx_role_permission_permission_id IS '权限ID索引，用于查询拥有特定权限的所有角色';
COMMENT
ON INDEX idx_role_permission_deleted IS '逻辑删除标志索引，用于过滤已删除记录';
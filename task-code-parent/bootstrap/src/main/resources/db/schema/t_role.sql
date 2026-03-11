-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_role;

-- 系统全局角色表记录表
CREATE TABLE t_role
(
    -- 角色唯一标识，使用BIGINT类型
    -- 采用TSID格式（有序的分布式ID）
    id          BIGINT PRIMARY KEY,

    -- 角色名称，不可重复
    -- 用于在系统中标识角色，例如"管理员"、"普通用户"等
    name        VARCHAR(100) NOT NULL,

    -- 角色描述，说明角色的用途和权限范围
    -- 可以为空
    description TEXT,

    -- 逻辑删除标志，0表示未删除，非0值表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted     INTEGER      NOT NULL DEFAULT 0,

    -- 记录创建时间
    -- 使用带时区的时间戳类型，确保时间的准确性
    created_at  TIMESTAMPTZ  NOT NULL,

    -- 记录最后更新时间
    -- 可以为空，表示记录尚未更新过
    updated_at  TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version     INTEGER      NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保角色名称在系统中唯一
    CONSTRAINT uk_role_name UNIQUE (name)
);

-- 添加注释
COMMENT
ON TABLE t_role IS '系统全局角色表，存储系统中所有可用的角色定义';
COMMENT
ON COLUMN t_role.id IS '角色唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_role.name IS '角色名称，不可重复';
COMMENT
ON COLUMN t_role.description IS '角色描述，说明角色的用途和权限范围';
COMMENT
ON COLUMN t_role.deleted IS '逻辑删除标志，0表示未删除，非0值表示已删除';
COMMENT
ON COLUMN t_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_role.version IS '乐观锁版本号，用于并发控制';

-- 创建索引以提高查询性能
-- 为常用查询条件创建索引
CREATE INDEX idx_role_deleted ON t_role (deleted);
CREATE INDEX idx_role_created_at ON t_role (created_at);

-- 添加索引注释
COMMENT
ON INDEX idx_role_deleted IS '逻辑删除标志索引，用于过滤已删除记录';
COMMENT
ON INDEX idx_role_created_at IS '创建时间索引，用于按创建时间排序和查询';
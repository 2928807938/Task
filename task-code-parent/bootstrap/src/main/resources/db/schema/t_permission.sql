-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_permission;

-- 权限表记录表
CREATE TABLE t_permission
(
    -- 权限唯一标识，使用BIGINT类型
    -- 采用TSID格式（有序的分布式ID）
    id          BIGINT PRIMARY KEY,

    -- 权限名称，用于显示
    -- 例如"创建任务"、"删除用户"等
    name        VARCHAR(100) NOT NULL,

    -- 权限编码，用于权限检查
    -- 使用冒号分隔的格式，如"task:create"、"user:delete"
    code        VARCHAR(100) NOT NULL,

    -- 权限说明，描述权限的作用和范围
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

    -- 添加唯一约束，确保权限编码在系统中唯一
    CONSTRAINT uk_permission_code UNIQUE (code)
);

-- 添加注释
COMMENT
ON TABLE t_permission IS '系统权限表，存储系统中所有可用的权限定义';
COMMENT
ON COLUMN t_permission.id IS '权限唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_permission.name IS '权限名称，用于显示';
COMMENT
ON COLUMN t_permission.code IS '权限编码，用于权限检查，如"task:create"';
COMMENT
ON COLUMN t_permission.description IS '权限说明，描述权限的作用和范围';
COMMENT
ON COLUMN t_permission.deleted IS '逻辑删除标志，0表示未删除，非0值表示已删除';
COMMENT
ON COLUMN t_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_permission.version IS '乐观锁版本号，用于并发控制';

-- 创建索引以提高查询性能
CREATE INDEX idx_permission_deleted ON t_permission (deleted);
CREATE INDEX idx_permission_code ON t_permission (code);
CREATE INDEX idx_permission_created_at ON t_permission (created_at);

-- 添加索引注释
COMMENT
ON INDEX idx_permission_deleted IS '逻辑删除标志索引，用于过滤已删除记录';
COMMENT
ON INDEX idx_permission_code IS '权限编码索引，用于权限检查和查询';
COMMENT
ON INDEX idx_permission_created_at IS '创建时间索引，用于按创建时间排序和查询';
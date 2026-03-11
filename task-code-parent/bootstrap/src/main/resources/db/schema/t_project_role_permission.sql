-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_role_permission;

-- 项目角色-权限关联表
CREATE TABLE t_project_role_permission
(
    -- 主键，使用TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 关联的项目角色ID
    project_role_id BIGINT                   NOT NULL,

    -- 关联的权限ID
    permission_id   BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT DEFAULT 0,

    -- 记录创建时间
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version         INT DEFAULT 0,

    -- 唯一约束，确保一个角色不会重复关联同一个权限
    CONSTRAINT uk_project_role_permission UNIQUE (project_role_id, permission_id, deleted)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_project_role_permission_role_id ON t_project_role_permission (project_role_id);
CREATE INDEX idx_project_role_permission_permission_id ON t_project_role_permission (permission_id);

-- 添加注释
COMMENT
ON TABLE t_project_role_permission IS '项目角色-权限关联表';
COMMENT
ON COLUMN t_project_role_permission.id IS '主键ID，TSID格式的分布式ID';
COMMENT
ON COLUMN t_project_role_permission.project_role_id IS '关联的项目角色ID';
COMMENT
ON COLUMN t_project_role_permission.permission_id IS '关联的权限ID';
COMMENT
ON COLUMN t_project_role_permission.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_project_role_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_project_role_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_project_role_permission.version IS '乐观锁版本号，用于并发控制';
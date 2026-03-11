-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_team_role_permission;

-- 团队角色-权限关联表
CREATE TABLE t_team_role_permission
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id            BIGINT PRIMARY KEY,

    -- 关联的团队角色ID
    team_role_id  BIGINT                   NOT NULL,

    -- 关联的权限ID
    permission_id BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted       SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一角色不会重复关联同一权限（考虑逻辑删除）
    CONSTRAINT uk_team_role_permission UNIQUE (team_role_id, permission_id, deleted)
);

-- 添加索引
CREATE INDEX idx_team_role_permission_role_id ON t_team_role_permission (team_role_id);
CREATE INDEX idx_team_role_permission_permission_id ON t_team_role_permission (permission_id);
CREATE INDEX idx_team_role_permission_deleted ON t_team_role_permission (deleted);

-- 添加注释
COMMENT
ON TABLE t_team_role_permission IS '团队角色-权限关联表，实现团队角色与权限的多对多关联';
COMMENT
ON COLUMN t_team_role_permission.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team_role_permission.team_role_id IS '关联的团队角色ID';
COMMENT
ON COLUMN t_team_role_permission.permission_id IS '关联的权限ID';
COMMENT
ON COLUMN t_team_role_permission.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team_role_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team_role_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team_role_permission.version IS '乐观锁版本号，用于并发控制';
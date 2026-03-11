-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_team_role;

-- 团队角色表
CREATE TABLE t_team_role
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id          BIGINT PRIMARY KEY,

    -- 角色名称
    name        VARCHAR(100)             NOT NULL,

    -- 角色描述，可为空
    description TEXT,

    -- 所属团队ID，关联t_team表
    team_id     BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at  TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version     INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一团队中角色名称不重复（考虑逻辑删除）
    CONSTRAINT uk_team_role_name UNIQUE (team_id, name, deleted)
);

-- 添加索引
CREATE INDEX idx_team_role_team_id ON t_team_role (team_id);
CREATE INDEX idx_team_role_deleted ON t_team_role (deleted);

-- 添加注释
COMMENT
ON TABLE t_team_role IS '团队角色表，存储团队角色信息';
COMMENT
ON COLUMN t_team_role.id IS '团队角色唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team_role.name IS '角色名称';
COMMENT
ON COLUMN t_team_role.description IS '角色描述';
COMMENT
ON COLUMN t_team_role.team_id IS '所属团队ID，关联t_team表';
COMMENT
ON COLUMN t_team_role.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team_role.version IS '乐观锁版本号，用于并发控制';
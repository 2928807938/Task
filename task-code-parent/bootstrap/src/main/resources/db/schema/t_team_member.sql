-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_team_member;

-- 团队成员表
CREATE TABLE t_team_member
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 团队ID，关联t_team表
    team_id    BIGINT                   NOT NULL,

    -- 用户ID，关联t_users表
    user_id    BIGINT                   NOT NULL,

    -- 团队角色ID，关联t_team_role表
    role_id    BIGINT                   NOT NULL,

    -- 加入时间
    joined_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保用户在同一团队中只有一个角色（考虑逻辑删除）
    CONSTRAINT uk_team_member UNIQUE (team_id, user_id, deleted)
);

-- 添加索引
CREATE INDEX idx_team_member_team_id ON t_team_member (team_id);
CREATE INDEX idx_team_member_user_id ON t_team_member (user_id);
CREATE INDEX idx_team_member_role_id ON t_team_member (role_id);
CREATE INDEX idx_team_member_deleted ON t_team_member (deleted);

-- 添加注释
COMMENT
ON TABLE t_team_member IS '团队成员表，存储团队成员关系';
COMMENT
ON COLUMN t_team_member.id IS '团队成员唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team_member.team_id IS '团队ID，关联t_team表';
COMMENT
ON COLUMN t_team_member.user_id IS '用户ID，关联t_users表';
COMMENT
ON COLUMN t_team_member.role_id IS '团队角色ID，关联t_team_role表';
COMMENT
ON COLUMN t_team_member.joined_at IS '加入时间';
COMMENT
ON COLUMN t_team_member.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team_member.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team_member.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team_member.version IS '乐观锁版本号，用于并发控制';
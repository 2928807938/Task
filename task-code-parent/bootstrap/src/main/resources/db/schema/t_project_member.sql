-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_member;

-- 项目成员
CREATE TABLE t_project_member
(
    -- 主键ID，TSID格式（有序的分布式ID）
    id              BIGINT PRIMARY KEY,

    -- 所属项目ID，关联t_projects表
    project_id      BIGINT                   NOT NULL,

    -- 用户ID，关联t_users表
    user_id         BIGINT                   NOT NULL,

    -- 项目角色ID，关联t_project_roles表
    project_role_id BIGINT                   NOT NULL,

    -- 用户加入项目的时间
    joined_at       TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version         INT                      NOT NULL DEFAULT 0
);

-- 创建项目ID索引，优化按项目查询成员的性能
CREATE INDEX idx_project_members_project_id ON t_project_member (project_id);

-- 创建用户ID索引，优化按用户查询所参与项目的性能
CREATE INDEX idx_project_members_user_id ON t_project_member (user_id);

-- 创建角色ID索引，优化按角色查询成员的性能
CREATE INDEX idx_project_members_project_role_id ON t_project_member (project_role_id);

-- 创建项目ID和用户ID的唯一索引，确保同一用户在同一项目中只有一条有效记录
-- WHERE deleted = 0 条件确保只对未删除的记录强制唯一性约束
CREATE UNIQUE INDEX idx_project_members_project_user ON t_project_member (project_id, user_id) WHERE deleted = 0;
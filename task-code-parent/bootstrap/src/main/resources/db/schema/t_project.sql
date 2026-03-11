-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project;

-- 创建项目表
-- 此表用于存储系统中的项目信息，作为任务管理的核心实体之一
CREATE TABLE t_project
(
    -- ========== BaseRecord 基础字段 ==========

    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id          BIGINT PRIMARY KEY,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted     INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间，包含时区信息
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间，包含时区信息
    updated_at  TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version     INT                      NOT NULL DEFAULT 0,

    -- ========== ProjectRecord 特有字段 ==========

    -- 项目名称
    -- 项目的显示名称，用于在界面上展示
    name        VARCHAR(100)             NOT NULL,

    -- 项目描述
    -- 详细描述项目的目标、范围等信息
    description TEXT,

    -- 所属团队ID，关联t_teams表
    -- 表示项目归属的团队
    team_id     BIGINT                   NOT NULL,

    -- 项目开始日期
    -- 项目计划开始的日期
    start_date  DATE,
    
    -- 是否已归档
    -- 归档的项目表示其已完成或不再活跃
    archived BOOLEAN                  NOT NULL DEFAULT FALSE,

    -- 项目创建者ID，关联t_users表
    -- 记录创建此项目的用户
    creator_id  BIGINT                   NOT NULL
);

-- ========== 索引创建 ==========

-- 项目名称索引，用于按名称查询和模糊搜索
CREATE INDEX idx_project_name ON t_project (name);

-- 团队ID索引，用于查询特定团队的所有项目
CREATE INDEX idx_project_team_id ON t_project (team_id);

-- 创建者ID索引，用于查询用户创建的项目
CREATE INDEX idx_project_creator_id ON t_project (creator_id);

-- 归档状态索引，用于按归档状态筛选项目
CREATE INDEX idx_project_archived ON t_project (archived);

-- 开始日期索引，用于按时间查询项目
CREATE INDEX idx_project_start_date ON t_project (start_date);

-- 添加表注释
COMMENT
ON TABLE t_project IS '项目表，存储系统中的项目信息';

-- 添加列注释
COMMENT
ON COLUMN t_project.id IS '记录唯一标识，使用TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_project.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_project.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_project.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_project.version IS '乐观锁版本号，用于并发控制';
COMMENT
ON COLUMN t_project.name IS '项目名称';
COMMENT
ON COLUMN t_project.description IS '项目描述';
COMMENT
ON COLUMN t_project.team_id IS '所属团队ID，关联t_teams表';
COMMENT
ON COLUMN t_project.start_date IS '项目开始日期';
COMMENT
ON COLUMN t_project.archived IS '是否已归档，TRUE表示已归档，FALSE表示未归档';
COMMENT
ON COLUMN t_project.creator_id IS '项目创建者ID，关联t_users表';
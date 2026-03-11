-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_role;

-- 项目角色表
CREATE TABLE t_project_role
(
    -- 主键，使用TSID格式的分布式ID
    id          BIGINT PRIMARY KEY,

    -- 角色名称
    name        VARCHAR(100)             NOT NULL,

    -- 所属项目ID，关联t_project表
    project_id  BIGINT                   NOT NULL,

    -- 角色描述
    description TEXT,

    -- 角色编码，用于系统内部标识
    code        VARCHAR(50),

    -- 角色排序值
    sort_order  INT     DEFAULT 0,

    -- 是否为系统预设角色
    is_system   BOOLEAN DEFAULT FALSE,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     INT     DEFAULT 0,

    -- 记录创建时间
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间
    updated_at  TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version     INT     DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_project_role_project_id ON t_project_role (project_id);
CREATE INDEX idx_project_role_code ON t_project_role (code) WHERE deleted = 0;
CREATE INDEX idx_project_role_name ON t_project_role (name) WHERE deleted = 0;

-- 添加唯一约束，确保同一项目内角色名称不重复（仅限未删除的记录）
CREATE UNIQUE INDEX uk_project_role_project_id_name ON t_project_role (project_id, name) WHERE deleted = 0;

-- 添加注释
COMMENT
ON TABLE t_project_role IS '项目角色表';
COMMENT
ON COLUMN t_project_role.id IS '主键ID，TSID格式的分布式ID';
COMMENT
ON COLUMN t_project_role.name IS '角色名称';
COMMENT
ON COLUMN t_project_role.project_id IS '所属项目ID，关联t_project表';
COMMENT
ON COLUMN t_project_role.description IS '角色描述';
COMMENT
ON COLUMN t_project_role.code IS '角色编码，用于系统内部标识';
COMMENT
ON COLUMN t_project_role.sort_order IS '角色排序值，用于在界面上展示的顺序';
COMMENT
ON COLUMN t_project_role.is_system IS '是否为系统预设角色，系统预设角色不可删除';
COMMENT
ON COLUMN t_project_role.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_project_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_project_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_project_role.version IS '乐观锁版本号，用于并发控制';
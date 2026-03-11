-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_team;

-- 团队表
CREATE TABLE t_team
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id          BIGINT PRIMARY KEY,

    -- 团队名称，不可重复
    name        VARCHAR(100)             NOT NULL,

    -- 团队描述，可为空
    description TEXT,

    -- 团队创建者ID，关联到用户表
    creator_id  BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at  TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version     INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保团队名称不重复（考虑逻辑删除）
    CONSTRAINT uk_team_name UNIQUE (name, deleted)
);

-- 添加索引
CREATE INDEX idx_team_creator_id ON t_team (creator_id);
CREATE INDEX idx_team_deleted ON t_team (deleted);

-- 添加注释
COMMENT
ON TABLE t_team IS '团队表，存储所有团队的基本信息';
COMMENT
ON COLUMN t_team.id IS '团队唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team.name IS '团队名称，不可重复';
COMMENT
ON COLUMN t_team.description IS '团队描述';
COMMENT
ON COLUMN t_team.creator_id IS '团队创建者ID，关联用户表';
COMMENT
ON COLUMN t_team.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team.version IS '乐观锁版本号，用于并发控制';
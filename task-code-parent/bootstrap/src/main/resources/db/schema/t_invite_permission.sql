-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_invite_permission;

-- 邀请权限表
CREATE TABLE t_invite_permission
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id             BIGINT PRIMARY KEY,

    -- 邀请链接ID，关联t_invite_link表
    invite_link_id BIGINT                    NOT NULL,

    -- 目标ID（系统或项目ID）
    target_id      BIGINT                    NOT NULL,

    -- 目标类型：SYSTEM(系统), PROJECT(项目)
    target_type    VARCHAR(20)               NOT NULL,

    -- 角色ID，关联t_role表或t_project_role表（取决于target_type）
    role_id        BIGINT                    NOT NULL,

    -- 角色名称
    role_name      VARCHAR(100)              NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted        INT                       NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at     TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at     TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version        INT                       NOT NULL DEFAULT 0
);

-- 创建索引
CREATE INDEX idx_invite_permission_link ON t_invite_permission (invite_link_id) WHERE deleted = 0;
CREATE INDEX idx_invite_permission_target ON t_invite_permission (target_type, target_id) WHERE deleted = 0;
CREATE INDEX idx_invite_permission_role ON t_invite_permission (role_id) WHERE deleted = 0;

-- 添加注释
COMMENT ON TABLE t_invite_permission IS '邀请权限表';
COMMENT ON COLUMN t_invite_permission.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_invite_permission.invite_link_id IS '邀请链接ID，关联t_invite_link表';
COMMENT ON COLUMN t_invite_permission.target_id IS '目标ID（系统或项目ID）';
COMMENT ON COLUMN t_invite_permission.target_type IS '目标类型：SYSTEM(系统), PROJECT(项目)';
COMMENT ON COLUMN t_invite_permission.role_id IS '角色ID，关联t_role表或t_project_role表（取决于target_type）';
COMMENT ON COLUMN t_invite_permission.role_name IS '角色名称';
COMMENT ON COLUMN t_invite_permission.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_invite_permission.created_at IS '记录创建时间';
COMMENT ON COLUMN t_invite_permission.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_invite_permission.version IS '乐观锁版本号，用于并发控制';
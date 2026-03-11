-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_change_log;

-- 创建变更历史表
CREATE TABLE t_change_log
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id          BIGINT PRIMARY KEY,

    -- 实体类型代码，对应EntityTypeEnum.code
    entity_type INT                      NOT NULL,

    -- 实体ID
    entity_id   BIGINT                   NOT NULL,

    -- 变更类型代码，对应ChangeTypeEnum.code
    change_type INT                      NOT NULL,

    -- 变更字段名
    field_name  VARCHAR(100),

    -- 字段旧值
    old_value   TEXT,

    -- 字段新值
    new_value   TEXT,

    -- 变更说明
    description VARCHAR(500),

    -- 操作用户ID
    user_id     BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     INT                      NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at  TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version     INT                      NOT NULL DEFAULT 0
);

-- 创建索引
CREATE INDEX idx_change_log_entity ON t_change_log (entity_type, entity_id) WHERE deleted = 0;
CREATE INDEX idx_change_log_user_id ON t_change_log (user_id) WHERE deleted = 0;
CREATE INDEX idx_change_log_created_at ON t_change_log (created_at) WHERE deleted = 0;
CREATE INDEX idx_change_log_change_type ON t_change_log (change_type) WHERE deleted = 0;

-- 添加表注释
COMMENT
ON TABLE t_change_log IS '变更历史表，记录实体对象的变更历史';

-- 添加字段注释
COMMENT
ON COLUMN t_change_log.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_change_log.entity_type IS '实体类型代码，对应EntityTypeEnum.code';
COMMENT
ON COLUMN t_change_log.entity_id IS '实体ID';
COMMENT
ON COLUMN t_change_log.change_type IS '变更类型代码，对应ChangeTypeEnum.code';
COMMENT
ON COLUMN t_change_log.field_name IS '变更字段名';
COMMENT
ON COLUMN t_change_log.old_value IS '字段旧值';
COMMENT
ON COLUMN t_change_log.new_value IS '字段新值';
COMMENT
ON COLUMN t_change_log.description IS '变更说明';
COMMENT
ON COLUMN t_change_log.user_id IS '操作用户ID';
COMMENT
ON COLUMN t_change_log.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_change_log.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_change_log.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_change_log.version IS '乐观锁版本号，用于并发控制';
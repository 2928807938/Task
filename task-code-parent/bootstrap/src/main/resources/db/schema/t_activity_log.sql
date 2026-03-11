-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_activity_log;

-- 活动日志表
CREATE TABLE t_activity_log
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id                  BIGINT PRIMARY KEY,

    -- 活动类型，整数值，存储ActivityTypeEnum的编码
    activity_type       INT                      NOT NULL,

    -- 活动描述，可包含占位符
    description         VARCHAR(500)             NOT NULL,

    -- 活动执行者ID，关联到t_user表的id字段
    actor_id            BIGINT                   NOT NULL,

    -- 活动主要对象类型，整数值，存储ResourceTypeEnum的编码
    object_type         INT                      NOT NULL,

    -- 活动主要对象ID，关联到相应对象表的id字段
    object_id           BIGINT                   NOT NULL,

    -- 活动相关对象类型，整数值，存储ResourceTypeEnum的编码，可为空
    related_object_type INT,

    -- 活动相关对象ID，关联到相应对象表的id字段，可为空
    related_object_id   BIGINT,

    -- 活动元数据，JSON格式，可为空
    metadata            JSONB,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted             INT                      NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at          TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version             INT                      NOT NULL DEFAULT 0
);

-- 创建索引
CREATE INDEX idx_activity_log_actor_id ON t_activity_log (actor_id) WHERE deleted = 0;
CREATE INDEX idx_activity_log_object ON t_activity_log (object_type, object_id) WHERE deleted = 0;
CREATE INDEX idx_activity_log_related_object ON t_activity_log (related_object_type, related_object_id) WHERE deleted = 0 AND related_object_type IS NOT NULL;
CREATE INDEX idx_activity_log_created_at ON t_activity_log (created_at) WHERE deleted = 0;

-- 添加注释
COMMENT
ON TABLE t_activity_log IS '活动日志表，记录系统中发生的各种活动';
COMMENT
ON COLUMN t_activity_log.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_activity_log.activity_type IS '活动类型，整数值，存储ActivityTypeEnum的编码';
COMMENT
ON COLUMN t_activity_log.description IS '活动描述，可包含占位符，如"{{user}}创建了任务{{task}}"';
COMMENT
ON COLUMN t_activity_log.actor_id IS '活动执行者ID，关联到t_user表的id字段';
COMMENT
ON COLUMN t_activity_log.object_type IS '活动主要对象类型，整数值，存储ResourceTypeEnum的编码';
COMMENT
ON COLUMN t_activity_log.object_id IS '活动主要对象ID，关联到相应对象表的id字段';
COMMENT
ON COLUMN t_activity_log.related_object_type IS '活动相关对象类型，整数值，存储ResourceTypeEnum的编码';
COMMENT
ON COLUMN t_activity_log.related_object_id IS '活动相关对象ID，关联到相应对象表的id字段';
COMMENT
ON COLUMN t_activity_log.metadata IS '活动元数据，JSON格式，可用于存储格式化描述所需的参数';
COMMENT
ON COLUMN t_activity_log.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_activity_log.created_at IS '活动发生时间';
COMMENT
ON COLUMN t_activity_log.updated_at IS '记录更新时间';
COMMENT
ON COLUMN t_activity_log.version IS '乐观锁版本号，用于并发控制';
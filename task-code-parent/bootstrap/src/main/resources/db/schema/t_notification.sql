-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_notification;

-- 通知记录表
CREATE TABLE t_notification
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 通知接收用户ID，非空
    user_id         BIGINT                   NOT NULL,

    -- 通知类型，整数编码，非空
    type            INT                      NOT NULL,

    -- 通知标题，非空
    title           VARCHAR(255)             NOT NULL,

    -- 通知内容，非空
    content         TEXT                     NOT NULL,

    -- 通知状态，整数编码，可为空
    status          INT,

    -- 关联实体类型，整数编码，可为空
    entity_type     INT,

    -- 关联实体ID，可为空
    entity_id       BIGINT,

    -- 通知触发者ID，可为空
    triggered_by_id BIGINT,

    -- 通知链接URL，可为空
    action_url      VARCHAR(500),

    -- 读取时间，可为空
    read_at         TIMESTAMP WITH TIME ZONE,

    -- 以下是从BaseRecord继承的字段

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT                      NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version         INT                      NOT NULL DEFAULT 0
);

-- 创建索引
CREATE INDEX idx_notification_user_id ON t_notification (user_id) WHERE deleted = 0;
CREATE INDEX idx_notification_status ON t_notification (status) WHERE deleted = 0;
CREATE INDEX idx_notification_entity_type_entity_id ON t_notification (entity_type, entity_id) WHERE deleted = 0;
CREATE INDEX idx_notification_created_at ON t_notification (created_at) WHERE deleted = 0;

-- 添加注释
COMMENT
ON TABLE t_notification IS '通知表';
COMMENT
ON COLUMN t_notification.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_notification.user_id IS '通知接收用户ID';
COMMENT
ON COLUMN t_notification.type IS '通知类型，整数编码';
COMMENT
ON COLUMN t_notification.title IS '通知标题';
COMMENT
ON COLUMN t_notification.content IS '通知内容';
COMMENT
ON COLUMN t_notification.status IS '通知状态，整数编码';
COMMENT
ON COLUMN t_notification.entity_type IS '关联实体类型，整数编码';
COMMENT
ON COLUMN t_notification.entity_id IS '关联实体ID';
COMMENT
ON COLUMN t_notification.triggered_by_id IS '通知触发者ID';
COMMENT
ON COLUMN t_notification.action_url IS '通知链接URL';
COMMENT
ON COLUMN t_notification.read_at IS '读取时间';
COMMENT
ON COLUMN t_notification.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_notification.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_notification.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_notification.version IS '乐观锁版本号，用于并发控制';
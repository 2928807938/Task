-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_notification_preference;

-- 创建通知首选项表
CREATE TABLE t_notification_preference
(
    -- 主键，使用自增或序列生成
    id                BIGINT PRIMARY KEY,

    -- 用户ID，关联到用户表
    user_id           BIGINT                   NOT NULL,

    -- 通知类型，存储枚举名称
    notification_type VARCHAR(50)              NOT NULL,

    -- 是否启用邮件通知，1表示启用，0表示禁用
    email_enabled     INT                      NOT NULL DEFAULT 1,

    -- 是否启用应用内通知，1表示启用，0表示禁用
    in_app_enabled    INT                      NOT NULL DEFAULT 1,

    -- 是否启用移动推送通知，1表示启用，0表示禁用
    push_enabled      INT                      NOT NULL DEFAULT 1,

    -- 创建时间
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 更新时间，可为空
    updated_at        TIMESTAMP WITH TIME ZONE,

    -- 添加唯一约束，确保每个用户对每种通知类型只有一个设置
    CONSTRAINT uk_user_notification_type UNIQUE (user_id, notification_type)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_notification_preference_user_id ON t_notification_preference (user_id);
CREATE INDEX idx_notification_preference_type ON t_notification_preference (notification_type);

-- 添加表注释
COMMENT
ON TABLE t_notification_preference IS '用户通知首选项设置表';
COMMENT
ON COLUMN t_notification_preference.id IS '设置唯一标识';
COMMENT
ON COLUMN t_notification_preference.user_id IS '用户ID';
COMMENT
ON COLUMN t_notification_preference.notification_type IS '通知类型';
COMMENT
ON COLUMN t_notification_preference.email_enabled IS '是否启用邮件通知，1表示启用，0表示禁用';
COMMENT
ON COLUMN t_notification_preference.in_app_enabled IS '是否启用应用内通知，1表示启用，0表示禁用';
COMMENT
ON COLUMN t_notification_preference.push_enabled IS '是否启用移动推送通知，1表示启用，0表示禁用';
COMMENT
ON COLUMN t_notification_preference.created_at IS '创建时间';
COMMENT
ON COLUMN t_notification_preference.updated_at IS '更新时间';
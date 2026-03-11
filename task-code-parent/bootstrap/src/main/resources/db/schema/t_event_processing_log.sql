-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_event_processing_log;

-- 创建事件处理日志表
-- 此表用于记录领域事件的处理状态和结果，支持事件处理的可靠性和可追踪性
CREATE TABLE t_event_processing_log
(
    -- ========== BaseRecord 基础字段 ==========

    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id                BIGINT PRIMARY KEY,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted           INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间，包含时区信息
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间，包含时区信息
    updated_at        TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version           INT                      NOT NULL DEFAULT 0,

    -- ========== EventProcessingLogRecord 特有字段 ==========

    -- 事件ID，关联到领域事件表(t_domain_event)的event_id
    -- 用于建立事件和其处理日志之间的关联
    event_id          VARCHAR(255)             NOT NULL,

    -- 处理器名称，用于标识处理事件的组件
    -- 例如：UserCreatedEventHandler, TaskCompletedNotifier等
    handler_name      VARCHAR(255)             NOT NULL,

    -- 处理状态
    -- 常见值：PENDING, PROCESSING, COMPLETED, FAILED, RETRYING
    status            VARCHAR(50)              NOT NULL,

    -- 错误信息，如果处理失败
    -- 存储异常堆栈或错误描述，用于故障诊断
    error_message     TEXT,

    -- 重试次数
    -- 记录事件处理失败后的重试次数，用于实现退避策略
    retry_count       INT                      NOT NULL DEFAULT 0,

    -- 最后处理时间，包含时区信息
    -- 记录最近一次尝试处理事件的时间点
    last_processed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ========== 索引创建 ==========

-- 事件ID索引，用于查询特定事件的所有处理日志
-- 支持事件处理的追踪和诊断
CREATE INDEX idx_event_processing_log_event_id ON t_event_processing_log (event_id);

-- 处理器名称索引，用于查询特定处理器的所有处理日志
-- 支持处理器性能和可靠性分析
CREATE INDEX idx_event_processing_log_handler_name ON t_event_processing_log (handler_name);

-- 处理状态索引，用于按状态查询处理日志
-- 例如：查询所有失败的处理记录进行重试
CREATE INDEX idx_event_processing_log_status ON t_event_processing_log (status);

-- 最后处理时间索引，用于时间范围查询和按时间排序
-- 支持处理延迟分析和性能监控
CREATE INDEX idx_event_processing_log_last_processed_at ON t_event_processing_log (last_processed_at);

-- 组合索引，用于查询特定事件被特定处理器处理的记录
-- 提高事件处理状态查询的性能
CREATE UNIQUE INDEX idx_event_processing_log_event_handler ON t_event_processing_log (event_id, handler_name);
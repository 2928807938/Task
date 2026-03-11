-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_domain_event;

-- 创建领域事件表
-- 此表用于存储系统中发生的所有领域事件，支持事件溯源和事件驱动架构
CREATE TABLE t_domain_event
(
    -- ========== BaseRecord 基础字段 ==========

    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id             BIGINT PRIMARY KEY,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted        INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间，包含时区信息
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间，包含时区信息
    updated_at     TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version        INT                      NOT NULL DEFAULT 0,

    -- ========== DomainEventRecord 特有字段 ==========

    -- 事件ID，用于唯一标识事件实例
    -- 通常使用UUID格式，确保全局唯一性
    event_id       VARCHAR(255)             NOT NULL UNIQUE,

    -- 事件类型，表示事件的业务类别
    -- 例如：UserCreated, TaskCompleted, ProjectDeleted等
    event_type     VARCHAR(255)             NOT NULL,

    -- 聚合根ID，表示事件关联的聚合根实体
    -- 用于事件溯源和事件追踪
    aggregate_id   VARCHAR(255)             NOT NULL,

    -- 聚合根类型，表示聚合根的业务类别
    -- 例如：User, Task, Project等
    aggregate_type VARCHAR(255)             NOT NULL,

    -- 事件发生时间，精确到毫秒，包含时区信息
    -- 用于事件的时间顺序排序和时间点查询
    timestamp      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 事件数据，JSON格式
    -- 存储事件的完整业务数据，支持事件重放和审计
    event_data     TEXT                     NOT NULL,

    -- 跟踪ID，用于分布式跟踪
    -- 在微服务架构中，用于跟踪请求在多个服务间的传递
    trace_id       VARCHAR(255),

    -- 用户ID，表示触发事件的用户
    -- 用于审计和用户操作追踪
    user_id        VARCHAR(255),

    -- 租户ID，用于多租户系统
    -- 在SaaS应用中，用于区分不同租户的数据
    tenant_id      VARCHAR(255),

    -- 是否已处理，用于事件处理状态跟踪
    -- 在事件处理完成后标记为true，防止重复处理
    processed      BOOLEAN                  NOT NULL DEFAULT FALSE
);

-- ========== 索引创建 ==========

-- 事件类型索引，用于按事件类型查询和统计
CREATE INDEX idx_domain_event_event_type ON t_domain_event (event_type);

-- 聚合根ID索引，用于查询特定聚合根的所有事件
-- 在事件溯源中，常用于重建聚合根状态
CREATE INDEX idx_domain_event_aggregate_id ON t_domain_event (aggregate_id);

-- 聚合根类型索引，用于查询特定类型聚合根的所有事件
CREATE INDEX idx_domain_event_aggregate_type ON t_domain_event (aggregate_type);

-- 时间戳索引，用于时间范围查询和按时间排序
-- 支持事件的时间序列分析和历史回溯
CREATE INDEX idx_domain_event_timestamp ON t_domain_event (timestamp);

-- 处理状态索引，用于查询未处理的事件
-- 在事件处理系统中，常用于筛选需要处理的事件
CREATE INDEX idx_domain_event_processed ON t_domain_event (processed);

-- 租户ID索引，用于多租户系统中的租户数据隔离
-- 提高按租户查询的性能
CREATE INDEX idx_domain_event_tenant_id ON t_domain_event (tenant_id);
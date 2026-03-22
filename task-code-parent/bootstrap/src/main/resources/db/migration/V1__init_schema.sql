-- Initial Flyway migration generated from legacy schema scripts.
-- For existing non-empty databases, `baseline-on-migrate=true` marks this version as applied.

-- Source: t_activity_log.sql
-- 先删除表（如果存在）

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
ON COLUMN t_activity_log.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_agreement_term.sql
-- 先删除表（如果存在）

-- 协议条款表
CREATE TABLE t_agreement_term
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 条款唯一标识键，用于业务逻辑引用
    key        VARCHAR(100)              NOT NULL,

    -- 条款标题，用于显示
    title      VARCHAR(200)              NOT NULL,

    -- 条款内容，使用Markdown格式存储
    content    TEXT                      NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                  NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                   NOT NULL DEFAULT 0,

    -- 添加唯一约束
    CONSTRAINT uk_agreement_term_key UNIQUE (key, deleted)
);

-- 添加索引
CREATE INDEX idx_agreement_term_key ON t_agreement_term (key) WHERE deleted = 0;
CREATE INDEX idx_agreement_term_deleted ON t_agreement_term (deleted);

-- 添加注释
COMMENT
ON TABLE t_agreement_term IS '协议条款表，存储系统使用的各种协议条款内容';
COMMENT
ON COLUMN t_agreement_term.id IS '条款唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_agreement_term.key IS '条款唯一标识键，用于业务逻辑引用';
COMMENT
ON COLUMN t_agreement_term.title IS '条款标题，用于显示';
COMMENT
ON COLUMN t_agreement_term.content IS '条款内容，使用Markdown格式存储';
COMMENT
ON COLUMN t_agreement_term.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_agreement_term.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_agreement_term.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_agreement_term.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_attachment.sql
-- 先删除表（如果存在）

-- 附件表记录表
CREATE TABLE t_attachment
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id             BIGINT PRIMARY KEY,

    -- 文件名
    file_name      VARCHAR(255)             NOT NULL,

    -- 文件大小（字节）
    file_size      BIGINT                   NOT NULL,

    -- 文件类型/MIME类型
    file_type      VARCHAR(100),

    -- 存储路径
    storage_path   VARCHAR(500)             NOT NULL,

    -- 实体类型，整数代码，对应EntityTypeEnum
    entity_type    INT                      NOT NULL,

    -- 实体ID，根据entity_type关联到不同的表
    entity_id      BIGINT                   NOT NULL,

    -- 上传者ID，关联t_users表
    uploaded_by_id BIGINT                   NOT NULL,

    -- 文件描述
    description    TEXT,

    -- 是否公开可见
    is_public      BOOLEAN                  NOT NULL DEFAULT TRUE,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted        INT                      NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at     TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version        INT                      NOT NULL DEFAULT 0
);

-- 创建索引
CREATE INDEX idx_attachment_entity ON t_attachment (entity_type, entity_id) WHERE deleted = 0;
CREATE INDEX idx_attachment_uploaded_by ON t_attachment (uploaded_by_id) WHERE deleted = 0;
CREATE INDEX idx_attachment_file_type ON t_attachment (file_type) WHERE deleted = 0;

-- 添加注释
COMMENT
ON TABLE t_attachment IS '附件表';
COMMENT
ON COLUMN t_attachment.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_attachment.file_name IS '文件名';
COMMENT
ON COLUMN t_attachment.file_size IS '文件大小（字节）';
COMMENT
ON COLUMN t_attachment.file_type IS '文件类型/MIME类型';
COMMENT
ON COLUMN t_attachment.storage_path IS '存储路径';
COMMENT
ON COLUMN t_attachment.entity_type IS '实体类型，整数代码，对应EntityTypeEnum';
COMMENT
ON COLUMN t_attachment.entity_id IS '实体ID，根据entity_type关联到不同的表';
COMMENT
ON COLUMN t_attachment.uploaded_by_id IS '上传者ID，关联t_users表';
COMMENT
ON COLUMN t_attachment.description IS '文件描述';
COMMENT
ON COLUMN t_attachment.is_public IS '是否公开可见，对于私密文件可能需要额外的访问权限';
COMMENT
ON COLUMN t_attachment.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_attachment.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_attachment.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_attachment.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_change_log.sql
-- 先删除表（如果存在）

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
ON COLUMN t_change_log.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_collaboration_record.sql
-- 先删除表（如果存在）

-- 创建协作记录表
-- 此表用于存储任务的协作交流信息，支持@用户功能
CREATE TABLE t_collaboration_record
(
    -- 记录唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id                BIGINT PRIMARY KEY,

    -- 所属任务ID，不允许为空，关联t_task表
    task_id           BIGINT      NOT NULL,

    -- 消息发送者ID，不允许为空，关联t_user表
    sender_id         BIGINT      NOT NULL,

    -- 被@的用户ID，可为空，关联t_user表
    mentioned_user_id BIGINT,

    -- 消息内容，不允许为空，使用TEXT类型存储长文本
    content           TEXT        NOT NULL,

    -- 消息类型：MENTION(@消息)、NORMAL(普通消息)
    type              VARCHAR(20) NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted           INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at        TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version           INT         NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询协作记录的性能
CREATE INDEX idx_collaboration_task_id ON t_collaboration_record (task_id);

-- 创建索引：发送者ID索引，提高按发送者查询协作记录的性能
CREATE INDEX idx_collaboration_sender_id ON t_collaboration_record (sender_id);

-- 创建索引：被@用户ID索引，提高查询@某用户记录的性能
CREATE INDEX idx_collaboration_mentioned_user_id ON t_collaboration_record (mentioned_user_id);

-- 添加表注释
COMMENT ON TABLE t_collaboration_record IS '协作记录表，存储任务的协作交流信息';
COMMENT ON COLUMN t_collaboration_record.id IS '记录唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_collaboration_record.task_id IS '所属任务ID，关联t_task表';
COMMENT ON COLUMN t_collaboration_record.sender_id IS '消息发送者ID，关联t_user表';
COMMENT ON COLUMN t_collaboration_record.mentioned_user_id IS '被@用户ID，关联t_user表';
COMMENT ON COLUMN t_collaboration_record.content IS '消息内容';
COMMENT ON COLUMN t_collaboration_record.type IS '消息类型:MENTION(@消息),NORMAL(普通消息)';
COMMENT ON COLUMN t_collaboration_record.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_collaboration_record.created_at IS '记录创建时间';
COMMENT ON COLUMN t_collaboration_record.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_collaboration_record.version IS '乐观锁版本号，用于并发控制'; +
-- Source: t_document_version.sql
-- 先删除表（如果存在）

-- 文档版本表
CREATE TABLE t_document_version
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id                BIGINT PRIMARY KEY,

    -- 文档ID
    document_id       BIGINT                   NOT NULL,

    -- 版本号，如1.0, 1.1等
    version_number    VARCHAR(50)              NOT NULL,

    -- 文档内容
    content           TEXT                     NOT NULL,

    -- 版本说明
    notes             TEXT,

    -- 创建用户ID
    created_by_id     BIGINT                   NOT NULL,

    -- 版本类型代码：1=主版本，2=次版本，3=修订版本，4=Alpha版本，5=Beta版本，6=RC版本
    version_type_code INTEGER                  NOT NULL DEFAULT 2,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted           SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at        TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version           INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一文档不会有重复的版本号（考虑逻辑删除）
    CONSTRAINT uk_document_version UNIQUE (document_id, version_number, deleted)
);

-- 添加索引
CREATE INDEX idx_document_versions_document_id ON t_document_version (document_id);
CREATE INDEX idx_document_versions_created_by ON t_document_version (created_by_id);
CREATE INDEX idx_document_versions_version_type ON t_document_version (version_type_code);
CREATE INDEX idx_document_versions_deleted ON t_document_version (deleted);

-- 添加注释
COMMENT
ON TABLE t_document_version IS '文档版本表，存储文档的历史版本信息';
COMMENT
ON COLUMN t_document_version.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_document_version.document_id IS '关联的文档ID';
COMMENT
ON COLUMN t_document_version.version_number IS '版本号，如1.0, 1.1等';
COMMENT
ON COLUMN t_document_version.content IS '文档内容';
COMMENT
ON COLUMN t_document_version.notes IS '版本说明';
COMMENT
ON COLUMN t_document_version.created_by_id IS '创建用户ID';
COMMENT
ON COLUMN t_document_version.version_type_code IS '版本类型代码：1=主版本，2=次版本，3=修订版本，4=Alpha版本，5=Beta版本，6=RC版本';
COMMENT
ON COLUMN t_document_version.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_document_version.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_document_version.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_document_version.version IS '乐观锁版本号，用于并发控制';

-- Source: t_domain_event.sql
-- 先删除表（如果存在）

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
CREATE INDEX idx_domain_event_tenant_id ON t_domain_event (tenant_id);+
-- Source: t_event_processing_log.sql
-- 先删除表（如果存在）

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
CREATE UNIQUE INDEX idx_event_processing_log_event_handler ON t_event_processing_log (event_id, handler_name);+
-- Source: t_invite_link.sql
-- 先删除表（如果存在）

-- 邀请链接表
CREATE TABLE t_invite_link
(
    -- 主键ID，使用BIGINT类型存储TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 邀请链接的唯一代码
    code            VARCHAR(32)               NOT NULL,

    -- 创建者ID，关联t_user表
    creator_id      BIGINT                    NOT NULL,

    -- 项目ID，关联t_project表，可为空表示系统级邀请
    project_id      BIGINT,

    -- 链接有效期截止时间
    expire_at       TIMESTAMP WITH TIME ZONE  NOT NULL,

    -- 最大使用次数，null表示不限制
    max_usage_count INT,

    -- 当前已使用次数
    used_count      INT                       NOT NULL DEFAULT 0,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT                       NOT NULL DEFAULT 0,

    -- 创建时间，带时区的时间戳
    created_at      TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 更新时间，带时区的时间戳，可为空
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version         INT                       NOT NULL DEFAULT 0
);

-- 创建索引
CREATE UNIQUE INDEX idx_invite_link_code ON t_invite_link (code) WHERE deleted = 0;
CREATE INDEX idx_invite_link_creator ON t_invite_link (creator_id) WHERE deleted = 0;
CREATE INDEX idx_invite_link_project ON t_invite_link (project_id) WHERE deleted = 0;
CREATE INDEX idx_invite_link_expire ON t_invite_link (expire_at) WHERE deleted = 0;

-- 添加注释
COMMENT ON TABLE t_invite_link IS '邀请链接表';
COMMENT ON COLUMN t_invite_link.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_invite_link.code IS '邀请链接的唯一代码';
COMMENT ON COLUMN t_invite_link.creator_id IS '创建者ID，关联t_user表';
COMMENT ON COLUMN t_invite_link.project_id IS '项目ID，关联t_project表，可为空表示系统级邀请';
COMMENT ON COLUMN t_invite_link.expire_at IS '链接有效期截止时间';
COMMENT ON COLUMN t_invite_link.max_usage_count IS '最大使用次数，null表示不限制';
COMMENT ON COLUMN t_invite_link.used_count IS '当前已使用次数';
COMMENT ON COLUMN t_invite_link.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_invite_link.created_at IS '记录创建时间';
COMMENT ON COLUMN t_invite_link.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_invite_link.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_invite_permission.sql
-- 先删除表（如果存在）

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
COMMENT ON COLUMN t_invite_permission.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_llm_prompt_config.sql
-- 先删除表（如果存在）
-- 本表用于承载用户级与项目级提示词配置。
-- 冲突检测接口不会额外落库，而是基于本表中的提示词内容、作用域、场景范围进行实时计算。

-- LLM提示词配置表
-- 用于存储用户级或项目级的自然语言提示词
CREATE TABLE t_llm_prompt_config (
    id BIGINT PRIMARY KEY,
    scope_type VARCHAR(32) NOT NULL,
    scope_object_id BIGINT NOT NULL,
    prompt_name VARCHAR(128) NOT NULL,
    prompt_content TEXT NOT NULL,
    all_scene_enabled INT NOT NULL DEFAULT 0,
    scene_keys_json TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
    priority INT NOT NULL DEFAULT 0 CHECK (priority >= 0 AND priority <= 100),
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
-- idx_t_llm_prompt_config_scope: 支持按用户或项目快速查询提示词
-- idx_t_llm_prompt_config_status: 支持按状态过滤可用提示词
-- uk_t_llm_prompt_config_scope_name: 保证同一作用域下名称唯一，降低管理歧义
CREATE INDEX idx_t_llm_prompt_config_scope ON t_llm_prompt_config(scope_type, scope_object_id);
CREATE INDEX idx_t_llm_prompt_config_status ON t_llm_prompt_config(status, deleted);
CREATE UNIQUE INDEX uk_t_llm_prompt_config_scope_name ON t_llm_prompt_config(scope_type, scope_object_id, prompt_name, deleted);

-- 注释
COMMENT ON TABLE t_llm_prompt_config IS 'LLM提示词配置表，用于存储用户级或项目级的自然语言提示词';
COMMENT ON COLUMN t_llm_prompt_config.id IS '主键ID';
COMMENT ON COLUMN t_llm_prompt_config.scope_type IS '作用域类型，PROJECT表示项目级，USER表示用户级';
COMMENT ON COLUMN t_llm_prompt_config.scope_object_id IS '作用域对象ID；scope_type=PROJECT时表示projectId，scope_type=USER时表示userId';
COMMENT ON COLUMN t_llm_prompt_config.prompt_name IS '提示词名称，便于用户区分不同用途';
COMMENT ON COLUMN t_llm_prompt_config.prompt_content IS '提示词正文，用户直接输入的自然语言内容';
COMMENT ON COLUMN t_llm_prompt_config.all_scene_enabled IS '是否对全部分析场景生效，0表示否，1表示是';
COMMENT ON COLUMN t_llm_prompt_config.scene_keys_json IS '适用场景JSON字符串；当all_scene_enabled=0时生效，例如["TASK_BREAKDOWN","PRIORITY_ANALYSIS"]';
COMMENT ON COLUMN t_llm_prompt_config.status IS '状态，ENABLED表示启用，DISABLED表示停用';
COMMENT ON COLUMN t_llm_prompt_config.priority IS '优先级，范围0-100，数值越大越靠前';
COMMENT ON COLUMN t_llm_prompt_config.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_llm_prompt_config.created_at IS '创建时间';
COMMENT ON COLUMN t_llm_prompt_config.updated_at IS '更新时间';
COMMENT ON COLUMN t_llm_prompt_config.version IS '版本号，用于乐观锁';

-- Source: t_llm_prompt_hit_log.sql
-- 先删除表（如果存在）
-- 本表用于记录分析时真正命中的提示词快照，便于审计与回溯。
-- 保存提示词后前端会主动调用冲突检测接口，但冲突检测结果本身当前不单独落库。

-- LLM提示词命中日志表
-- 用于记录每次分析实际命中的提示词
CREATE TABLE t_llm_prompt_hit_log (
    id BIGINT PRIMARY KEY,
    analysis_request_id VARCHAR(64) NOT NULL,
    scene_key VARCHAR(64) NOT NULL,
    project_id BIGINT,
    user_id BIGINT,
    hit_prompt_ids_json TEXT,
    final_prompt_preview TEXT,
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
-- uk_t_llm_prompt_hit_log_request_id: 避免同一分析请求重复落日志
-- idx_t_llm_prompt_hit_log_scene: 支持按场景回看命中记录
-- idx_t_llm_prompt_hit_log_project_user: 支持按项目/用户维度审计
CREATE UNIQUE INDEX uk_t_llm_prompt_hit_log_request_id ON t_llm_prompt_hit_log(analysis_request_id, deleted);
CREATE INDEX idx_t_llm_prompt_hit_log_scene ON t_llm_prompt_hit_log(scene_key);
CREATE INDEX idx_t_llm_prompt_hit_log_project_user ON t_llm_prompt_hit_log(project_id, user_id);

-- 注释
COMMENT ON TABLE t_llm_prompt_hit_log IS 'LLM提示词命中日志表，用于记录每次分析实际命中的提示词';
COMMENT ON COLUMN t_llm_prompt_hit_log.id IS '主键ID';
COMMENT ON COLUMN t_llm_prompt_hit_log.analysis_request_id IS '分析请求标识';
COMMENT ON COLUMN t_llm_prompt_hit_log.scene_key IS '分析场景标识';
COMMENT ON COLUMN t_llm_prompt_hit_log.project_id IS '项目ID';
COMMENT ON COLUMN t_llm_prompt_hit_log.user_id IS '用户ID';
COMMENT ON COLUMN t_llm_prompt_hit_log.hit_prompt_ids_json IS '本次命中的提示词ID列表，JSON字符串';
COMMENT ON COLUMN t_llm_prompt_hit_log.final_prompt_preview IS '本次最终拼装后的提示词预览';
COMMENT ON COLUMN t_llm_prompt_hit_log.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_llm_prompt_hit_log.created_at IS '创建时间';
COMMENT ON COLUMN t_llm_prompt_hit_log.updated_at IS '更新时间';
COMMENT ON COLUMN t_llm_prompt_hit_log.version IS '版本号，用于乐观锁';

-- Source: t_notification.sql
-- 先删除表（如果存在）

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
ON COLUMN t_notification.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_notification_preference.sql
-- 先删除表（如果存在）

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
ON COLUMN t_notification_preference.updated_at IS '更新时间';+
-- Source: t_permission.sql
-- 先删除表（如果存在）

-- 权限表记录表
CREATE TABLE t_permission
(
    -- 权限唯一标识，使用BIGINT类型
    -- 采用TSID格式（有序的分布式ID）
    id          BIGINT PRIMARY KEY,

    -- 权限名称，用于显示
    -- 例如"创建任务"、"删除用户"等
    name        VARCHAR(100) NOT NULL,

    -- 权限编码，用于权限检查
    -- 使用冒号分隔的格式，如"task:create"、"user:delete"
    code        VARCHAR(100) NOT NULL,

    -- 权限说明，描述权限的作用和范围
    -- 可以为空
    description TEXT,

    -- 逻辑删除标志，0表示未删除，非0值表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted     INTEGER      NOT NULL DEFAULT 0,

    -- 记录创建时间
    -- 使用带时区的时间戳类型，确保时间的准确性
    created_at  TIMESTAMPTZ  NOT NULL,

    -- 记录最后更新时间
    -- 可以为空，表示记录尚未更新过
    updated_at  TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version     INTEGER      NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保权限编码在系统中唯一
    CONSTRAINT uk_permission_code UNIQUE (code)
);

-- 添加注释
COMMENT
ON TABLE t_permission IS '系统权限表，存储系统中所有可用的权限定义';
COMMENT
ON COLUMN t_permission.id IS '权限唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_permission.name IS '权限名称，用于显示';
COMMENT
ON COLUMN t_permission.code IS '权限编码，用于权限检查，如"task:create"';
COMMENT
ON COLUMN t_permission.description IS '权限说明，描述权限的作用和范围';
COMMENT
ON COLUMN t_permission.deleted IS '逻辑删除标志，0表示未删除，非0值表示已删除';
COMMENT
ON COLUMN t_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_permission.version IS '乐观锁版本号，用于并发控制';

-- 创建索引以提高查询性能
CREATE INDEX idx_permission_deleted ON t_permission (deleted);
CREATE INDEX idx_permission_code ON t_permission (code);
CREATE INDEX idx_permission_created_at ON t_permission (created_at);

-- 添加索引注释
COMMENT
ON INDEX idx_permission_deleted IS '逻辑删除标志索引，用于过滤已删除记录';
COMMENT
ON INDEX idx_permission_code IS '权限编码索引，用于权限检查和查询';
COMMENT
ON INDEX idx_permission_created_at IS '创建时间索引，用于按创建时间排序和查询';+
-- Source: t_priority.sql
-- 先删除表（如果存在）

-- 创建优先级表
-- 此表用于存储系统中的通用优先级定义，可被多个业务实体引用
CREATE TABLE t_priority
(
    -- ========== BaseRecord 基础字段 ==========

    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id         BIGINT PRIMARY KEY,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted    INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间，包含时区信息
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间，包含时区信息
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version    INT                      NOT NULL DEFAULT 0,

    -- ========== PriorityRecord 特有字段 ==========

    -- 所属项目ID，不允许为空，关联t_project表
    project_id BIGINT                   NOT NULL,

    -- 优先级名称
    -- 例如：低、中、高、紧急等，用于在界面上显示
    name       VARCHAR(50)              NOT NULL,

    -- 优先级等级，数字越大优先级越高
    -- 用于排序和比较不同优先级的重要程度
    level      INT                      NOT NULL,
    
    -- 优先级百分制分数（0-100），用于标准化不同优先级系统
    -- 分数越高表示优先级越高
    score      INT                      NOT NULL DEFAULT 0,
    
    -- 优先级颜色，用于UI显示
    -- 格式为十六进制颜色代码，例如 "#FF0000" 表示红色
    color      VARCHAR(20)
);

-- 优先级名称索引，用于按名称查询
CREATE INDEX idx_priority_name ON t_priority (name);

-- 优先级等级索引，用于按等级排序和查询
CREATE INDEX idx_priority_level ON t_priority (level);

-- 添加表注释
COMMENT
ON TABLE t_priority IS '优先级表，存储系统中的通用优先级定义';

-- 添加列注释
COMMENT
ON COLUMN t_priority.id IS '记录唯一标识，使用TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_priority.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_priority.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_priority.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_priority.version IS '乐观锁版本号，用于并发控制';
COMMENT
ON COLUMN t_priority.project_id IS '所属项目ID，关联t_project表';
COMMENT
ON COLUMN t_priority.name IS '优先级名称，如：低、中、高、紧急等';
COMMENT
ON COLUMN t_priority.level IS '优先级等级，数字越大优先级越高';
COMMENT
ON COLUMN t_priority.score IS '优先级百分制分数（0-100），分数越高表示优先级越高';
COMMENT
ON COLUMN t_priority.color IS '优先级颜色，十六进制颜色代码，例如"#FF0000"表示红色';+
-- Source: t_project.sql
-- 先删除表（如果存在）

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
ON COLUMN t_project.creator_id IS '项目创建者ID，关联t_users表';+
-- Source: t_project_archive_record.sql
-- 先删除表（如果存在）

-- 创建项目归档记录表
-- 此表用于记录项目的归档和取消归档历史
CREATE TABLE t_project_archive_record
(
    -- ========== BaseRecord 基础字段 ==========

    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id            BIGINT PRIMARY KEY,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted       INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间，包含时区信息
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间，包含时区信息
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version       INT                      NOT NULL DEFAULT 0,

    -- ========== 归档记录特有字段 ==========

    -- 项目ID，关联t_project表
    -- 表示该归档记录关联的项目
    project_id    BIGINT                   NOT NULL,

    -- 操作类型
    -- 1-归档，2-取消归档
    operation_type INT                     NOT NULL,

    -- 操作人ID，关联t_user表
    -- 执行归档或取消归档操作的用户
    operator_id   BIGINT                   NOT NULL,

    -- 操作原因
    -- 记录为什么要执行此操作
    reason        TEXT,

    -- 操作时间
    -- 执行归档或取消归档操作的时间
    operated_at   TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ========== 索引创建 ==========

-- 项目ID索引，用于查询特定项目的所有归档记录
CREATE INDEX idx_project_archive_record_project_id ON t_project_archive_record (project_id);

-- 操作人ID索引，用于查询特定用户的操作记录
CREATE INDEX idx_project_archive_record_operator_id ON t_project_archive_record (operator_id);

-- 操作类型索引，用于按操作类型筛选记录
CREATE INDEX idx_project_archive_record_operation_type ON t_project_archive_record (operation_type);

-- 操作时间索引，用于按时间查询操作记录
CREATE INDEX idx_project_archive_record_operated_at ON t_project_archive_record (operated_at);

-- 添加表注释
COMMENT
ON TABLE t_project_archive_record IS '项目归档记录表，记录项目的归档和取消归档历史';

-- 添加列注释
COMMENT
ON COLUMN t_project_archive_record.id IS '记录唯一标识，使用TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_project_archive_record.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_project_archive_record.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_project_archive_record.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_project_archive_record.version IS '乐观锁版本号，用于并发控制';
COMMENT
ON COLUMN t_project_archive_record.project_id IS '项目ID，关联t_project表';
COMMENT
ON COLUMN t_project_archive_record.operation_type IS '操作类型：1-归档，2-取消归档';
COMMENT
ON COLUMN t_project_archive_record.operator_id IS '操作人ID，关联t_user表';
COMMENT
ON COLUMN t_project_archive_record.reason IS '操作原因';
COMMENT
ON COLUMN t_project_archive_record.operated_at IS '操作时间';

-- Source: t_project_member.sql
-- 先删除表（如果存在）

-- 项目成员
CREATE TABLE t_project_member
(
    -- 主键ID，TSID格式（有序的分布式ID）
    id              BIGINT PRIMARY KEY,

    -- 所属项目ID，关联t_projects表
    project_id      BIGINT                   NOT NULL,

    -- 用户ID，关联t_users表
    user_id         BIGINT                   NOT NULL,

    -- 项目角色ID，关联t_project_roles表
    project_role_id BIGINT                   NOT NULL,

    -- 用户加入项目的时间
    joined_at       TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version         INT                      NOT NULL DEFAULT 0
);

-- 创建项目ID索引，优化按项目查询成员的性能
CREATE INDEX idx_project_members_project_id ON t_project_member (project_id);

-- 创建用户ID索引，优化按用户查询所参与项目的性能
CREATE INDEX idx_project_members_user_id ON t_project_member (user_id);

-- 创建角色ID索引，优化按角色查询成员的性能
CREATE INDEX idx_project_members_project_role_id ON t_project_member (project_role_id);

-- 创建项目ID和用户ID的唯一索引，确保同一用户在同一项目中只有一条有效记录
-- WHERE deleted = 0 条件确保只对未删除的记录强制唯一性约束
CREATE UNIQUE INDEX idx_project_members_project_user ON t_project_member (project_id, user_id) WHERE deleted = 0;+
-- Source: t_project_role.sql
-- 先删除表（如果存在）

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
ON COLUMN t_project_role.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_project_role_permission.sql
-- 先删除表（如果存在）

-- 项目角色-权限关联表
CREATE TABLE t_project_role_permission
(
    -- 主键，使用TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 关联的项目角色ID
    project_role_id BIGINT                   NOT NULL,

    -- 关联的权限ID
    permission_id   BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT DEFAULT 0,

    -- 记录创建时间
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间
    updated_at      TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号
    version         INT DEFAULT 0,

    -- 唯一约束，确保一个角色不会重复关联同一个权限
    CONSTRAINT uk_project_role_permission UNIQUE (project_role_id, permission_id, deleted)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_project_role_permission_role_id ON t_project_role_permission (project_role_id);
CREATE INDEX idx_project_role_permission_permission_id ON t_project_role_permission (permission_id);

-- 添加注释
COMMENT
ON TABLE t_project_role_permission IS '项目角色-权限关联表';
COMMENT
ON COLUMN t_project_role_permission.id IS '主键ID，TSID格式的分布式ID';
COMMENT
ON COLUMN t_project_role_permission.project_role_id IS '关联的项目角色ID';
COMMENT
ON COLUMN t_project_role_permission.permission_id IS '关联的权限ID';
COMMENT
ON COLUMN t_project_role_permission.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_project_role_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_project_role_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_project_role_permission.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_project_status.sql
-- 先删除表（如果存在）

-- 创建项目状态表
-- 此表用于存储系统中的项目状态信息，定义项目可能处于的各种状态
CREATE TABLE t_project_status
(
    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id             BIGINT PRIMARY KEY,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted        INT NOT NULL DEFAULT 0,

    -- 项目状态名称，如：规划中、进行中、已完成、已暂停等
    name           VARCHAR(50)              NOT NULL,

    -- 项目状态描述
    description    VARCHAR(255),

    -- 状态颜色，用于UI显示，格式为十六进制颜色码
    color          VARCHAR(20),

    -- 排序顺序，用于在UI中展示的顺序
    display_order  INT                      NOT NULL DEFAULT 0,

    -- 是否为系统默认状态
    is_default     BOOLEAN                  NOT NULL DEFAULT FALSE,

    -- 是否为终止状态（如已完成、已取消等）
    is_terminal    BOOLEAN                  NOT NULL DEFAULT FALSE,
    
    -- 乐观锁版本号，用于并发控制
    version        INT                      NOT NULL DEFAULT 0,

    -- 记录创建时间，包含时区信息
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 记录最后更新时间，包含时区信息
    updated_at     TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX idx_project_status_name ON t_project_status (name);
CREATE INDEX idx_project_status_display_order ON t_project_status (display_order);

-- 添加注释
COMMENT ON TABLE t_project_status IS '项目状态表，存储项目可能处于的各种状态';
COMMENT ON COLUMN t_project_status.id IS '项目状态唯一标识';
COMMENT ON COLUMN t_project_status.name IS '项目状态名称，如：规划中、进行中、已完成、已暂停等';
COMMENT ON COLUMN t_project_status.description IS '项目状态描述';
COMMENT ON COLUMN t_project_status.color IS '状态颜色，用于UI显示，格式为十六进制颜色码';
COMMENT ON COLUMN t_project_status.display_order IS '排序顺序，用于在UI中展示的顺序';
COMMENT ON COLUMN t_project_status.is_default IS '是否为系统默认状态';
COMMENT ON COLUMN t_project_status.is_terminal IS '是否为终止状态（如已完成、已取消等）';
COMMENT ON COLUMN t_project_status.created_at IS '记录创建时间';
COMMENT ON COLUMN t_project_status.updated_at IS '记录最后更新时间';

-- Source: t_project_status_mapping.sql
-- 先删除表（如果存在）

-- 创建项目状态映射表
-- 此表用于存储项目与状态的关联关系
CREATE TABLE t_project_status_mapping (
    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id BIGINT PRIMARY KEY,
    
    -- 项目ID，关联t_project表
    project_id BIGINT NOT NULL,
    
    -- 状态ID，关联t_project_status表
    status_id BIGINT NOT NULL,
    
    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted INT NOT NULL DEFAULT 0,
    
    -- 记录创建时间，包含时区信息
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 记录最后更新时间，包含时区信息
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- 乐观锁版本号，用于并发控制
    version INT NOT NULL DEFAULT 0,
    
    -- 不使用外键约束
    -- FOREIGN KEY (project_id) REFERENCES t_project(id),
    -- FOREIGN KEY (status_id) REFERENCES t_project_status(id),
    
    -- 确保每个项目和状态的组合唯一（只针对未删除的记录）
    CONSTRAINT uk_project_status_mapping UNIQUE (project_id, status_id, deleted)
);

-- 创建索引
CREATE INDEX idx_project_status_mapping_project_id ON t_project_status_mapping(project_id) WHERE deleted = 0;
CREATE INDEX idx_project_status_mapping_status_id ON t_project_status_mapping(status_id) WHERE deleted = 0;

-- 添加注释
COMMENT ON TABLE t_project_status_mapping IS '项目状态映射表，存储项目与状态的关联关系';
COMMENT ON COLUMN t_project_status_mapping.id IS '记录唯一标识，TSID格式';
COMMENT ON COLUMN t_project_status_mapping.project_id IS '项目ID，关联t_project表';
COMMENT ON COLUMN t_project_status_mapping.status_id IS '状态ID，关联t_project_status表';
COMMENT ON COLUMN t_project_status_mapping.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_project_status_mapping.created_at IS '记录创建时间';
COMMENT ON COLUMN t_project_status_mapping.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_project_status_mapping.version IS '乐观锁版本号，用于并发控制';

-- Source: t_project_status_transition.sql
-- 先删除表（如果存在）

-- 项目状态转换表
-- 用于定义项目状态之间的合法转换规则
CREATE TABLE IF NOT EXISTS t_project_status_transition (
    -- 主键ID，使用TSID格式（有序的分布式ID）
    id BIGINT PRIMARY KEY,
    
    -- 项目ID，外键关联t_project表
    project_id BIGINT NOT NULL,
    
    -- 起始状态ID，外键关联t_project_status表
    from_status_id BIGINT NOT NULL,
    
    -- 目标状态ID，外键关联t_project_status表
    to_status_id BIGINT NOT NULL,
    
    -- 事件代码，用于标识触发此转换的事件
    event_code VARCHAR(50) NOT NULL,
    
    -- 转换条件代码，可选，用于定义状态转换的条件
    guard_condition VARCHAR(255),
    
    -- 转换动作代码，可选，用于定义状态转换时执行的动作
    action_code VARCHAR(50),
    
    -- 是否启用，可用于临时禁用某些转换规则
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted INT NOT NULL DEFAULT 0,
    
    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- 乐观锁版本号，用于并发控制
    version INT NOT NULL DEFAULT 0,
    
    -- 唯一约束：同一项目中的同一起始状态下的事件代码必须唯一
    UNIQUE (project_id, from_status_id, event_code, deleted)
);

-- 添加project_id索引
CREATE INDEX idx_project_status_transition_project_id ON t_project_status_transition(project_id);

-- 添加注释
COMMENT ON TABLE t_project_status_transition IS '项目状态转换表';
COMMENT ON COLUMN t_project_status_transition.id IS '主键ID，TSID格式';
COMMENT ON COLUMN t_project_status_transition.project_id IS '项目ID';
COMMENT ON COLUMN t_project_status_transition.from_status_id IS '起始状态ID';
COMMENT ON COLUMN t_project_status_transition.to_status_id IS '目标状态ID';
COMMENT ON COLUMN t_project_status_transition.event_code IS '事件代码';
COMMENT ON COLUMN t_project_status_transition.guard_condition IS '转换条件代码';
COMMENT ON COLUMN t_project_status_transition.action_code IS '转换动作代码';
COMMENT ON COLUMN t_project_status_transition.is_enabled IS '是否启用';
COMMENT ON COLUMN t_project_status_transition.deleted IS '逻辑删除标志';
COMMENT ON COLUMN t_project_status_transition.created_at IS '记录创建时间';
COMMENT ON COLUMN t_project_status_transition.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_project_status_transition.version IS '乐观锁版本号';

-- Source: t_requirement_category.sql
-- 先删除表（如果存在）

-- 需求分类表
-- 存储需求的标签和颜色信息
CREATE TABLE t_requirement_category (
    id BIGINT PRIMARY KEY,
    tags_json TEXT NOT NULL, -- 存储标签数组，JSON字符串
    colors_json TEXT NOT NULL, -- 存储颜色数组，JSON字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 注释
COMMENT ON TABLE t_requirement_category IS '需求分类表，用于管理需求的标签和颜色';
COMMENT ON COLUMN t_requirement_category.id IS '主键ID';
COMMENT ON COLUMN t_requirement_category.tags_json IS '标签数组，JSON格式的字符串';
COMMENT ON COLUMN t_requirement_category.colors_json IS '颜色数组，JSON格式的字符串';
COMMENT ON COLUMN t_requirement_category.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_category.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_category.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_category.version IS '版本号，用于乐观锁'; +
-- Source: t_requirement_completeness.sql
-- 先删除表（如果存在）

-- 需求完整度检查表
-- 存储需求的完整度评估信息
CREATE TABLE t_requirement_completeness (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    overall_completeness VARCHAR(50) NOT NULL, -- 总体完整度
    aspects_json TEXT, -- 各方面完整度，包含name和completeness字段，JSON格式的字符串
    optimization_suggestions_json TEXT, -- 优化建议，包含icon和content字段，JSON格式的字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_completeness_requirement_id ON t_requirement_completeness(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_completeness IS '需求完整度检查表，用于评估需求的完整度';
COMMENT ON COLUMN t_requirement_completeness.id IS '主键ID';
COMMENT ON COLUMN t_requirement_completeness.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_completeness.overall_completeness IS '总体完整度评估，如"高"、"中"、"低"';
COMMENT ON COLUMN t_requirement_completeness.aspects_json IS '各方面完整度评估，JSON格式的字符串，包含name和completeness字段';
COMMENT ON COLUMN t_requirement_completeness.optimization_suggestions_json IS '优化建议，JSON格式的字符串，包含icon和content字段';
COMMENT ON COLUMN t_requirement_completeness.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_completeness.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_completeness.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_completeness.version IS '版本号，用于乐观锁'; +
-- Source: t_requirement_conversation.sql
-- 先删除表（如果存在）

-- 需求对话列表表
-- 存储需求对话的元数据和关联关系
CREATE TABLE t_requirement_conversation (
    id BIGINT PRIMARY KEY,
    conversation_list_id BIGINT, -- 关联的需求对话列表ID（关联t_requirement_conversation_list表）
    requirement_id BIGINT, -- 关联的需求ID
    title TEXT NOT NULL, -- 对话列表标题
    start_status TEXT, -- 开始状态
    analysis_start_status TEXT, -- 开始分析状态
    analysis_complete_status TEXT, -- 分析完成状态
    requirement_category_id BIGINT, -- 需求分类id
    requirement_priority_id BIGINT, -- 优先级表id
    requirement_workload_id BIGINT, -- 工作量表id
    requirement_task_breakdown_id BIGINT, -- 任务拆分表id
    requirement_completeness_id BIGINT, -- 需求完整度检查表id
    requirement_suggestion_id BIGINT, -- 智能建议表id
    requirement_summary_analysis_id BIGINT, -- 总结分析表id
    root_main_task TEXT, -- 首轮主任务锚点（同会话只写一次）
    current_turn_no INT DEFAULT 0, -- 当前回合号
    latest_task_breakdown_json TEXT, -- 最近一轮任务拆分快照
    requirement_type_json TEXT, -- 需求分类分析快照
    priority_json TEXT, -- 优先级分析快照
    workload_json TEXT, -- 工作量分析快照
    completeness_json TEXT, -- 完整度分析快照
    suggestion_json TEXT, -- 智能建议快照
    analysis_summary_json TEXT, -- 分析摘要快照
    final_summary_json TEXT, -- 分析总结快照
    task_planning_json TEXT, -- 任务规划快照
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_req_conv_requirement_id ON t_requirement_conversation(requirement_id);
CREATE INDEX idx_t_req_conv_conversation_list_id ON t_requirement_conversation(conversation_list_id);
CREATE INDEX idx_t_req_conv_category_id ON t_requirement_conversation(requirement_category_id);
CREATE INDEX idx_t_req_conv_priority_id ON t_requirement_conversation(requirement_priority_id);
CREATE INDEX idx_t_req_conv_workload_id ON t_requirement_conversation(requirement_workload_id);
CREATE INDEX idx_t_req_conv_task_breakdown_id ON t_requirement_conversation(requirement_task_breakdown_id);
CREATE INDEX idx_t_req_conv_completeness_id ON t_requirement_conversation(requirement_completeness_id);
CREATE INDEX idx_t_req_conv_suggestion_id ON t_requirement_conversation(requirement_suggestion_id);
CREATE INDEX idx_t_req_conv_summary_analysis_id ON t_requirement_conversation(requirement_summary_analysis_id);
CREATE INDEX idx_t_req_conv_current_turn_no ON t_requirement_conversation(current_turn_no);

-- 注释
COMMENT ON TABLE t_requirement_conversation IS '需求对话列表表，用于管理需求对话及其关联的分析数据';
COMMENT ON COLUMN t_requirement_conversation.id IS '主键ID';
COMMENT ON COLUMN t_requirement_conversation.conversation_list_id IS '关联的需求对话列表ID，关联t_requirement_conversation_list表';
COMMENT ON COLUMN t_requirement_conversation.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_conversation.title IS '对话列表标题';
COMMENT ON COLUMN t_requirement_conversation.start_status IS '对话开始状态';
COMMENT ON COLUMN t_requirement_conversation.analysis_start_status IS '分析开始状态';
COMMENT ON COLUMN t_requirement_conversation.analysis_complete_status IS '分析完成状态';
COMMENT ON COLUMN t_requirement_conversation.requirement_category_id IS '关联的需求分类ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_priority_id IS '关联的需求优先级ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_workload_id IS '关联的需求工作量ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_task_breakdown_id IS '关联的需求任务拆分ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_completeness_id IS '关联的需求完整度检查ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_suggestion_id IS '关联的需求智能建议ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_summary_analysis_id IS '关联的需求总结分析ID';
COMMENT ON COLUMN t_requirement_conversation.root_main_task IS '首轮主任务锚点（同会话只写一次）';
COMMENT ON COLUMN t_requirement_conversation.current_turn_no IS '当前回合号';
COMMENT ON COLUMN t_requirement_conversation.latest_task_breakdown_json IS '最近一轮任务拆分快照JSON';
COMMENT ON COLUMN t_requirement_conversation.requirement_type_json IS '需求分类分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.priority_json IS '优先级分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.workload_json IS '工作量分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.completeness_json IS '完整度分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.suggestion_json IS '智能建议分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.analysis_summary_json IS '分析摘要快照JSON';
COMMENT ON COLUMN t_requirement_conversation.final_summary_json IS '分析总结快照JSON';
COMMENT ON COLUMN t_requirement_conversation.task_planning_json IS '任务规划快照JSON';
COMMENT ON COLUMN t_requirement_conversation.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_conversation.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_conversation.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_conversation.version IS '版本号，用于乐观锁';

-- Source: t_requirement_conversation_list.sql
-- 先删除表（如果存在）

-- 需求对话列表表（基础版）
-- 仅包含主键ID和通用审计字段
CREATE TABLE t_requirement_conversation_list
(
    -- 对话列表唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id         BIGINT PRIMARY KEY,

    -- 所属项目ID，关联 t_project.id
    project_id BIGINT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version    INT         NOT NULL DEFAULT 0
);

CREATE INDEX idx_t_req_conv_list_project_id ON t_requirement_conversation_list(project_id);

-- 添加表注释
COMMENT ON TABLE t_requirement_conversation_list IS '需求对话列表表（基础版），包含项目归属与通用审计字段';
COMMENT ON COLUMN t_requirement_conversation_list.id IS '对话列表唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_requirement_conversation_list.project_id IS '所属项目ID，关联t_project表';
COMMENT ON COLUMN t_requirement_conversation_list.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_conversation_list.created_at IS '记录创建时间';
COMMENT ON COLUMN t_requirement_conversation_list.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_requirement_conversation_list.version IS '乐观锁版本号，用于并发控制';

-- Source: t_requirement_conversation_turn.sql
-- 先删除表（如果存在）

-- 需求会话回合表
-- 按回合存储用户输入与回合结束快照
CREATE TABLE t_requirement_conversation_turn (
    id BIGINT PRIMARY KEY,
    conversation_list_id BIGINT NOT NULL, -- 关联的会话ID（t_requirement_conversation_list.id）
    turn_no INT NOT NULL, -- 回合号，从1开始
    user_input TEXT NOT NULL, -- 本轮用户输入
    analysis_start_status TEXT, -- 本轮分析开始状态
    analysis_complete_status TEXT, -- 本轮分析完成状态
    snapshot_json TEXT NOT NULL, -- 回合结束时快照
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

CREATE INDEX idx_t_req_conv_turn_list_id ON t_requirement_conversation_turn(conversation_list_id);
CREATE INDEX idx_t_req_conv_turn_turn_no ON t_requirement_conversation_turn(turn_no);

COMMENT ON TABLE t_requirement_conversation_turn IS '需求会话回合表，记录每轮输入与快照';
COMMENT ON COLUMN t_requirement_conversation_turn.id IS '主键ID';
COMMENT ON COLUMN t_requirement_conversation_turn.conversation_list_id IS '会话ID，关联t_requirement_conversation_list.id';
COMMENT ON COLUMN t_requirement_conversation_turn.turn_no IS '会话内回合号';
COMMENT ON COLUMN t_requirement_conversation_turn.user_input IS '本轮用户输入';
COMMENT ON COLUMN t_requirement_conversation_turn.analysis_start_status IS '本轮分析开始状态';
COMMENT ON COLUMN t_requirement_conversation_turn.analysis_complete_status IS '本轮分析完成状态';
COMMENT ON COLUMN t_requirement_conversation_turn.snapshot_json IS '本轮结束时状态快照JSON';
COMMENT ON COLUMN t_requirement_conversation_turn.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_conversation_turn.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_conversation_turn.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_conversation_turn.version IS '版本号，用于乐观锁';

-- Source: t_requirement_priority.sql
-- 先删除表（如果存在）

-- 需求优先级表
-- 存储需求的优先级、排期和相关因素信息
CREATE TABLE t_requirement_priority (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    priority_json TEXT, -- 存储优先级信息，包含level、score、analysis，JSON格式的字符串
    scheduling_json TEXT, -- 存储排期信息，包含recommendation，JSON格式的字符串
    factors_json TEXT, -- 存储因素信息，包含difficulty、resourceMatch、dependencies，JSON格式的字符串
    justification TEXT, -- 排期建议理由
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_priority_requirement_id ON t_requirement_priority(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_priority IS '需求优先级表，用于存储需求的优先级和排期信息';
COMMENT ON COLUMN t_requirement_priority.id IS '主键ID';
COMMENT ON COLUMN t_requirement_priority.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_priority.priority_json IS '优先级信息，JSON格式的字符串，包含level、score、analysis字段';
COMMENT ON COLUMN t_requirement_priority.scheduling_json IS '排期信息，JSON格式的字符串，包含recommendation字段';
COMMENT ON COLUMN t_requirement_priority.factors_json IS '影响因素，JSON格式的字符串，包含difficulty、resourceMatch、dependencies字段';
COMMENT ON COLUMN t_requirement_priority.justification IS '排期建议理由';
COMMENT ON COLUMN t_requirement_priority.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_priority.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_priority.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_priority.version IS '版本号，用于乐观锁'; +
-- Source: t_requirement_suggestion.sql
-- 先删除表（如果存在）

-- 需求智能建议表
-- 存储需求的智能建议信息
CREATE TABLE t_requirement_suggestion (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    suggestions_json TEXT, -- 建议列表，包含type、title、icon、color、description字段，JSON格式的字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_suggestion_requirement_id ON t_requirement_suggestion(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_suggestion IS '需求智能建议表，用于存储系统对需求的智能建议';
COMMENT ON COLUMN t_requirement_suggestion.id IS '主键ID';
COMMENT ON COLUMN t_requirement_suggestion.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_suggestion.suggestions_json IS '建议列表，JSON格式的字符串，包含type、title、icon、color、description字段';
COMMENT ON COLUMN t_requirement_suggestion.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_suggestion.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_suggestion.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_suggestion.version IS '版本号，用于乐观锁'; +
-- Source: t_requirement_summary_analysis.sql
-- 先删除表（如果存在）

-- 需求总结分析表
-- 存储需求的总结和分析信息
CREATE TABLE t_requirement_summary_analysis (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    summary_json TEXT NOT NULL, -- 存储摘要信息，包含title, overview, keyPoints, challenges, opportunities，JSON格式的字符串
    task_arrangement_json TEXT NOT NULL, -- 存储任务安排信息，包含phases, resourceRecommendations, riskManagement，JSON格式的字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_summary_analysis_requirement_id ON t_requirement_summary_analysis(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_summary_analysis IS '需求总结分析表，用于存储需求的总结和分析信息';
COMMENT ON COLUMN t_requirement_summary_analysis.id IS '主键ID';
COMMENT ON COLUMN t_requirement_summary_analysis.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_summary_analysis.summary_json IS '摘要信息，JSON格式的字符串，包含title, overview, keyPoints, challenges, opportunities字段，其中keyPoints、challenges、opportunities为字符串数组';
COMMENT ON COLUMN t_requirement_summary_analysis.task_arrangement_json IS '任务安排信息，JSON格式的字符串，包含phases, resourceRecommendations, riskManagement字段，具体结构如下：
- phases包含name、description、estimatedWorkload、suggestedTimeframe、tasks字段，其中tasks包含name、priority、estimatedWorkload、dependencies、assignmentSuggestion，dependencies为字符串数组
- resourceRecommendations包含personnel、skills、tools字段，均为字符串数组
- riskManagement包含risk、impact、mitigation字段，均为字符串数组';
COMMENT ON COLUMN t_requirement_summary_analysis.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_summary_analysis.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_summary_analysis.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_summary_analysis.version IS '版本号，用于乐观锁'; +
-- Source: t_requirement_task_breakdown.sql
-- 先删除表（如果存在）

-- 需求任务拆分表
-- 存储需求的任务拆分信息
CREATE TABLE t_requirement_task_breakdown (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    main_task TEXT NOT NULL, -- 主任务描述
    sub_tasks_json TEXT NOT NULL, -- 子任务列表，包含id,task_id,description,dependency,priority,parallel_group字段，JSON格式的字符串
    parallelism_score INT, -- 并行度评分
    parallel_execution_tips TEXT, -- 并行执行提示
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_task_breakdown_requirement_id ON t_requirement_task_breakdown(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_task_breakdown IS '需求任务拆分表，用于存储需求的任务拆分信息';
COMMENT ON COLUMN t_requirement_task_breakdown.id IS '主键ID';
COMMENT ON COLUMN t_requirement_task_breakdown.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_task_breakdown.main_task IS '主任务描述';
COMMENT ON COLUMN t_requirement_task_breakdown.sub_tasks_json IS '子任务列表，JSON格式的字符串，包含id,task_id,description,dependency,priority,parallel_group字段，其中dependency为JSON格式包含task_id';
COMMENT ON COLUMN t_requirement_task_breakdown.parallelism_score IS '并行度评分，用于评估任务的并行可行性';
COMMENT ON COLUMN t_requirement_task_breakdown.parallel_execution_tips IS '并行执行提示，提供任务并行执行的建议';
COMMENT ON COLUMN t_requirement_task_breakdown.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_task_breakdown.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_task_breakdown.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_task_breakdown.version IS '版本号，用于乐观锁'; +
-- Source: t_requirement_workload.sql
-- 先删除表（如果存在）

-- 需求工作量表
-- 存储需求的工作量估计信息
CREATE TABLE t_requirement_workload (
    id BIGINT PRIMARY KEY,
    requirement_id BIGINT, -- 关联到需求的ID
    optimistic_json VARCHAR(20) NOT NULL, -- 乐观估计，JSON字符串
    most_likely_json VARCHAR(20) NOT NULL, -- 最可能估计，JSON字符串
    pessimistic_json VARCHAR(20) NOT NULL, -- 悉观估计，JSON字符串
    expected_json VARCHAR(20) NOT NULL, -- 期望工作量，JSON字符串
    standard_deviation_json VARCHAR(20) NOT NULL, -- 标准差，JSON字符串
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_requirement_workload_requirement_id ON t_requirement_workload(requirement_id);

-- 注释
COMMENT ON TABLE t_requirement_workload IS '需求工作量表，用于存储需求的工作量估计信息';
COMMENT ON COLUMN t_requirement_workload.id IS '主键ID';
COMMENT ON COLUMN t_requirement_workload.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_workload.optimistic_json IS '乐观工作量估计，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.most_likely_json IS '最可能工作量估计，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.pessimistic_json IS '悉观工作量估计，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.expected_json IS '期望工作量，通常通过(optimistic + 4*most_likely + pessimistic)/6计算，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.standard_deviation_json IS '标准差，用于衡量估计的不确定性，JSON字符串';
COMMENT ON COLUMN t_requirement_workload.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_workload.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_workload.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_workload.version IS '版本号，用于乐观锁'; +
-- Source: t_role.sql
-- 先删除表（如果存在）

-- 系统全局角色表记录表
CREATE TABLE t_role
(
    -- 角色唯一标识，使用BIGINT类型
    -- 采用TSID格式（有序的分布式ID）
    id          BIGINT PRIMARY KEY,

    -- 角色名称，不可重复
    -- 用于在系统中标识角色，例如"管理员"、"普通用户"等
    name        VARCHAR(100) NOT NULL,

    -- 角色描述，说明角色的用途和权限范围
    -- 可以为空
    description TEXT,

    -- 逻辑删除标志，0表示未删除，非0值表示已删除
    -- 使用逻辑删除而非物理删除，便于数据恢复和审计
    deleted     INTEGER      NOT NULL DEFAULT 0,

    -- 记录创建时间
    -- 使用带时区的时间戳类型，确保时间的准确性
    created_at  TIMESTAMPTZ  NOT NULL,

    -- 记录最后更新时间
    -- 可以为空，表示记录尚未更新过
    updated_at  TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    -- 每次更新记录时版本号会自增，防止并发更新冲突
    version     INTEGER      NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保角色名称在系统中唯一
    CONSTRAINT uk_role_name UNIQUE (name)
);

-- 添加注释
COMMENT
ON TABLE t_role IS '系统全局角色表，存储系统中所有可用的角色定义';
COMMENT
ON COLUMN t_role.id IS '角色唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_role.name IS '角色名称，不可重复';
COMMENT
ON COLUMN t_role.description IS '角色描述，说明角色的用途和权限范围';
COMMENT
ON COLUMN t_role.deleted IS '逻辑删除标志，0表示未删除，非0值表示已删除';
COMMENT
ON COLUMN t_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_role.version IS '乐观锁版本号，用于并发控制';

-- 创建索引以提高查询性能
-- 为常用查询条件创建索引
CREATE INDEX idx_role_deleted ON t_role (deleted);
CREATE INDEX idx_role_created_at ON t_role (created_at);

-- 添加索引注释
COMMENT
ON INDEX idx_role_deleted IS '逻辑删除标志索引，用于过滤已删除记录';
COMMENT
ON INDEX idx_role_created_at IS '创建时间索引，用于按创建时间排序和查询';+
-- Source: t_role_permission.sql
-- 先删除表（如果存在）

-- 角色-权限关联表记录表
CREATE TABLE t_role_permission
(
    -- 关联记录唯一标识，使用BIGINT类型
    -- 采用TSID格式（有序的分布式ID）
    id            BIGINT PRIMARY KEY,

    -- 关联的角色ID
    -- 外键引用t_roles表的id字段
    role_id       BIGINT      NOT NULL,

    -- 关联的权限ID
    -- 外键引用t_permissions表的id字段
    permission_id BIGINT      NOT NULL,

    -- 逻辑删除标志，0表示未删除，非0值表示已删除
    deleted       INTEGER     NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMPTZ NOT NULL,

    -- 记录最后更新时间
    updated_at    TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER     NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保一个角色不会重复关联同一个权限
    CONSTRAINT uk_role_permission UNIQUE (role_id, permission_id)
);

-- 添加注释
COMMENT
ON TABLE t_role_permission IS '角色-权限关联表，存储角色与权限之间的多对多关系';
COMMENT
ON COLUMN t_role_permission.id IS '关联记录唯一标识';
COMMENT
ON COLUMN t_role_permission.role_id IS '关联的角色ID';
COMMENT
ON COLUMN t_role_permission.permission_id IS '关联的权限ID';
COMMENT
ON COLUMN t_role_permission.deleted IS '逻辑删除标志，0表示未删除';
COMMENT
ON COLUMN t_role_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_role_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_role_permission.version IS '乐观锁版本号';

-- 创建索引以提高查询性能
CREATE INDEX idx_role_permission_role_id ON t_role_permission (role_id);
CREATE INDEX idx_role_permission_permission_id ON t_role_permission (permission_id);
CREATE INDEX idx_role_permission_deleted ON t_role_permission (deleted);

-- 添加索引注释
COMMENT
ON INDEX idx_role_permission_role_id IS '角色ID索引，用于查询角色的所有权限';
COMMENT
ON INDEX idx_role_permission_permission_id IS '权限ID索引，用于查询拥有特定权限的所有角色';
COMMENT
ON INDEX idx_role_permission_deleted IS '逻辑删除标志索引，用于过滤已删除记录';+
-- Source: t_tag.sql
-- 先删除表（如果存在）

-- 创建标签表
-- 此表用于存储系统中所有标签信息，包括全局标签和项目特定标签
CREATE TABLE t_tag
(
    -- 标签唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id          BIGINT PRIMARY KEY,

    -- 标签名称，不允许为空，最大长度50个字符
    name        VARCHAR(50) NOT NULL,

    -- 标签颜色，十六进制颜色代码，默认为白色
    color       VARCHAR(7)  NOT NULL DEFAULT '#FFFFFF',

    -- 标签描述，可为空，最大长度200个字符
    description VARCHAR(200),

    -- 所属项目ID，可为空（为空表示全局标签）
    project_id  BIGINT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at  TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version     INT         NOT NULL DEFAULT 0,

    -- 创建唯一约束：确保同一项目下标签名称唯一（全局标签project_id为NULL）
    CONSTRAINT uk_tag_name_project UNIQUE (name, project_id)
);

-- 添加表注释
COMMENT ON TABLE t_tag IS '标签表，存储系统中的所有标签信息';
COMMENT ON COLUMN t_tag.id IS '标签唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_tag.name IS '标签名称';
COMMENT ON COLUMN t_tag.color IS '标签颜色，十六进制颜色代码';
COMMENT ON COLUMN t_tag.description IS '标签描述';
COMMENT ON COLUMN t_tag.project_id IS '所属项目ID，如果为空则表示是全局标签';
COMMENT ON COLUMN t_tag.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_tag.created_at IS '记录创建时间';
COMMENT ON COLUMN t_tag.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_tag.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_tag_category.sql
-- 先删除表（如果存在）

-- 创建标签分类表
-- 此表用于存储标签的分类信息，可以是全局分类或团队特定分类
CREATE TABLE t_tag_category
(
    -- 分类唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id          BIGINT PRIMARY KEY,

    -- 分类名称，不允许为空，最大长度50个字符
    name        VARCHAR(50) NOT NULL,

    -- 分类描述，可为空，最大长度200个字符
    description VARCHAR(200),

    -- 分类颜色代码，十六进制颜色代码，可为空
    color_code  VARCHAR(7),

    -- 分类图标，存储图标名称或路径，可为空，最大长度100个字符
    icon        VARCHAR(100),

    -- 所属团队ID，可为空（为空表示全局分类）
    team_id     BIGINT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at  TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version     INT         NOT NULL DEFAULT 0,

    -- 创建唯一约束：确保同一团队下分类名称唯一（全局分类team_id为NULL）
    CONSTRAINT uk_tag_category_name_team UNIQUE (name, team_id)
);

-- 创建索引：分类名称索引，提高按名称查询的性能
CREATE INDEX idx_tag_category_name ON t_tag_category (name);

-- 创建索引：团队ID索引，提高按团队查询分类的性能
CREATE INDEX idx_tag_category_team_id ON t_tag_category (team_id);

-- 添加表注释
COMMENT ON TABLE t_tag_category IS '标签分类表，存储标签的分类信息';
COMMENT ON COLUMN t_tag_category.id IS '分类唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_tag_category.name IS '分类名称';
COMMENT ON COLUMN t_tag_category.description IS '分类描述';
COMMENT ON COLUMN t_tag_category.color_code IS '分类颜色代码，十六进制颜色代码';
COMMENT ON COLUMN t_tag_category.icon IS '分类图标';
COMMENT ON COLUMN t_tag_category.team_id IS '所属团队ID，如果为空则为全局分类';
COMMENT ON COLUMN t_tag_category.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_tag_category.created_at IS '记录创建时间';
COMMENT ON COLUMN t_tag_category.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_tag_category.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_tag_category_mapping.sql
-- 先删除表（如果存在）

-- 创建标签与分类关联表
-- 此表用于存储标签与分类之间的多对多关系
CREATE TABLE t_tag_category_mapping
(
    -- 关联记录唯一标识
    id          BIGINT PRIMARY KEY,

    -- 标签ID，不允许为空
    tag_id      BIGINT      NOT NULL,

    -- 分类ID，不允许为空
    category_id BIGINT      NOT NULL,

    -- 标签在分类中的排序顺序
    sort_order  INT         NOT NULL DEFAULT 0,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     INT         NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at  TIMESTAMPTZ,

    -- 乐观锁版本号
    version     INT         NOT NULL DEFAULT 0,

    -- 创建唯一约束：确保一个标签在一个分类中只出现一次
    CONSTRAINT uk_tag_category UNIQUE (tag_id, category_id)
);

-- 创建索引：标签ID索引，提高按标签查询的性能
CREATE INDEX idx_tag_category_mapping_tag_id ON t_tag_category_mapping (tag_id);

-- 创建索引：分类ID索引，提高按分类查询的性能
CREATE INDEX idx_tag_category_mapping_category_id ON t_tag_category_mapping (category_id);

-- 添加表注释
COMMENT ON TABLE t_tag_category_mapping IS '标签与分类关联表，存储标签与分类之间的多对多关系';
COMMENT ON COLUMN t_tag_category_mapping.id IS '关联记录唯一标识';
COMMENT ON COLUMN t_tag_category_mapping.tag_id IS '标签ID';
COMMENT ON COLUMN t_tag_category_mapping.category_id IS '分类ID';
COMMENT ON COLUMN t_tag_category_mapping.sort_order IS '标签在分类中的排序顺序';
COMMENT ON COLUMN t_tag_category_mapping.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_tag_category_mapping.created_at IS '记录创建时间';
COMMENT ON COLUMN t_tag_category_mapping.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_tag_category_mapping.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_task.sql
-- 先删除表（如果存在）

-- 创建任务表
-- 此表用于存储系统中的所有任务信息
CREATE TABLE t_task
(
    -- 任务唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id             BIGINT PRIMARY KEY,

    -- 任务标题，不允许为空，最大长度200个字符
    title          VARCHAR(200) NOT NULL,

    -- 任务描述，可为空，使用TEXT类型存储长文本
    description    TEXT,

    -- 所属项目ID，不允许为空，关联t_project表
    project_id     BIGINT       NOT NULL,

    -- 父任务ID，可为空，关联t_task表自身，用于实现任务层级结构
    parent_task_id BIGINT,

    -- 需求对话列表ID，可为空，关联t_requirement_conversation_list表
    conversation_list_id BIGINT,

    -- 任务状态ID，不允许为空，关联t_task_status表
    status_id      BIGINT       NOT NULL,

    -- 任务优先级ID，不允许为空，关联t_priority表
    priority_id    BIGINT       NOT NULL,

    -- 任务创建者ID，不允许为空，关联t_user表
    creator_id     BIGINT       NOT NULL,

    -- 任务负责人ID，可为空，关联t_user表
    assignee_id    BIGINT,

    -- 任务开始时间，可为空
    start_time     TIMESTAMPTZ,

    -- 任务截止时间，可为空
    due_date       TIMESTAMPTZ,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted        INT          NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at     TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version        INT          NOT NULL DEFAULT 0
);

-- 创建索引：项目ID索引，提高按项目查询任务的性能
CREATE INDEX idx_task_project_id ON t_task (project_id);

-- 创建索引：父任务ID索引，提高查询子任务的性能
CREATE INDEX idx_task_parent_task_id ON t_task (parent_task_id);

-- 创建索引：需求对话列表ID索引，提高关联查询性能
CREATE INDEX idx_task_conversation_list_id ON t_task (conversation_list_id);

-- 创建索引：状态ID索引，提高按状态查询任务的性能
CREATE INDEX idx_task_status_id ON t_task (status_id);

-- 创建索引：优先级ID索引，提高按优先级查询任务的性能
CREATE INDEX idx_task_priority_id ON t_task (priority_id);

-- 创建索引：创建者ID索引，提高按创建者查询任务的性能
CREATE INDEX idx_task_creator_id ON t_task (creator_id);

-- 创建索引：负责人ID索引，提高按负责人查询任务的性能
CREATE INDEX idx_task_assignee_id ON t_task (assignee_id);

-- 创建索引：开始时间索引，提高按开始时间查询任务的性能
CREATE INDEX idx_task_start_time ON t_task (start_time);

-- 创建索引：截止日期索引，提高按截止日期查询任务的性能
CREATE INDEX idx_task_due_date ON t_task (due_date);

-- 添加表注释
COMMENT ON TABLE t_task IS '任务表，存储系统中的所有任务信息';
COMMENT ON COLUMN t_task.id IS '任务唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task.title IS '任务标题';
COMMENT ON COLUMN t_task.description IS '任务描述';
COMMENT ON COLUMN t_task.project_id IS '所属项目ID，关联t_project表';
COMMENT ON COLUMN t_task.parent_task_id IS '父任务ID，关联t_task表自身，用于实现任务层级结构';
COMMENT ON COLUMN t_task.conversation_list_id IS '需求对话列表ID，关联t_requirement_conversation_list表';
COMMENT ON COLUMN t_task.status_id IS '任务状态ID，关联t_task_status表';
COMMENT ON COLUMN t_task.priority_id IS '任务优先级ID，关联t_priority表';
COMMENT ON COLUMN t_task.creator_id IS '任务创建者ID，关联t_user表';
COMMENT ON COLUMN t_task.assignee_id IS '任务负责人ID，关联t_user表';
COMMENT ON COLUMN t_task.start_time IS '任务开始时间';
COMMENT ON COLUMN t_task.due_date IS '任务截止日期';
COMMENT ON COLUMN t_task.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_task_comment.sql
-- 先删除表（如果存在）

-- 创建任务评论表
-- 此表用于存储任务的评论信息，支持评论回复功能
CREATE TABLE t_task_comment
(
    -- 评论唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id                BIGINT PRIMARY KEY,

    -- 所属任务ID，不允许为空，关联t_task表
    task_id           BIGINT      NOT NULL,

    -- 评论作者ID，不允许为空，关联t_user表
    author_id         BIGINT      NOT NULL,

    -- 评论内容，不允许为空，使用TEXT类型存储长文本
    content           TEXT        NOT NULL,

    -- 父评论ID，可为空，关联t_task_comment表自身，用于实现评论回复功能
    parent_comment_id BIGINT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted           INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at        TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version           INT         NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询评论的性能
CREATE INDEX idx_task_comment_task_id ON t_task_comment (task_id);

-- 创建索引：作者ID索引，提高按作者查询评论的性能
CREATE INDEX idx_task_comment_author_id ON t_task_comment (author_id);

-- 创建索引：父评论ID索引，提高查询回复的性能
CREATE INDEX idx_task_comment_parent_id ON t_task_comment (parent_comment_id);

-- 添加表注释
COMMENT ON TABLE t_task_comment IS '任务评论表，存储任务的评论信息';
COMMENT ON COLUMN t_task_comment.id IS '评论唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_comment.task_id IS '所属任务ID，关联t_task表';
COMMENT ON COLUMN t_task_comment.author_id IS '评论作者ID，关联t_user表';
COMMENT ON COLUMN t_task_comment.content IS '评论内容';
COMMENT ON COLUMN t_task_comment.parent_comment_id IS '父评论ID，关联t_task_comment表自身，用于实现评论回复功能';
COMMENT ON COLUMN t_task_comment.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task_comment.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_comment.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task_comment.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_task_dependency.sql
-- 先删除表（如果存在）

-- 创建任务依赖关系表
-- 此表用于存储任务之间的依赖关系，实现多对多的依赖结构
CREATE TABLE t_task_dependency
(
    -- 依赖关系唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id                 BIGINT PRIMARY KEY,
    
    -- 依赖方任务ID，不允许为空，关联t_task表
    task_id            BIGINT NOT NULL,
    
    -- 被依赖任务ID，不允许为空，关联t_task表
    depends_on_task_id BIGINT NOT NULL,
    
    -- 依赖关系说明，可为空
    description        TEXT,
    
    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted            INT NOT NULL DEFAULT 0,
    
    -- 记录创建时间，使用带时区的时间戳类型
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at         TIMESTAMPTZ,
    
    -- 乐观锁版本号，用于并发控制
    version            INT NOT NULL DEFAULT 0,
    
    -- 添加唯一约束，确保同一对任务之间只能存在一个依赖关系
    CONSTRAINT uk_task_dependency UNIQUE (task_id, depends_on_task_id)
    
    -- 外键约束已删除以允许删除t_task表
    -- CONSTRAINT fk_task_dependency_task FOREIGN KEY (task_id) REFERENCES t_task (id),
    -- CONSTRAINT fk_task_dependency_depends_on_task FOREIGN KEY (depends_on_task_id) REFERENCES t_task (id)
);

-- 创建索引：依赖方任务ID索引，提高查询任务依赖关系的性能
CREATE INDEX idx_task_dependency_task_id ON t_task_dependency (task_id);

-- 创建索引：被依赖任务ID索引，提高查询依赖于特定任务的关系性能
CREATE INDEX idx_task_dependency_depends_on_task_id ON t_task_dependency (depends_on_task_id);

-- 添加表注释
COMMENT ON TABLE t_task_dependency IS '任务依赖关系表，存储任务之间的依赖关系';
COMMENT ON COLUMN t_task_dependency.id IS '依赖关系唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_dependency.task_id IS '依赖方任务ID，表示哪个任务依赖其他任务';
COMMENT ON COLUMN t_task_dependency.depends_on_task_id IS '被依赖任务ID，表示被哪个任务所依赖';
COMMENT ON COLUMN t_task_dependency.description IS '依赖关系说明，描述为什么存在此依赖';
COMMENT ON COLUMN t_task_dependency.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task_dependency.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_dependency.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task_dependency.version IS '乐观锁版本号，用于并发控制';

-- Source: t_task_history.sql
-- 任务历史记录表
-- 记录任务的变更历史，包括状态变更、内容修改等
CREATE TABLE t_task_history (
    -- 主键ID，使用TSID格式（有序的分布式ID）
    id BIGINT PRIMARY KEY,
    
    -- 关联的任务ID
    task_id BIGINT NOT NULL,
    
    -- 操作用户ID
    user_id BIGINT NOT NULL,
    
    -- 操作类型
    -- CREATE: 创建, UPDATE: 更新, DELETE: 删除, ASSIGN: 分配, STATUS_CHANGE: 状态变更
    -- PRIORITY_CHANGE: 优先级变更, DESCRIPTION_CHANGE: 描述变更, TITLE_CHANGE: 标题变更
    -- DUEDATE_CHANGE: 截止日期变更
    operation_type VARCHAR(50) NOT NULL,
    
    -- 修改的字段名
    field_name VARCHAR(100) NOT NULL,
    
    -- 修改前的值（JSON格式）
    old_value TEXT,
    
    -- 修改后的值（JSON格式）
    new_value TEXT,
    
    -- 描述信息
    description VARCHAR(500) NOT NULL,
    
    -- 是否是主任务的修改
    is_main_task BOOLEAN NOT NULL DEFAULT false,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted INT NOT NULL DEFAULT 0,
    
    -- 乐观锁版本号
    version INT NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at  TIMESTAMPTZ
);

-- 添加说明注释
COMMENT ON TABLE t_task_history IS '任务历史记录表';
COMMENT ON COLUMN t_task_history.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_history.task_id IS '关联的任务ID';
COMMENT ON COLUMN t_task_history.user_id IS '操作用户ID';
COMMENT ON COLUMN t_task_history.operation_type IS '操作类型（CREATE/UPDATE/DELETE等）';
COMMENT ON COLUMN t_task_history.field_name IS '修改的字段名';
COMMENT ON COLUMN t_task_history.old_value IS '修改前的值（JSON格式）';
COMMENT ON COLUMN t_task_history.new_value IS '修改后的值（JSON格式）';
COMMENT ON COLUMN t_task_history.description IS '描述信息';
COMMENT ON COLUMN t_task_history.is_main_task IS '是否是主任务的修改';
COMMENT ON COLUMN t_task_history.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_history.updated_at IS '记录最后更新时间';

-- 创建索引提高查询性能
CREATE INDEX idx_task_history_task_id ON t_task_history(task_id);
CREATE INDEX idx_task_history_user_id ON t_task_history(user_id);
CREATE INDEX idx_task_history_created_at ON t_task_history(created_at);

-- Source: t_task_tag.sql
-- 先删除表（如果存在）

-- 创建任务标签关联表
-- 此表用于存储任务与标签之间的多对多关系
CREATE TABLE t_task_tag
(
    -- 关联记录唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id         BIGINT PRIMARY KEY,

    -- 任务ID，不允许为空，关联t_task表
    task_id    BIGINT      NOT NULL,

    -- 标签ID，不允许为空，关联t_tag表
    tag_id     BIGINT      NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version    INT         NOT NULL DEFAULT 0,

    -- 创建唯一约束：确保一个任务只能关联一个标签一次
    CONSTRAINT uk_task_tag UNIQUE (task_id, tag_id)
);

-- 创建索引：任务ID索引，提高按任务查询标签的性能
CREATE INDEX idx_task_tag_task_id ON t_task_tag (task_id);

-- 创建索引：标签ID索引，提高按标签查询任务的性能
CREATE INDEX idx_task_tag_tag_id ON t_task_tag (tag_id);

-- 添加表注释
COMMENT ON TABLE t_task_tag IS '任务标签关联表，存储任务与标签之间的多对多关系';
COMMENT ON COLUMN t_task_tag.id IS '关联记录唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_tag.task_id IS '任务ID，关联t_task表';
COMMENT ON COLUMN t_task_tag.tag_id IS '标签ID，关联t_tag表';
COMMENT ON COLUMN t_task_tag.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_task_tag.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_tag.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_task_tag.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_team.sql
-- 先删除表（如果存在）

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
ON COLUMN t_team.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_team_member.sql
-- 先删除表（如果存在）

-- 团队成员表
CREATE TABLE t_team_member
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 团队ID，关联t_team表
    team_id    BIGINT                   NOT NULL,

    -- 用户ID，关联t_users表
    user_id    BIGINT                   NOT NULL,

    -- 团队角色ID，关联t_team_role表
    role_id    BIGINT                   NOT NULL,

    -- 加入时间
    joined_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保用户在同一团队中只有一个角色（考虑逻辑删除）
    CONSTRAINT uk_team_member UNIQUE (team_id, user_id, deleted)
);

-- 添加索引
CREATE INDEX idx_team_member_team_id ON t_team_member (team_id);
CREATE INDEX idx_team_member_user_id ON t_team_member (user_id);
CREATE INDEX idx_team_member_role_id ON t_team_member (role_id);
CREATE INDEX idx_team_member_deleted ON t_team_member (deleted);

-- 添加注释
COMMENT
ON TABLE t_team_member IS '团队成员表，存储团队成员关系';
COMMENT
ON COLUMN t_team_member.id IS '团队成员唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team_member.team_id IS '团队ID，关联t_team表';
COMMENT
ON COLUMN t_team_member.user_id IS '用户ID，关联t_users表';
COMMENT
ON COLUMN t_team_member.role_id IS '团队角色ID，关联t_team_role表';
COMMENT
ON COLUMN t_team_member.joined_at IS '加入时间';
COMMENT
ON COLUMN t_team_member.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team_member.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team_member.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team_member.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_team_role.sql
-- 先删除表（如果存在）

-- 团队角色表
CREATE TABLE t_team_role
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id          BIGINT PRIMARY KEY,

    -- 角色名称
    name        VARCHAR(100)             NOT NULL,

    -- 角色描述，可为空
    description TEXT,

    -- 所属团队ID，关联t_team表
    team_id     BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted     SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at  TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version     INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一团队中角色名称不重复（考虑逻辑删除）
    CONSTRAINT uk_team_role_name UNIQUE (team_id, name, deleted)
);

-- 添加索引
CREATE INDEX idx_team_role_team_id ON t_team_role (team_id);
CREATE INDEX idx_team_role_deleted ON t_team_role (deleted);

-- 添加注释
COMMENT
ON TABLE t_team_role IS '团队角色表，存储团队角色信息';
COMMENT
ON COLUMN t_team_role.id IS '团队角色唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team_role.name IS '角色名称';
COMMENT
ON COLUMN t_team_role.description IS '角色描述';
COMMENT
ON COLUMN t_team_role.team_id IS '所属团队ID，关联t_team表';
COMMENT
ON COLUMN t_team_role.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team_role.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_team_role_permission.sql
-- 先删除表（如果存在）

-- 团队角色-权限关联表
CREATE TABLE t_team_role_permission
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id            BIGINT PRIMARY KEY,

    -- 关联的团队角色ID
    team_role_id  BIGINT                   NOT NULL,

    -- 关联的权限ID
    permission_id BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted       SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一角色不会重复关联同一权限（考虑逻辑删除）
    CONSTRAINT uk_team_role_permission UNIQUE (team_role_id, permission_id, deleted)
);

-- 添加索引
CREATE INDEX idx_team_role_permission_role_id ON t_team_role_permission (team_role_id);
CREATE INDEX idx_team_role_permission_permission_id ON t_team_role_permission (permission_id);
CREATE INDEX idx_team_role_permission_deleted ON t_team_role_permission (deleted);

-- 添加注释
COMMENT
ON TABLE t_team_role_permission IS '团队角色-权限关联表，实现团队角色与权限的多对多关联';
COMMENT
ON COLUMN t_team_role_permission.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_team_role_permission.team_role_id IS '关联的团队角色ID';
COMMENT
ON COLUMN t_team_role_permission.permission_id IS '关联的权限ID';
COMMENT
ON COLUMN t_team_role_permission.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_team_role_permission.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_team_role_permission.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_team_role_permission.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_time_entry.sql
-- 先删除表（如果存在）

-- 创建时间记录表
-- 此表用于存储用户在任务上花费的时间记录
CREATE TABLE t_time_entry
(
    -- 时间记录唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id           BIGINT PRIMARY KEY,

    -- 所属任务ID，不允许为空，关联t_task表
    task_id      BIGINT      NOT NULL,

    -- 用户ID，不允许为空，关联t_user表
    user_id      BIGINT      NOT NULL,

    -- 开始时间，不允许为空
    start_time   TIMESTAMPTZ NOT NULL,

    -- 结束时间，可为空（表示时间记录正在进行中）
    end_time     TIMESTAMPTZ,

    -- 持续时间（秒），可为空（如果end_time为空则此字段也为空）
    duration     BIGINT,

    -- 描述，可为空
    description  TEXT,

    -- 计费类型，整数，默认为1（标准计费）
    -- 0=不可计费，1=标准计费，2=折扣计费，3=加急计费，4=固定计费
    billing_type INT         NOT NULL DEFAULT 1,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted      INT         NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at   TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version      INT         NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询时间记录的性能
CREATE INDEX idx_time_entry_task_id ON t_time_entry (task_id);

-- 创建索引：用户ID索引，提高按用户查询时间记录的性能
CREATE INDEX idx_time_entry_user_id ON t_time_entry (user_id);

-- 创建索引：开始时间索引，提高按时间段查询的性能
CREATE INDEX idx_time_entry_start_time ON t_time_entry (start_time);

-- 创建索引：结束时间索引，提高按时间段查询的性能
CREATE INDEX idx_time_entry_end_time ON t_time_entry (end_time);

-- 创建索引：计费类型索引，提高按计费类型查询的性能
CREATE INDEX idx_time_entry_billing_type ON t_time_entry (billing_type);

-- 添加表注释
COMMENT ON TABLE t_time_entry IS '时间记录表，存储用户在任务上花费的时间记录';
COMMENT ON COLUMN t_time_entry.id IS '时间记录唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_time_entry.task_id IS '所属任务ID，关联t_task表';
COMMENT ON COLUMN t_time_entry.user_id IS '用户ID，关联t_user表';
COMMENT ON COLUMN t_time_entry.start_time IS '开始时间';
COMMENT ON COLUMN t_time_entry.end_time IS '结束时间，可为空（表示时间记录正在进行中）';
COMMENT ON COLUMN t_time_entry.duration IS '持续时间（秒），如果end_time为空则此字段也为空';
COMMENT ON COLUMN t_time_entry.description IS '描述';
COMMENT ON COLUMN t_time_entry.billing_type IS '计费类型：0=不可计费，1=标准计费，2=折扣计费，3=加急计费，4=固定计费';
COMMENT ON COLUMN t_time_entry.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_time_entry.created_at IS '记录创建时间';
COMMENT ON COLUMN t_time_entry.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_time_entry.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_time_estimation.sql
-- 先删除表（如果存在）

-- 创建时间估计表
-- 此表用于存储任务的时间估计信息
CREATE TABLE t_time_estimation
(
    -- 时间估计唯一标识，使用BIGINT类型存储TSID格式的分布式ID
    id              BIGINT PRIMARY KEY,

    -- 关联的任务ID，不允许为空，关联t_task表
    task_id         BIGINT           NOT NULL,

    -- 预计完成所需的小时数，不允许为空
    estimated_hours DOUBLE PRECISION NOT NULL,

    -- 估计创建者ID，不允许为空，关联t_user表
    created_by_id   BIGINT           NOT NULL,

    -- 基线类型，例如"初始估计"、"修订估计"等，不允许为空
    baseline_type   VARCHAR(50)      NOT NULL,

    -- 估计理由，记录为什么做出这样的估计，可为空
    justification   TEXT,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted         INT              NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at      TIMESTAMPTZ,

    -- 乐观锁版本号，用于并发控制
    version         INT              NOT NULL DEFAULT 0
);

-- 创建索引：任务ID索引，提高按任务查询时间估计的性能
CREATE INDEX idx_time_estimation_task_id ON t_time_estimation (task_id);

-- 创建索引：创建者ID索引，提高按创建者查询时间估计的性能
CREATE INDEX idx_time_estimation_created_by_id ON t_time_estimation (created_by_id);

-- 创建索引：基线类型索引，提高按基线类型查询的性能
CREATE INDEX idx_time_estimation_baseline_type ON t_time_estimation (baseline_type);

-- 添加表注释
COMMENT ON TABLE t_time_estimation IS '时间估计表，存储任务的时间估计信息';
COMMENT ON COLUMN t_time_estimation.id IS '时间估计唯一标识，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_time_estimation.task_id IS '关联的任务ID，关联t_task表';
COMMENT ON COLUMN t_time_estimation.estimated_hours IS '预计完成所需的小时数';
COMMENT ON COLUMN t_time_estimation.created_by_id IS '估计创建者ID，关联t_user表';
COMMENT ON COLUMN t_time_estimation.baseline_type IS '基线类型，例如"初始估计"、"修订估计"等';
COMMENT ON COLUMN t_time_estimation.justification IS '估计理由，记录为什么做出这样的估计';
COMMENT ON COLUMN t_time_estimation.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_time_estimation.created_at IS '记录创建时间';
COMMENT ON COLUMN t_time_estimation.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_time_estimation.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_user.sql
-- 先删除表（如果存在）

-- 系统用户表
CREATE TABLE t_user
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id            BIGINT PRIMARY KEY,

    -- 用户名，登录时使用，不可重复
    username      VARCHAR(50)              NOT NULL,

    -- 密码的哈希值，不存储明文密码
    password_hash VARCHAR(255)             NOT NULL,

    -- 用户电子邮箱，用于通知和找回密码，可为空；有值时不可重复
    email         VARCHAR(100),

    -- 用户最后登录时间
    last_login    TIMESTAMP WITH TIME ZONE NOT NULL,

    -- 用户状态编码：1表示活跃可用，0表示已停用
    status        SMALLINT                 NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted       SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束
    CONSTRAINT uk_user_username UNIQUE (username, deleted),
    CONSTRAINT uk_user_email UNIQUE (email, deleted)
);

-- 添加索引
CREATE INDEX idx_user_status ON t_user (status);
CREATE INDEX idx_user_deleted ON t_user (deleted);

-- 添加注释
COMMENT
ON TABLE t_user IS '系统用户表，存储所有用户的基本信息和认证信息';
COMMENT
ON COLUMN t_user.id IS '用户唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user.username IS '用户名，登录时使用，不可重复';
COMMENT
ON COLUMN t_user.password_hash IS '密码的哈希值，不存储明文密码';
COMMENT
ON COLUMN t_user.email IS '用户电子邮箱，用于通知和找回密码，可为空；有值时不可重复';
COMMENT
ON COLUMN t_user.last_login IS '用户最后登录时间';
COMMENT
ON COLUMN t_user.status IS '用户状态编码：1表示活跃可用，0表示已停用';
COMMENT
ON COLUMN t_user.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user.version IS '乐观锁版本号，用于并发控制';

-- Source: t_user_oauth.sql
-- 先删除表（如果存在）

-- 用户第三方登录表记录表
CREATE TABLE t_user_oauth
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id            BIGINT PRIMARY KEY,

    -- 关联的用户ID
    user_id       BIGINT                   NOT NULL,

    -- 提供商类型
    provider      SMALLINT                 NOT NULL,

    -- 第三方平台的用户ID
    provider_uid  VARCHAR(255)             NOT NULL,

    -- 访问令牌
    access_token  TEXT,

    -- 刷新令牌
    refresh_token TEXT,

    -- 令牌过期时间
    token_expires TIMESTAMP WITH TIME ZONE,

    -- 存储第三方平台的额外数据（JSONB类型）
    provider_data JSONB,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted       SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at    TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version       INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一用户在同一平台只有一个关联（考虑逻辑删除）
    CONSTRAINT uk_user_oauth UNIQUE (user_id, provider, provider_uid, deleted)
);

-- 添加索引
CREATE INDEX idx_user_oauth_user_id ON t_user_oauth (user_id);
CREATE INDEX idx_user_oauth_provider ON t_user_oauth (provider);
CREATE INDEX idx_user_oauth_deleted ON t_user_oauth (deleted);

-- 添加注释
COMMENT
ON TABLE t_user_oauth IS '用户第三方登录表，存储用户的第三方账号关联信息';
COMMENT
ON COLUMN t_user_oauth.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user_oauth.user_id IS '关联的用户ID';
COMMENT
ON COLUMN t_user_oauth.provider IS '提供商类型，对应OAuthProviderEnum';
COMMENT
ON COLUMN t_user_oauth.provider_uid IS '第三方平台的用户ID';
COMMENT
ON COLUMN t_user_oauth.access_token IS '访问令牌';
COMMENT
ON COLUMN t_user_oauth.refresh_token IS '刷新令牌';
COMMENT
ON COLUMN t_user_oauth.token_expires IS '令牌过期时间';
COMMENT
ON COLUMN t_user_oauth.provider_data IS '存储第三方平台的额外数据';
COMMENT
ON COLUMN t_user_oauth.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user_oauth.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user_oauth.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user_oauth.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_user_profile.sql
-- 先删除表（如果存在）

-- 用户个人资料表记录表
CREATE TABLE t_user_profile
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 关联的用户ID，一对一关系
    user_id    BIGINT                   NOT NULL,

    -- 用户全名，真实姓名
    full_name  VARCHAR(100),

    -- 用户联系电话
    phone      VARCHAR(20),

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保一个用户只有一个资料记录（考虑逻辑删除）
    CONSTRAINT uk_user_profile_user_id UNIQUE (user_id, deleted)
);

-- 添加索引
CREATE INDEX idx_user_profile_deleted ON t_user_profile (deleted);

-- 添加注释
COMMENT
ON TABLE t_user_profile IS '用户个人资料表，存储用户的扩展信息';
COMMENT
ON COLUMN t_user_profile.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user_profile.user_id IS '关联的用户ID，一对一关系';
COMMENT
ON COLUMN t_user_profile.full_name IS '用户全名，真实姓名';
COMMENT
ON COLUMN t_user_profile.phone IS '用户联系电话';
COMMENT
ON COLUMN t_user_profile.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user_profile.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user_profile.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user_profile.version IS '乐观锁版本号，用于并发控制';+
-- Source: t_user_role.sql
-- 先删除表（如果存在）

-- 用户角色关联记表
CREATE TABLE t_user_role
(
    -- 主键，使用 BIGINT 类型存储 TSID 格式的分布式 ID
    id         BIGINT PRIMARY KEY,

    -- 用户ID
    user_id    BIGINT                   NOT NULL,

    -- 角色ID
    role_id    BIGINT                   NOT NULL,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted    SMALLINT                 NOT NULL DEFAULT 0,

    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,

    -- 乐观锁版本号，用于并发控制
    version    INTEGER                  NOT NULL DEFAULT 0,

    -- 添加唯一约束，确保同一用户不会重复关联同一角色（考虑逻辑删除）
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id, deleted)
);

-- 添加索引
CREATE INDEX idx_user_role_user_id ON t_user_role (user_id);
CREATE INDEX idx_user_role_role_id ON t_user_role (role_id);
CREATE INDEX idx_user_role_deleted ON t_user_role (deleted);

-- 添加注释
COMMENT
ON TABLE t_user_role IS '用户角色关联表，实现用户与角色的多对多关联';
COMMENT
ON COLUMN t_user_role.id IS '唯一标识，TSID格式（有序的分布式ID）';
COMMENT
ON COLUMN t_user_role.user_id IS '用户ID';
COMMENT
ON COLUMN t_user_role.role_id IS '角色ID';
COMMENT
ON COLUMN t_user_role.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT
ON COLUMN t_user_role.created_at IS '记录创建时间';
COMMENT
ON COLUMN t_user_role.updated_at IS '记录最后更新时间';
COMMENT
ON COLUMN t_user_role.version IS '乐观锁版本号，用于并发控制';+

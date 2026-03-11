-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_archive_record;

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

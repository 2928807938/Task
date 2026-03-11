-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_document_version;

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

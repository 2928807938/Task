-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_attachment;

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
ON COLUMN t_attachment.version IS '乐观锁版本号，用于并发控制';
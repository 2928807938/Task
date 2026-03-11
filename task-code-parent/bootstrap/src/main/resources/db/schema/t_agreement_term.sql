-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_agreement_term;

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
ON COLUMN t_agreement_term.version IS '乐观锁版本号，用于并发控制';
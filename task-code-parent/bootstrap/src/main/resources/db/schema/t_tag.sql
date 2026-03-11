-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_tag;

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
COMMENT ON COLUMN t_tag.version IS '乐观锁版本号，用于并发控制';
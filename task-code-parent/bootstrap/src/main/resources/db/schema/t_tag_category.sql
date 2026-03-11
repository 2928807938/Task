-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_tag_category;

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
COMMENT ON COLUMN t_tag_category.version IS '乐观锁版本号，用于并发控制';
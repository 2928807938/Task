-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_tag_category_mapping;

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
COMMENT ON COLUMN t_tag_category_mapping.version IS '乐观锁版本号，用于并发控制';
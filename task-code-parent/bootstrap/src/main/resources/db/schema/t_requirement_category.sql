-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_category;

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
COMMENT ON COLUMN t_requirement_category.version IS '版本号，用于乐观锁'; 
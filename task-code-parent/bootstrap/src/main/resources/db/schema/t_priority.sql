-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_priority;

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
ON COLUMN t_priority.color IS '优先级颜色，十六进制颜色代码，例如"#FF0000"表示红色';
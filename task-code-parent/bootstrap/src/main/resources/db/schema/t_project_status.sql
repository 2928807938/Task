-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_status CASCADE;

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

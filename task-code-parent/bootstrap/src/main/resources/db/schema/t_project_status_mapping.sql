-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_status_mapping;

-- 创建项目状态映射表
-- 此表用于存储项目与状态的关联关系
CREATE TABLE t_project_status_mapping (
    -- 记录唯一标识，使用TSID格式（有序的分布式ID）
    id BIGINT PRIMARY KEY,
    
    -- 项目ID，关联t_project表
    project_id BIGINT NOT NULL,
    
    -- 状态ID，关联t_project_status表
    status_id BIGINT NOT NULL,
    
    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted INT NOT NULL DEFAULT 0,
    
    -- 记录创建时间，包含时区信息
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 记录最后更新时间，包含时区信息
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- 乐观锁版本号，用于并发控制
    version INT NOT NULL DEFAULT 0,
    
    -- 不使用外键约束
    -- FOREIGN KEY (project_id) REFERENCES t_project(id),
    -- FOREIGN KEY (status_id) REFERENCES t_project_status(id),
    
    -- 确保每个项目和状态的组合唯一（只针对未删除的记录）
    CONSTRAINT uk_project_status_mapping UNIQUE (project_id, status_id, deleted)
);

-- 创建索引
CREATE INDEX idx_project_status_mapping_project_id ON t_project_status_mapping(project_id) WHERE deleted = 0;
CREATE INDEX idx_project_status_mapping_status_id ON t_project_status_mapping(status_id) WHERE deleted = 0;

-- 添加注释
COMMENT ON TABLE t_project_status_mapping IS '项目状态映射表，存储项目与状态的关联关系';
COMMENT ON COLUMN t_project_status_mapping.id IS '记录唯一标识，TSID格式';
COMMENT ON COLUMN t_project_status_mapping.project_id IS '项目ID，关联t_project表';
COMMENT ON COLUMN t_project_status_mapping.status_id IS '状态ID，关联t_project_status表';
COMMENT ON COLUMN t_project_status_mapping.deleted IS '逻辑删除标志，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_project_status_mapping.created_at IS '记录创建时间';
COMMENT ON COLUMN t_project_status_mapping.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_project_status_mapping.version IS '乐观锁版本号，用于并发控制';

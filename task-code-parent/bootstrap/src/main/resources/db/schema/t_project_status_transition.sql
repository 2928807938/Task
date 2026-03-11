-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_project_status_transition;

-- 项目状态转换表
-- 用于定义项目状态之间的合法转换规则
CREATE TABLE IF NOT EXISTS t_project_status_transition (
    -- 主键ID，使用TSID格式（有序的分布式ID）
    id BIGINT PRIMARY KEY,
    
    -- 项目ID，外键关联t_project表
    project_id BIGINT NOT NULL,
    
    -- 起始状态ID，外键关联t_project_status表
    from_status_id BIGINT NOT NULL,
    
    -- 目标状态ID，外键关联t_project_status表
    to_status_id BIGINT NOT NULL,
    
    -- 事件代码，用于标识触发此转换的事件
    event_code VARCHAR(50) NOT NULL,
    
    -- 转换条件代码，可选，用于定义状态转换的条件
    guard_condition VARCHAR(255),
    
    -- 转换动作代码，可选，用于定义状态转换时执行的动作
    action_code VARCHAR(50),
    
    -- 是否启用，可用于临时禁用某些转换规则
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted INT NOT NULL DEFAULT 0,
    
    -- 记录创建时间
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- 记录最后更新时间
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- 乐观锁版本号，用于并发控制
    version INT NOT NULL DEFAULT 0,
    
    -- 唯一约束：同一项目中的同一起始状态下的事件代码必须唯一
    UNIQUE (project_id, from_status_id, event_code, deleted)
);

-- 添加project_id索引
CREATE INDEX idx_project_status_transition_project_id ON t_project_status_transition(project_id);

-- 添加注释
COMMENT ON TABLE t_project_status_transition IS '项目状态转换表';
COMMENT ON COLUMN t_project_status_transition.id IS '主键ID，TSID格式';
COMMENT ON COLUMN t_project_status_transition.project_id IS '项目ID';
COMMENT ON COLUMN t_project_status_transition.from_status_id IS '起始状态ID';
COMMENT ON COLUMN t_project_status_transition.to_status_id IS '目标状态ID';
COMMENT ON COLUMN t_project_status_transition.event_code IS '事件代码';
COMMENT ON COLUMN t_project_status_transition.guard_condition IS '转换条件代码';
COMMENT ON COLUMN t_project_status_transition.action_code IS '转换动作代码';
COMMENT ON COLUMN t_project_status_transition.is_enabled IS '是否启用';
COMMENT ON COLUMN t_project_status_transition.deleted IS '逻辑删除标志';
COMMENT ON COLUMN t_project_status_transition.created_at IS '记录创建时间';
COMMENT ON COLUMN t_project_status_transition.updated_at IS '记录最后更新时间';
COMMENT ON COLUMN t_project_status_transition.version IS '乐观锁版本号';

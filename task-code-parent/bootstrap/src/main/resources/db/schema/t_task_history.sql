-- 任务历史记录表
-- 记录任务的变更历史，包括状态变更、内容修改等
DROP TABLE IF EXISTS t_task_history;
CREATE TABLE t_task_history (
    -- 主键ID，使用TSID格式（有序的分布式ID）
    id BIGINT PRIMARY KEY,
    
    -- 关联的任务ID
    task_id BIGINT NOT NULL,
    
    -- 操作用户ID
    user_id BIGINT NOT NULL,
    
    -- 操作类型
    -- CREATE: 创建, UPDATE: 更新, DELETE: 删除, ASSIGN: 分配, STATUS_CHANGE: 状态变更
    -- PRIORITY_CHANGE: 优先级变更, DESCRIPTION_CHANGE: 描述变更, TITLE_CHANGE: 标题变更
    -- DUEDATE_CHANGE: 截止日期变更
    operation_type VARCHAR(50) NOT NULL,
    
    -- 修改的字段名
    field_name VARCHAR(100) NOT NULL,
    
    -- 修改前的值（JSON格式）
    old_value TEXT,
    
    -- 修改后的值（JSON格式）
    new_value TEXT,
    
    -- 描述信息
    description VARCHAR(500) NOT NULL,
    
    -- 是否是主任务的修改
    is_main_task BOOLEAN NOT NULL DEFAULT false,

    -- 逻辑删除标志，0表示未删除，1表示已删除
    deleted INT NOT NULL DEFAULT 0,
    
    -- 乐观锁版本号
    version INT NOT NULL DEFAULT 0,

    -- 记录创建时间，使用带时区的时间戳类型
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 记录最后更新时间，使用带时区的时间戳类型，可为空
    updated_at  TIMESTAMPTZ
);

-- 添加说明注释
COMMENT ON TABLE t_task_history IS '任务历史记录表';
COMMENT ON COLUMN t_task_history.id IS '主键ID，TSID格式（有序的分布式ID）';
COMMENT ON COLUMN t_task_history.task_id IS '关联的任务ID';
COMMENT ON COLUMN t_task_history.user_id IS '操作用户ID';
COMMENT ON COLUMN t_task_history.operation_type IS '操作类型（CREATE/UPDATE/DELETE等）';
COMMENT ON COLUMN t_task_history.field_name IS '修改的字段名';
COMMENT ON COLUMN t_task_history.old_value IS '修改前的值（JSON格式）';
COMMENT ON COLUMN t_task_history.new_value IS '修改后的值（JSON格式）';
COMMENT ON COLUMN t_task_history.description IS '描述信息';
COMMENT ON COLUMN t_task_history.is_main_task IS '是否是主任务的修改';
COMMENT ON COLUMN t_task_history.created_at IS '记录创建时间';
COMMENT ON COLUMN t_task_history.updated_at IS '记录最后更新时间';

-- 创建索引提高查询性能
CREATE INDEX idx_task_history_task_id ON t_task_history(task_id);
CREATE INDEX idx_task_history_user_id ON t_task_history(user_id);
CREATE INDEX idx_task_history_created_at ON t_task_history(created_at);

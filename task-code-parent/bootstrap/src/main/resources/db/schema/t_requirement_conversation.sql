-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_conversation;

-- 需求对话列表表
-- 存储需求对话的元数据和关联关系
CREATE TABLE t_requirement_conversation (
    id BIGINT PRIMARY KEY,
    conversation_list_id BIGINT, -- 关联的需求对话列表ID（关联t_requirement_conversation_list表）
    requirement_id BIGINT, -- 关联的需求ID
    title TEXT NOT NULL, -- 对话列表标题
    start_status TEXT, -- 开始状态
    analysis_start_status TEXT, -- 开始分析状态
    analysis_complete_status TEXT, -- 分析完成状态
    requirement_category_id BIGINT, -- 需求分类id
    requirement_priority_id BIGINT, -- 优先级表id
    requirement_workload_id BIGINT, -- 工作量表id
    requirement_task_breakdown_id BIGINT, -- 任务拆分表id
    requirement_completeness_id BIGINT, -- 需求完整度检查表id
    requirement_suggestion_id BIGINT, -- 智能建议表id
    requirement_summary_analysis_id BIGINT, -- 总结分析表id
    root_main_task TEXT, -- 首轮主任务锚点（同会话只写一次）
    current_turn_no INT DEFAULT 0, -- 当前回合号
    latest_task_breakdown_json TEXT, -- 最近一轮任务拆分快照
    requirement_type_json TEXT, -- 需求分类分析快照
    priority_json TEXT, -- 优先级分析快照
    workload_json TEXT, -- 工作量分析快照
    completeness_json TEXT, -- 完整度分析快照
    suggestion_json TEXT, -- 智能建议快照
    analysis_summary_json TEXT, -- 分析摘要快照
    final_summary_json TEXT, -- 分析总结快照
    task_planning_json TEXT, -- 任务规划快照
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
CREATE INDEX idx_t_req_conv_requirement_id ON t_requirement_conversation(requirement_id);
CREATE INDEX idx_t_req_conv_conversation_list_id ON t_requirement_conversation(conversation_list_id);
CREATE INDEX idx_t_req_conv_category_id ON t_requirement_conversation(requirement_category_id);
CREATE INDEX idx_t_req_conv_priority_id ON t_requirement_conversation(requirement_priority_id);
CREATE INDEX idx_t_req_conv_workload_id ON t_requirement_conversation(requirement_workload_id);
CREATE INDEX idx_t_req_conv_task_breakdown_id ON t_requirement_conversation(requirement_task_breakdown_id);
CREATE INDEX idx_t_req_conv_completeness_id ON t_requirement_conversation(requirement_completeness_id);
CREATE INDEX idx_t_req_conv_suggestion_id ON t_requirement_conversation(requirement_suggestion_id);
CREATE INDEX idx_t_req_conv_summary_analysis_id ON t_requirement_conversation(requirement_summary_analysis_id);
CREATE INDEX idx_t_req_conv_current_turn_no ON t_requirement_conversation(current_turn_no);

-- 注释
COMMENT ON TABLE t_requirement_conversation IS '需求对话列表表，用于管理需求对话及其关联的分析数据';
COMMENT ON COLUMN t_requirement_conversation.id IS '主键ID';
COMMENT ON COLUMN t_requirement_conversation.conversation_list_id IS '关联的需求对话列表ID，关联t_requirement_conversation_list表';
COMMENT ON COLUMN t_requirement_conversation.requirement_id IS '关联的需求ID';
COMMENT ON COLUMN t_requirement_conversation.title IS '对话列表标题';
COMMENT ON COLUMN t_requirement_conversation.start_status IS '对话开始状态';
COMMENT ON COLUMN t_requirement_conversation.analysis_start_status IS '分析开始状态';
COMMENT ON COLUMN t_requirement_conversation.analysis_complete_status IS '分析完成状态';
COMMENT ON COLUMN t_requirement_conversation.requirement_category_id IS '关联的需求分类ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_priority_id IS '关联的需求优先级ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_workload_id IS '关联的需求工作量ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_task_breakdown_id IS '关联的需求任务拆分ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_completeness_id IS '关联的需求完整度检查ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_suggestion_id IS '关联的需求智能建议ID';
COMMENT ON COLUMN t_requirement_conversation.requirement_summary_analysis_id IS '关联的需求总结分析ID';
COMMENT ON COLUMN t_requirement_conversation.root_main_task IS '首轮主任务锚点（同会话只写一次）';
COMMENT ON COLUMN t_requirement_conversation.current_turn_no IS '当前回合号';
COMMENT ON COLUMN t_requirement_conversation.latest_task_breakdown_json IS '最近一轮任务拆分快照JSON';
COMMENT ON COLUMN t_requirement_conversation.requirement_type_json IS '需求分类分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.priority_json IS '优先级分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.workload_json IS '工作量分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.completeness_json IS '完整度分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.suggestion_json IS '智能建议分析快照JSON';
COMMENT ON COLUMN t_requirement_conversation.analysis_summary_json IS '分析摘要快照JSON';
COMMENT ON COLUMN t_requirement_conversation.final_summary_json IS '分析总结快照JSON';
COMMENT ON COLUMN t_requirement_conversation.task_planning_json IS '任务规划快照JSON';
COMMENT ON COLUMN t_requirement_conversation.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_conversation.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_conversation.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_conversation.version IS '版本号，用于乐观锁';

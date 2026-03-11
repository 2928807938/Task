-- 先删除表（如果存在）
DROP TABLE IF EXISTS t_requirement_conversation_turn;

-- 需求会话回合表
-- 按回合存储用户输入与回合结束快照
CREATE TABLE t_requirement_conversation_turn (
    id BIGINT PRIMARY KEY,
    conversation_list_id BIGINT NOT NULL, -- 关联的会话ID（t_requirement_conversation_list.id）
    turn_no INT NOT NULL, -- 回合号，从1开始
    user_input TEXT NOT NULL, -- 本轮用户输入
    analysis_start_status TEXT, -- 本轮分析开始状态
    analysis_complete_status TEXT, -- 本轮分析完成状态
    snapshot_json TEXT NOT NULL, -- 回合结束时快照
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

CREATE INDEX idx_t_req_conv_turn_list_id ON t_requirement_conversation_turn(conversation_list_id);
CREATE INDEX idx_t_req_conv_turn_turn_no ON t_requirement_conversation_turn(turn_no);

COMMENT ON TABLE t_requirement_conversation_turn IS '需求会话回合表，记录每轮输入与快照';
COMMENT ON COLUMN t_requirement_conversation_turn.id IS '主键ID';
COMMENT ON COLUMN t_requirement_conversation_turn.conversation_list_id IS '会话ID，关联t_requirement_conversation_list.id';
COMMENT ON COLUMN t_requirement_conversation_turn.turn_no IS '会话内回合号';
COMMENT ON COLUMN t_requirement_conversation_turn.user_input IS '本轮用户输入';
COMMENT ON COLUMN t_requirement_conversation_turn.analysis_start_status IS '本轮分析开始状态';
COMMENT ON COLUMN t_requirement_conversation_turn.analysis_complete_status IS '本轮分析完成状态';
COMMENT ON COLUMN t_requirement_conversation_turn.snapshot_json IS '本轮结束时状态快照JSON';
COMMENT ON COLUMN t_requirement_conversation_turn.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_requirement_conversation_turn.created_at IS '创建时间';
COMMENT ON COLUMN t_requirement_conversation_turn.updated_at IS '更新时间';
COMMENT ON COLUMN t_requirement_conversation_turn.version IS '版本号，用于乐观锁';

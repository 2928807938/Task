-- 先删除表（如果存在）
-- 本表用于记录分析时真正命中的提示词快照，便于审计与回溯。
-- 保存提示词后前端会主动调用冲突检测接口，但冲突检测结果本身当前不单独落库。
DROP TABLE IF EXISTS t_llm_prompt_hit_log;

-- LLM提示词命中日志表
-- 用于记录每次分析实际命中的提示词
CREATE TABLE t_llm_prompt_hit_log (
    id BIGINT PRIMARY KEY,
    analysis_request_id VARCHAR(64) NOT NULL,
    scene_key VARCHAR(64) NOT NULL,
    project_id BIGINT,
    user_id BIGINT,
    hit_prompt_ids_json TEXT,
    final_prompt_preview TEXT,
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
-- uk_t_llm_prompt_hit_log_request_id: 避免同一分析请求重复落日志
-- idx_t_llm_prompt_hit_log_scene: 支持按场景回看命中记录
-- idx_t_llm_prompt_hit_log_project_user: 支持按项目/用户维度审计
CREATE UNIQUE INDEX uk_t_llm_prompt_hit_log_request_id ON t_llm_prompt_hit_log(analysis_request_id, deleted);
CREATE INDEX idx_t_llm_prompt_hit_log_scene ON t_llm_prompt_hit_log(scene_key);
CREATE INDEX idx_t_llm_prompt_hit_log_project_user ON t_llm_prompt_hit_log(project_id, user_id);

-- 注释
COMMENT ON TABLE t_llm_prompt_hit_log IS 'LLM提示词命中日志表，用于记录每次分析实际命中的提示词';
COMMENT ON COLUMN t_llm_prompt_hit_log.id IS '主键ID';
COMMENT ON COLUMN t_llm_prompt_hit_log.analysis_request_id IS '分析请求标识';
COMMENT ON COLUMN t_llm_prompt_hit_log.scene_key IS '分析场景标识';
COMMENT ON COLUMN t_llm_prompt_hit_log.project_id IS '项目ID';
COMMENT ON COLUMN t_llm_prompt_hit_log.user_id IS '用户ID';
COMMENT ON COLUMN t_llm_prompt_hit_log.hit_prompt_ids_json IS '本次命中的提示词ID列表，JSON字符串';
COMMENT ON COLUMN t_llm_prompt_hit_log.final_prompt_preview IS '本次最终拼装后的提示词预览';
COMMENT ON COLUMN t_llm_prompt_hit_log.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_llm_prompt_hit_log.created_at IS '创建时间';
COMMENT ON COLUMN t_llm_prompt_hit_log.updated_at IS '更新时间';
COMMENT ON COLUMN t_llm_prompt_hit_log.version IS '版本号，用于乐观锁';

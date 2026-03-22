-- 先删除表（如果存在）
-- 本表用于承载用户级与项目级提示词配置。
-- 冲突检测接口不会额外落库，而是基于本表中的提示词内容、作用域、场景范围进行实时计算。
DROP TABLE IF EXISTS t_llm_prompt_config;

-- LLM提示词配置表
-- 用于存储用户级或项目级的自然语言提示词
CREATE TABLE t_llm_prompt_config (
    id BIGINT PRIMARY KEY,
    scope_type VARCHAR(32) NOT NULL,
    scope_object_id BIGINT NOT NULL,
    prompt_name VARCHAR(128) NOT NULL,
    prompt_content TEXT NOT NULL,
    all_scene_enabled INT NOT NULL DEFAULT 0,
    scene_keys_json TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ENABLED',
    priority INT NOT NULL DEFAULT 0 CHECK (priority >= 0 AND priority <= 100),
    deleted INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

-- 创建索引以提高查询性能
-- idx_t_llm_prompt_config_scope: 支持按用户或项目快速查询提示词
-- idx_t_llm_prompt_config_status: 支持按状态过滤可用提示词
-- uk_t_llm_prompt_config_scope_name: 保证同一作用域下名称唯一，降低管理歧义
CREATE INDEX idx_t_llm_prompt_config_scope ON t_llm_prompt_config(scope_type, scope_object_id);
CREATE INDEX idx_t_llm_prompt_config_status ON t_llm_prompt_config(status, deleted);
CREATE UNIQUE INDEX uk_t_llm_prompt_config_scope_name ON t_llm_prompt_config(scope_type, scope_object_id, prompt_name, deleted);

-- 注释
COMMENT ON TABLE t_llm_prompt_config IS 'LLM提示词配置表，用于存储用户级或项目级的自然语言提示词';
COMMENT ON COLUMN t_llm_prompt_config.id IS '主键ID';
COMMENT ON COLUMN t_llm_prompt_config.scope_type IS '作用域类型，PROJECT表示项目级，USER表示用户级';
COMMENT ON COLUMN t_llm_prompt_config.scope_object_id IS '作用域对象ID；scope_type=PROJECT时表示projectId，scope_type=USER时表示userId';
COMMENT ON COLUMN t_llm_prompt_config.prompt_name IS '提示词名称，便于用户区分不同用途';
COMMENT ON COLUMN t_llm_prompt_config.prompt_content IS '提示词正文，用户直接输入的自然语言内容';
COMMENT ON COLUMN t_llm_prompt_config.all_scene_enabled IS '是否对全部分析场景生效，0表示否，1表示是';
COMMENT ON COLUMN t_llm_prompt_config.scene_keys_json IS '适用场景JSON字符串；当all_scene_enabled=0时生效，例如["TASK_BREAKDOWN","PRIORITY_ANALYSIS"]';
COMMENT ON COLUMN t_llm_prompt_config.status IS '状态，ENABLED表示启用，DISABLED表示停用';
COMMENT ON COLUMN t_llm_prompt_config.priority IS '优先级，范围0-100，数值越大越靠前';
COMMENT ON COLUMN t_llm_prompt_config.deleted IS '逻辑删除标记，0表示未删除，1表示已删除';
COMMENT ON COLUMN t_llm_prompt_config.created_at IS '创建时间';
COMMENT ON COLUMN t_llm_prompt_config.updated_at IS '更新时间';
COMMENT ON COLUMN t_llm_prompt_config.version IS '版本号，用于乐观锁';

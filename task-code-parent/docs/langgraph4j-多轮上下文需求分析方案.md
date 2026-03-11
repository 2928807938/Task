# LangGraph4j 多轮上下文需求分析方案

## 1. 目标与范围

### 1.1 目标
- 在同一个需求会话内支持多轮输入，后续轮次分析必须带上历史分析结果。
- 保证任务拆分的主任务锚点稳定：`main_task` 始终基于首轮用户输入。
- 在现有架构（`application/domain/infrastructure/web`）上做增量改造，避免推翻现有分析器体系。

### 1.2 范围
- 包含：任务拆分、任务规划、优先级分析、工作量分析、需求完整度检查、智能建议、需求分类、分析摘要、分析总结。
- 不包含：具体代码实现、前端页面交互细节。

---

## 2. 当前实现现状与问题

### 2.1 现状
- 现有分析流程是固定顺序串行执行，分析器主要消费当前 `content`。
- `RequirementAnalysisRequest` 有 `requirementConversationId` 字段，但分析流程未真正使用该字段加载历史上下文。
- `LlmService` 虽定义了 `conversationId` 参数，但上层链路未形成统一的会话状态注入机制。

### 2.2 问题
- 第二轮输入时无法稳定携带第一轮任务拆分结果。
- 第三轮及后续轮次容易出现“主任务锚点漂移”（`main_task` 被上一轮结果覆盖）。
- 当前 `conversationListId` 的复用逻辑更偏“幂等创建”，不适合表达“同会话多回合”。

---

## 3. 核心业务规则（必须落地）

### 3.1 会话与根任务规则
- 同一个 `conversationListId` 代表同一个多轮会话。
- `rootMainTask` 仅在第 1 轮写入一次，后续轮次只读，不可更新。
- 新会话（新的 `conversationListId`）才允许写入新的 `rootMainTask`。

### 3.2 拆分规则
- 第 2/3/... 轮任务拆分时，必须使用：
  - `rootMainTask`（固定主任务）
  - `latestTaskBreakdown`（最近一轮拆分结果）
  - `currentUserInput`（本轮新增输入）
- 输出时强制覆盖：`output.main_task = rootMainTask`。

### 3.3 状态更新规则
- 可更新：`turnNo`、`latestTaskBreakdown`、各分析结果、总结结果、状态字段。
- 不可更新：`rootMainTask`（同会话内只读）。

---

## 4. LangGraph4j 状态模型设计

### 4.1 GraphState（会话级）
- `threadId: String`（建议直接使用 `conversationListId`）
- `conversationListId: Long`
- `turnNo: Int`
- `rootMainTask: String`（首轮写入，后续只读）
- `currentUserInput: String`
- `previousTaskBreakdownJson: String`
- `latestTaskBreakdownJson: String`
- `requirementTypeJson: String`
- `priorityJson: String`
- `workloadJson: String`
- `completenessJson: String`
- `suggestionJson: String`
- `analysisSummaryJson: String`
- `finalSummaryJson: String`
- `taskPlanningJson: String`
- `analysisStartStatus: String`
- `analysisCompleteStatus: String`
- `updatedAt: OffsetDateTime`

### 4.2 回合数据（Turn）
- 每次用户输入都产生一条回合记录，至少包括：
  - `turnNo`
  - `userInput`
  - `snapshotJson`（该回合结束时状态快照）
  - `createdAt`

---

## 5. 图节点编排（建议）

### 5.1 节点顺序
1. `LoadSessionNode`
2. `InitOrContinueNode`
3. `BuildContextNode`
4. `TaskBreakdownNode`
5. `PriorityNode`
6. `WorkloadNode`
7. `CompletenessNode`
8. `SuggestionNode`
9. `RequirementTypeNode`
10. `AnalysisSummaryNode`
11. `FinalSummaryNode`
12. `TaskPlanningNode`
13. `PersistTurnNode`
14. `EmitNode`

### 5.2 节点职责要点
- `LoadSessionNode`：按 `conversationListId` 读取会话当前状态和最近回合。
- `InitOrContinueNode`：
  - 若 `turnNo == 0`：写入 `rootMainTask = currentUserInput`
  - 若 `turnNo > 0`：禁止改写 `rootMainTask`
- `BuildContextNode`：构建统一 `inputs`，至少包含：
  - `root_main_task`
  - `previous_task_breakdown`
  - `current_user_input`
  - `previous_final_summary`（可选）
- `TaskBreakdownNode`：执行后强制修正 `main_task = rootMainTask`。
- `PersistTurnNode`：保存回合记录并更新会话快照指针。

---

## 6. 数据持久化改造建议

### 6.1 新增/调整字段建议
- 在会话主表增加（或在会话扩展表存）：
  - `root_main_task`
  - `root_task_breakdown_id`
  - `latest_task_breakdown_id`
  - `current_turn_no`

### 6.2 新增回合表建议
- `t_requirement_conversation_turn`
  - `id`
  - `conversation_list_id`
  - `turn_no`
  - `user_input`
  - `analysis_start_status`
  - `analysis_complete_status`
  - `snapshot_json`
  - `created_at`
  - `updated_at`

### 6.3 设计原则
- `t_requirement_conversation` 存“当前快照”。
- `turn` 表存“历史回放”。
- 查询最新态走快照，审计追溯走回合表。

---

## 7. 接口改造建议

### 7.1 分析接口
- 建议将分析入口改为 `POST`（避免 `GET` 长文本与上下文扩展限制）。
- 请求体建议至少包含：
  - `conversationListId`
  - `content`
  - `projectId`

### 7.2 响应字段
- 流式结果建议附带：
  - `conversationListId`
  - `turnNo`
  - `isFirstTurn`
  - `rootMainTask`
  - `resultType`
  - `content`

### 7.3 会话生命周期
- 第一次分析前先创建 `conversationListId`。
- 后续轮次复用同一个 `conversationListId`。
- 只有用户明确“新建需求会话”时才创建新 ID。

---

## 8. 三轮示例（验证 root 不漂移）

### 8.1 第 1 轮
- 输入：`A`
- 写入：`rootMainTask = A`
- 产出：`latestTaskBreakdown.main_task = A`

### 8.2 第 2 轮
- 输入：`B`
- 读取：`rootMainTask = A`、`latestTaskBreakdown = round1`
- 产出：`latestTaskBreakdown.main_task = A`（不是 B）

### 8.3 第 3 轮
- 输入：`C`
- 读取：`rootMainTask = A`、`latestTaskBreakdown = round2`
- 产出：`latestTaskBreakdown.main_task = A`（仍不是 B/C）

结论：同会话内 `rootMainTask` 永远是首轮输入 `A`。

### 8.4 真实业务示例（微信登录场景）

#### 会话前提
- `conversationListId = 90001`
- 会话刚创建，`turnNo = 0`

#### 第 1 轮
- 用户输入：`微信登录`
- 状态变化：
  - `turnNo: 0 -> 1`
  - `rootMainTask = "微信登录"`（首次写入）
  - `latestTaskBreakdown` 生成初版
- 任务拆分示例：
  - `main_task = "微信登录"`
  - `sub_tasks` 包含：
    - `T1: 接入微信 OAuth 登录流程`
    - `T2: 登录态管理与 token 下发`
    - `T3: 登录页交互与错误提示`

#### 第 2 轮
- 用户输入：`T1范围只有pc端`
- 状态变化：
  - `turnNo: 1 -> 2`
  - `rootMainTask` 保持不变，仍为 `"微信登录"`
  - 在 `latestTaskBreakdown` 中增量修订 `T1`
- 任务拆分示例：
  - `main_task = "微信登录"`（强制保持 root）
  - `T1` 更新为：`接入微信 OAuth 登录流程（仅 PC 端）`
  - 其他任务（如 `T2/T3`）可保持不变或做联动微调

#### 第 3 轮
- 用户输入：`增加一个T10,可以使用用户名和密码登录，但是要增加一个防撞库`
- 状态变化：
  - `turnNo: 2 -> 3`
  - `rootMainTask` 保持不变，仍为 `"微信登录"`
  - 在 `latestTaskBreakdown` 中追加新任务 `T10`
- 任务拆分示例：
  - `main_task = "微信登录"`（仍固定）
  - 新增 `T10: 用户名密码登录 + 防撞库策略`
  - `T10` 可进一步拆解为：
    - `T10-1: 用户名密码登录接口与校验`
    - `T10-2: 防撞库能力（限流、失败阈值、风险拦截/二次验证）`

#### 示例结论
- 三轮下来 `rootMainTask` 始终是第一轮输入 `微信登录`。
- 第二轮是对既有任务 `T1` 的范围约束修订。
- 第三轮是新增增量任务 `T10`，而不是重置主任务。

---

## 9. 落地步骤（建议顺序）

1. 定义 LangGraph4j `GraphState` 与节点接口。
2. 接入会话快照加载与回合写入。
3. 改造分析器入参，统一改为消费 `inputs`（而不是仅 `content`）。
4. 在任务拆分节点加“主任务锚点强制覆盖”。
5. 调整会话创建/复用逻辑，支持同会话多回合。
6. 补充回归测试：首轮/二轮/三轮、跨会话隔离、异常恢复。

---

## 10. 验收标准

- 同一 `conversationListId` 连续 3 轮输入后，`rootMainTask` 不发生变化。
- 第 2/3 轮分析上下文中可检索到上一轮任务拆分结果。
- 第 2/3 轮任务拆分输出的 `main_task` 与首轮输入一致。
- 历史回合可回放，当前快照可快速查询。
- 任一分析节点失败时，回合状态可观测（开始/完成/失败）且不污染 `rootMainTask`。

---

## 11. 风险与规避

- 风险：模型返回覆盖 `main_task`。
  - 规避：服务端在落库前强制覆盖为 `rootMainTask`。
- 风险：同一个 `conversationListId` 被并发请求。
  - 规避：按会话维度加串行化处理或乐观锁校验 `turnNo`。
- 风险：上下文过长导致总结超时。
  - 规避：沿用现有“分析摘要”压缩步骤，再进入综合总结。

---

## 12. 结论

该方案的本质是：将“首轮主任务”从模型输出中抽离为会话级强约束数据，并通过 LangGraph4j 管理多轮状态流转。这样可以同时满足：
- 多轮上下文持续增强；
- 任务拆分主任务不漂移；
- 与现有分析器体系平滑融合。

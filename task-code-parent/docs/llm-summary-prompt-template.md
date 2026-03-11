# LLM智能摘要提示词模板

## 文档说明

本文档包含用于分析结果智能摘要的完整LLM提示词模板。

**文件位置:** `infrastructure/src/main/kotlin/com/task/infrastructure/llm/prompt/XmlWorkflowPromptProvider.kt`

---

## 完整提示词模板

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow>
    <scene key="分析摘要">
        <system>
你是一个专业的需求分析结果摘要助手。你的任务是对需求分析结果进行智能压缩，在保留关键信息的前提下，大幅减少文本长度，以便后续的综合分析处理。

## 摘要原则

1. **保留核心信息** - 关键结论、数值、枚举值必须完整保留
2. **压缩冗长描述** - 将详细分析压缩为简洁要点
3. **保持核心结构** - 除明确标记为丢弃的字段外，其他字段名称和层级保持一致
4. **丢弃UI元素** - 图标、颜色等前端展示信息可以丢弃
5. **合并重复内容** - 如果多个字段表达相似含义，合并为一个
6. **语义优先于字数** - 字段字数限制是软约束，语义一致是硬约束

## 分析类型: {{analysis_type}}

### TASK_BREAKDOWN (任务拆分) 处理规则

如果分析类型是 TASK_BREAKDOWN，请按以下规则处理：

- ✅ `main_task`: **原文保留**
- ⚠️ `sub_tasks[].description`: **压缩至50字以内** - 提取关键动作和目标
- ✅ `sub_tasks[].dependency`: **原文保留**
- ✅ `sub_tasks[].priority`: **原文保留**
- ✅ `sub_tasks[].parallel_group`: **原文保留**
- ✅ `parallelism_score`: **原文保留**
- ⚠️ `parallel_execution_tips`: **压缩至100字以内**

### PRIORITY (优先级分析) 处理规则

如果分析类型是 PRIORITY，请按以下规则处理：

- ✅ `priority.level`: **原文保留**
- ✅ `priority.score`: **原文保留**
- ⚠️ `priority.analysis`: **压缩至80字以内**
- ⚠️ `scheduling.recommendation`: **压缩至80字以内**
- ⚠️ `factors.difficulty`: **压缩至30字以内**
- ⚠️ `factors.resourceMatch`: **压缩至30字以内**
- ⚠️ `factors.dependencies`: **压缩至30字以内**
- ❌ `justification`: **完全丢弃**

### WORKLOAD (工作量评估) 处理规则

如果分析类型是 WORKLOAD，请按以下规则处理：

- ✅ **所有字段原文保留** - 无需压缩

### COMPLETENESS (完整度检查) 处理规则

如果分析类型是 COMPLETENESS，请按以下规则处理：

- ✅ `overall_completeness`: **原文保留**
- ⚠️ `aspects[]`: **只保留completeness最低的5个** - 按completeness升序排序后取前5个
- ⚠️ `optimization_suggestions[]`: **只保留前3条** - 每条content压缩至30字以内
- ❌ `optimization_suggestions[].icon`: **丢弃**

### SUGGESTION (智能建议) 处理规则

如果分析类型是 SUGGESTION，请按以下规则处理：

- ⚠️ `suggestions[]`: **只保留前5条**
- ✅ `suggestions[].type`: **原文保留**
- ✅ `suggestions[].title`: **原文保留**
- ❌ `suggestions[].icon`: **丢弃**
- ❌ `suggestions[].color`: **丢弃**
- ⚠️ `suggestions[].description`: **压缩至40字以内**

### REQUIREMENT_TYPE (需求类型分类) 处理规则

如果分析类型是 REQUIREMENT_TYPE，请按以下规则处理：

- ✅ `tags[]`: **原文保留**
- ❌ `colors[]`: **完全丢弃**

## 语义保真约束（必须执行）

对所有“压缩字段”，必须满足：

1. **关键要素不丢失** - 保留动作、对象、数字、时间、条件、否定词（如“必须/不得/仅当”）
2. **结论方向不改变** - 不能把“高优先级”压成“中优先级”，不能把风险结论改为机会结论
3. **专有名词不改写** - 技术名词、模块名、接口名、指标名保持原意
4. **字段内语义完整** - 不得只剩关键词堆砌，必须是可理解短句

压缩字段的最小语义槽位：

- `sub_tasks[].description`: 动作 + 对象 + 关键约束/目标
- `parallel_execution_tips`: 可并行项 + 前置条件/依赖
- `priority.analysis`: 优先级结论 + 核心原因
- `scheduling.recommendation`: 排期建议 + 时间范围
- `factors.difficulty/resourceMatch/dependencies`: 判断结论 + 关键依据
- `optimization_suggestions[].content`: 建议动作 + 预期改进点
- `suggestions[].description`: 建议动作 + 收益/风险

## 输出要求

1. **必须输出有效的JSON** - 严格遵循JSON格式规范
2. **保持核心结构** - 除规则明确丢弃字段外，字段名称和嵌套层级不变
3. **中文输出** - 所有文本内容使用中文
4. **无额外说明** - 只输出JSON，不要添加任何解释性文字
5. **Token预算** - 输出不超过 {{token_budget}} tokens
6. **语义一致性自检** - 输出前逐字段检查：压缩字段与原文语义一致，不一致则重写该字段
7. **冲突处理优先级** - 当“字数限制”与“语义保真”冲突时，优先语义保真

## 压缩技巧

1. **去除冗余词汇** - 删除"的"、"了"、"等"等助词
2. **使用简洁表达** - "实现用户注册功能" → "实现注册"
3. **保留关键信息** - 动词、名词、数字必须保留
4. **使用顿号分隔** - "A、B、C" 比 "A和B以及C" 更简洁
5. **删除示例说明** - 如"例如"、"比如"后的内容可以删除
6. **先抽取再压缩** - 先提取关键语义槽位，再做短句压缩，避免漏义

        </system>
        <user>
请对以下分析结果进行智能摘要：

{{raw_analysis_result}}
        </user>
    </scene>
</workflow>
```

---

## 使用示例

### 示例1: 任务拆分摘要

**输入:**
```json
{
  "main_task": "开发用户认证系统",
  "sub_tasks": [
    {
      "description": "设计并实现用户注册功能，包括邮箱验证、密码强度检查、验证码机制、防重复注册逻辑，以及注册成功后的欢迎邮件发送功能",
      "dependency": [],
      "priority": 3,
      "parallel_group": "auth_core"
    }
  ],
  "parallelism_score": 75,
  "parallel_execution_tips": "认证核心模块和UI界面可以并行开发，但需要先定义好API接口规范。数据库设计和后端逻辑可以同步进行，前端可以使用Mock数据先行开发界面。"
}
```

**LLM调用参数:**
```kotlin
val inputs = mapOf(
    "analysis_type" to "TASK_BREAKDOWN",
    "raw_analysis_result" to rawJson,
    "token_budget" to 400
)

llmService.generateText(
    content = rawJson,
    apiKey = "分析摘要",
    inputs = inputs
)
```

**输出:**
```json
{
  "main_task": "开发用户认证系统",
  "sub_tasks": [
    {
      "description": "实现用户注册：邮箱验证、密码检查、验证码、防重复、欢迎邮件",
      "dependency": [],
      "priority": 3,
      "parallel_group": "auth_core"
    }
  ],
  "parallelism_score": 75,
  "parallel_execution_tips": "认证核心与UI可并行，需先定义API。数据库与后端同步，前端用Mock数据。"
}
```

---

### 示例2: 优先级分析摘要

**输入:**
```json
{
  "priority": {
    "level": "高",
    "score": 85,
    "analysis": "该需求涉及核心业务流程，直接影响用户体验和系统安全性。从业务价值角度看，用户认证是系统的基础功能，必须优先实现。"
  },
  "scheduling": {
    "recommendation": "建议在第一个迭代周期内完成，作为系统的基础模块。预计需要2-3周时间。"
  },
  "factors": {
    "difficulty": "中等难度。技术栈成熟，有现成的框架支持。",
    "resourceMatch": "团队具备相关技术能力，有Spring Security经验。",
    "dependencies": "无前置依赖，但会被其他模块依赖。"
  },
  "justification": "综合考虑业务价值、技术依赖和资源情况，该需求应作为最高优先级处理。"
}
```

**输出:**
```json
{
  "priority": {
    "level": "高",
    "score": 85,
    "analysis": "核心业务功能，影响用户体验和安全，是系统基础。"
  },
  "scheduling": {
    "recommendation": "第一迭代完成，需2-3周。"
  },
  "factors": {
    "difficulty": "中等，框架成熟。",
    "resourceMatch": "团队有Spring Security经验。",
    "dependencies": "无前置依赖，是其他模块基础。"
  }
}
```

**注意:** `justification` 字段被完全丢弃。

---

### 示例3: 完整度检查摘要

**输入:**
```json
{
  "overall_completeness": "75%",
  "aspects": [
    {"name": "功能需求", "completeness": "90%"},
    {"name": "性能需求", "completeness": "60%"},
    {"name": "安全需求", "completeness": "70%"},
    {"name": "用户体验", "completeness": "50%"},
    {"name": "可维护性", "completeness": "65%"},
    {"name": "可扩展性", "completeness": "55%"},
    {"name": "文档完整性", "completeness": "40%"}
  ],
  "optimization_suggestions": [
    {"icon": "💡", "content": "建议补充详细的性能指标要求，包括响应时间、并发用户数、吞吐量等具体数值。"},
    {"icon": "🔒", "content": "需要明确安全认证方案，包括加密算法、会话管理、权限控制等细节。"},
    {"icon": "📝", "content": "建议完善技术文档，包括架构设计、接口文档、部署文档等。"}
  ]
}
```

**输出:**
```json
{
  "overall_completeness": "75%",
  "aspects": [
    {"name": "文档完整性", "completeness": "40%"},
    {"name": "用户体验", "completeness": "50%"},
    {"name": "可扩展性", "completeness": "55%"},
    {"name": "性能需求", "completeness": "60%"},
    {"name": "可维护性", "completeness": "65%"}
  ],
  "optimization_suggestions": [
    {"content": "补充性能指标：响应时间、并发数、吞吐量"},
    {"content": "明确安全方案：加密、会话、权限"},
    {"content": "完善技术文档：架构、接口、部署"}
  ]
}
```

**注意:**
- `aspects` 只保留了completeness最低的5个
- `optimization_suggestions` 只保留了前3条，且丢弃了icon字段
- 每条建议的content都被压缩至30字以内

---

## 配置说明

### 场景键配置

在 `LlmServiceImpl.kt` 中添加场景键：

```kotlin
private val jsonStrictSceneKeys = setOf(
    "需求分类",
    "优先级分析",
    "工作量分析",
    "任务拆分",
    "需求完整度检查",
    "智能建议",
    "分析总结",
    "任务规划",
    "分析摘要"  // 新增
)

private val mirrorSystemPromptSceneKeys = setOf(
    "任务拆分",
    "任务规划",
    "优先级分析",
    "工作量分析",
    "需求完整度检查",
    "智能建议",
    "需求分类",
    "分析总结",
    "分析摘要"  // 新增
)
```

### 提示词代码位置

摘要提示词采用内置方式维护在 `XmlWorkflowPromptProvider.kt` 中，不再新增 `analysis-summary.xml` 文件。

```kotlin
// XmlWorkflowPromptProvider.kt
private val analysisSummarySystemPrompt = """...""".trimIndent()

private val builtInSystemPrompts = mapOf(
    // ...
    normalizeKey("分析摘要") to analysisSummarySystemPrompt
)
```

---

## 测试验证

### 单元测试示例

```kotlin
@Test
fun `should summarize task breakdown correctly`() {
    val rawResult = """
    {
      "main_task": "开发用户认证系统",
      "sub_tasks": [
        {
          "description": "设计并实现用户注册功能，包括邮箱验证、密码强度检查、验证码机制",
          "dependency": [],
          "priority": 3,
          "parallel_group": "auth_core"
        }
      ],
      "parallelism_score": 75,
      "parallel_execution_tips": "认证核心模块和UI界面可以并行开发"
    }
    """.trimIndent()

    val summary = summarizer.summarizeSingleResult("TASK_BREAKDOWN", rawResult)
        .block()

    val json = parseJson(summary)
    assertThat(json["main_task"]).isEqualTo("开发用户认证系统")
    assertThat(json["sub_tasks"][0]["description"].length).isLessThan(50)
}
```

---

## 注意事项

1. **Token预算** - 确保输出不超过指定的token_budget
2. **JSON格式** - 输出必须是有效的JSON，不能有额外文字
3. **字段保留** - 除规则明确丢弃字段外，即使某个字段为空也要保留（值为空字符串或空数组）
4. **中文输出** - 所有文本内容必须是中文
5. **结构一致** - 除规则明确丢弃字段外，输出JSON结构与输入保持一致

---

**文档结束**

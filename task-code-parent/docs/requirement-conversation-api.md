# 需求对话列表 API 接口文档

## 基础信息

**Base URL**: `/api/client/requirement-conversation`

**认证方式**: JWT Token (请在请求头中添加 `Authorization: Bearer {token}`)

**响应格式**: 所有接口返回统一的 `ApiResponse` 格式

```json
{
  "success": true,
  "data": {},
  "code": "200",
  "message": null,
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

---

## 接口列表

### 1. 获取最近30天的需求对话列表

获取当前用户最近30天创建的需求对话列表简要信息。

**请求信息**

- **URL**: `/api/client/requirement-conversation/recent`
- **Method**: `GET`
- **Content-Type**: `application/json`

**请求参数**: 无

**响应示例**

```json
[
  {
    "id": 1,
    "title": "用户登录功能优化",
    "requirementCategoryId": 10,
    "tags": ["功能优化", "用户体验"],
    "colors": ["#FF5733", "#33FF57"],
    "createdAt": "2024-03-01T10:30:00+08:00"
  },
  {
    "id": 2,
    "title": "支付模块重构",
    "requirementCategoryId": 11,
    "tags": ["重构", "支付"],
    "colors": ["#3357FF", "#FF33A1"],
    "createdAt": "2024-02-28T14:20:00+08:00"
  }
]
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 对话列表唯一标识 |
| title | String | 对话列表标题 |
| requirementCategoryId | Long | 需求分类ID（可为null） |
| tags | Array<String> | 标签数组 |
| colors | Array<String> | 标签对应的颜色数组（十六进制颜色代码） |
| createdAt | String | 创建时间（ISO 8601格式） |

---

### 2. 根据ID获取需求对话列表详情

获取指定ID的需求对话列表完整详细信息，包括所有关联的分析数据。

**请求信息**

- **URL**: `/api/client/requirement-conversation/{id}`
- **Method**: `GET`
- **Content-Type**: `application/json`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 需求对话列表ID |

**请求示例**

```
GET /api/client/requirement-conversation/1
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "用户登录功能优化",
    "startStatus": "COMPLETED",
    "analysisStartStatus": "COMPLETED",
    "analysisCompleteStatus": "SUCCESS",
    "createdAt": "2024-03-01T10:30:00+08:00",
    "updatedAt": "2024-03-01T11:45:00+08:00",

    "requirementCategoryId": 10,
    "categoryData": {
      "tags": ["功能优化", "用户体验"],
      "colors": ["#FF5733", "#33FF57"]
    },

    "requirementPriorityId": 20,
    "priorityData": {
      "level": "HIGH",
      "score": 85,
      "analysis": "该需求对用户体验影响较大，建议优先处理",
      "recommendation": "CURRENT_ITERATION",
      "factors": {
        "difficulty": "中等",
        "resourceMatch": "团队具备相关经验",
        "dependencies": "依赖用户认证模块"
      },
      "justification": "当前迭代有足够资源，且用户反馈强烈"
    },

    "requirementWorkloadId": 30,
    "workloadData": {
      "optimistic": "3人天",
      "mostLikely": "5人天",
      "pessimistic": "8人天",
      "expected": "5.5人天",
      "standardDeviation": "0.83人天"
    },

    "requirementTaskBreakdownId": 40,
    "taskBreakdownData": {
      "mainTask": "用户登录功能优化",
      "subTasks": [
        {
          "id": "T1",
          "description": "优化登录界面UI",
          "dependency": [],
          "priority": "高",
          "parallelGroup": "G1"
        },
        {
          "id": "T2",
          "description": "实现记住密码功能",
          "dependency": ["T1"],
          "priority": "中",
          "parallelGroup": "G2"
        }
      ],
      "parallelismScore": 70,
      "parallelExecutionTips": "UI优化和后端逻辑可以并行开发"
    },

    "requirementCompletenessId": 50,
    "completenessData": {
      "overallCompleteness": "85%",
      "aspects": [
        {
          "name": "功能描述",
          "completeness": "90%"
        },
        {
          "name": "验收标准",
          "completeness": "80%"
        }
      ],
      "optimizationSuggestions": [
        {
          "icon": "💡",
          "content": "建议补充异常场景的处理说明"
        }
      ]
    },

    "requirementSuggestionId": 60,
    "suggestionData": {
      "suggestions": [
        {
          "type": "timePlanning",
          "title": "时间规划建议",
          "icon": "⏰",
          "color": "#4CAF50",
          "description": "建议在2周内完成开发和测试"
        }
      ]
    },

    "requirementSummaryAnalysisId": 70,
    "summaryAnalysisData": {
      "summary": {
        "title": "用户登录功能优化",
        "overview": "优化现有登录流程，提升用户体验",
        "keyPoints": ["简化登录步骤", "增加记住密码功能"],
        "challenges": ["需要兼容旧版本"],
        "opportunities": ["提升用户留存率"]
      },
      "taskArrangement": {
        "phases": [
          {
            "name": "需求分析",
            "description": "详细分析用户需求",
            "estimatedWorkload": "1人天",
            "suggestedTimeframe": "第1天",
            "tasks": [
              {
                "name": "用户调研",
                "priority": "高",
                "estimatedWorkload": "0.5人天",
                "dependencies": [],
                "assignmentSuggestion": "产品经理"
              }
            ]
          }
        ],
        "resourceRecommendations": {
          "personnel": ["前端工程师", "后端工程师"],
          "skills": ["React", "Spring Boot"],
          "tools": ["Figma", "Postman"]
        },
        "riskManagement": [
          {
            "risk": "兼容性问题",
            "impact": "中",
            "mitigation": "充分测试各版本"
          }
        ]
      }
    }
  },
  "code": "200",
  "message": null,
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

**响应字段说明**

详细字段说明请参考下方的"数据模型"章节。

---

### 3. 创建需求对话列表

创建一个新的需求对话列表，包含完整的需求分析数据。

**请求信息**

- **URL**: `/api/client/requirement-conversation/create`
- **Method**: `POST`
- **Content-Type**: `application/json`

**请求体参数**

```json
{
  "title": "用户登录功能优化",
  "requirementCategory": {
    "tags": ["功能优化", "用户体验"],
    "colors": ["#FF5733", "#33FF57"]
  },
  "priorityAnalysis": {
    "priority": {
      "level": "HIGH",
      "score": 85,
      "analysis": "该需求对用户体验影响较大，建议优先处理"
    },
    "scheduling": {
      "recommendation": "CURRENT_ITERATION",
      "factors": {
        "difficulty": "中等",
        "resourceMatch": "团队具备相关经验",
        "dependencies": "依赖用户认证模块"
      },
      "justification": "当前迭代有足够资源，且用户反馈强烈"
    }
  },
  "workloadEstimation": {
    "optimistic": "3人天",
    "most_likely": "5人天",
    "pessimistic": "8人天",
    "expected": "5.5人天",
    "standard_deviation": "0.83人天"
  },
  "taskBreakdown": {
    "main_task": "用户登录功能优化",
    "sub_tasks": [
      {
        "id": "T1",
        "description": "优化登录界面UI",
        "dependency": [],
        "priority": "高",
        "parallel_group": "G1"
      },
      {
        "id": "T2",
        "description": "实现记住密码功能",
        "dependency": ["T1"],
        "priority": "中",
        "parallel_group": "G2"
      }
    ],
    "parallelism_score": 70,
    "parallel_execution_tips": "UI优化和后端逻辑可以并行开发"
  },
  "requirementCompleteness": {
    "overallCompleteness": "85%",
    "aspects": [
      {
        "name": "功能描述",
        "completeness": "90%"
      },
      {
        "name": "验收标准",
        "completeness": "80%"
      }
    ],
    "optimizationSuggestions": [
      {
        "icon": "💡",
        "content": "建议补充异常场景的处理说明"
      }
    ]
  },
  "requirementSuggestions": {
    "suggestions": [
      {
        "type": "timePlanning",
        "title": "时间规划建议",
        "icon": "⏰",
        "color": "#4CAF50",
        "description": "建议在2周内完成开发和测试"
      }
    ]
  },
  "requirementAnalysisSummary": {
    "summary": {
      "title": "用户登录功能优化",
      "overview": "优化现有登录流程，提升用户体验",
      "keyPoints": ["简化登录步骤", "增加记住密码功能"],
      "challenges": ["需要兼容旧版本"],
      "opportunities": ["提升用户留存率"]
    },
    "taskArrangement": {
      "phases": [
        {
          "name": "需求分析",
          "description": "详细分析用户需求",
          "estimatedWorkload": "1人天",
          "suggestedTimeframe": "第1天",
          "tasks": [
            {
              "name": "用户调研",
              "priority": "高",
              "estimatedWorkload": "0.5人天",
              "dependencies": [],
              "assignmentSuggestion": "产品经理"
            }
          ]
        }
      ],
      "resourceRecommendations": {
        "personnel": ["前端工程师", "后端工程师"],
        "skills": ["React", "Spring Boot"],
        "tools": ["Figma", "Postman"]
      },
      "riskManagement": [
        {
          "risk": "兼容性问题",
          "impact": "中",
          "mitigation": "充分测试各版本"
        }
      ]
    }
  }
}
```

**响应示例**

```json
{
  "success": true,
  "data": 123,
  "code": "200",
  "message": null,
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| data | Long | 创建成功后返回的需求对话列表ID |

---

### 4. 删除需求对话列表

删除指定ID的需求对话列表。

**请求信息**

- **URL**: `/api/client/requirement-conversation/{id}`
- **Method**: `POST`
- **Content-Type**: `application/json`

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 需求对话列表ID |

**请求示例**

```
POST /api/client/requirement-conversation/1
```

**响应示例**

```json
{
  "success": true,
  "data": null,
  "code": "200",
  "message": null,
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

---

## 数据模型

### RequirementCategory - 需求分类

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tags | Array<String> | 是 | 需求标签列表 |
| colors | Array<String> | 是 | 标签对应的颜色列表（十六进制颜色代码） |

### PriorityAnalysis - 优先级分析

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| priority | Priority | 是 | 优先级评估 |
| scheduling | Scheduling | 是 | 排期建议 |

#### Priority - 优先级评估

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| level | String | 是 | 优先级级别（如：HIGH、MEDIUM、LOW） |
| score | Integer | 是 | 优先级评分（0-100） |
| analysis | String | 是 | 优先级评估理由 |

#### Scheduling - 排期建议

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| recommendation | String | 是 | 建议排期（CURRENT_ITERATION/NEXT_ITERATION/FUTURE_PLANNING） |
| factors | SchedulingFactors | 是 | 排期因素分析 |
| justification | String | 是 | 排期建议理由 |

#### SchedulingFactors - 排期因素

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| difficulty | String | 是 | 实施难度分析 |
| resourceMatch | String | 是 | 资源匹配情况 |
| dependencies | String | 是 | 依赖关系分析 |

### WorkloadEstimation - 工作量估算

基于PERT（项目评估和审查技术）方法的工作量估算。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| optimistic | String | 是 | 乐观估计（最小工作量） |
| most_likely | String | 是 | 最可能估计 |
| pessimistic | String | 是 | 悲观估计（最大工作量） |
| expected | String | 是 | 期望工作量（PERT公式计算结果） |
| standard_deviation | String | 是 | 标准偏差 |

### TaskBreakdown - 任务拆分

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| main_task | String | 是 | 主任务名称 |
| sub_tasks | Array<SubTask> | 是 | 子任务列表 |
| parallelism_score | Integer | 是 | 并行度评分（0-100） |
| parallel_execution_tips | String | 是 | 并行执行建议 |

#### SubTask - 子任务

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 子任务标识符 |
| description | String | 是 | 子任务描述 |
| dependency | Array<String> | 否 | 依赖的其他子任务ID列表 |
| priority | String | 是 | 优先级（高/中/低） |
| parallel_group | String | 是 | 并行组标识 |

### RequirementCompleteness - 需求完整度检查

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| overallCompleteness | String | 是 | 总体完整度百分比 |
| aspects | Array<RequirementAspect> | 是 | 各方面的完整度评估 |
| optimizationSuggestions | Array<OptimizationSuggestion> | 是 | 优化建议列表 |

#### RequirementAspect - 需求方面评估

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 方面名称 |
| completeness | String | 是 | 完整度百分比 |

#### OptimizationSuggestion - 优化建议

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| icon | String | 是 | 图标（Emoji） |
| content | String | 是 | 建议内容 |

### RequirementSuggestions - 智能建议集

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| suggestions | Array<RequirementSuggestion> | 是 | 建议列表 |

#### RequirementSuggestion - 智能建议

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | String | 是 | 建议类型（如：timePlanning、resourceAllocation） |
| title | String | 是 | 建议标题 |
| icon | String | 是 | 图标（Emoji或图标代码） |
| color | String | 是 | 背景色（十六进制颜色代码） |
| description | String | 是 | 建议详细描述 |

### RequirementAnalysisSummary - 需求分析总结

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| summary | RequirementSummary | 是 | 需求总结 |
| taskArrangement | TaskArrangement | 是 | 任务安排 |

#### RequirementSummary - 需求总结

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | String | 是 | 需求标题 |
| overview | String | 是 | 总体概述 |
| keyPoints | Array<String> | 是 | 关键要点 |
| challenges | Array<String> | 是 | 挑战 |
| opportunities | Array<String> | 是 | 机会 |

#### TaskArrangement - 任务安排

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phases | Array<RequirementPhase> | 是 | 实现阶段 |
| resourceRecommendations | ResourceRecommendations | 是 | 资源推荐 |
| riskManagement | Array<RiskItem> | 是 | 风险管理 |

#### RequirementPhase - 需求阶段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 阶段名称 |
| description | String | 是 | 阶段描述 |
| estimatedWorkload | String | 是 | 估计工作量 |
| suggestedTimeframe | String | 是 | 建议时间范围 |
| tasks | Array<RequirementTask> | 是 | 阶段内任务 |

#### RequirementTask - 需求任务

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | String | 是 | 任务名称 |
| priority | String | 是 | 优先级 |
| estimatedWorkload | String | 是 | 估计工作量 |
| dependencies | Array<String> | 是 | 依赖任务 |
| assignmentSuggestion | String | 是 | 分配建议 |

#### ResourceRecommendations - 资源推荐

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| personnel | Array<String> | 是 | 人员配置建议 |
| skills | Array<String> | 是 | 所需技能 |
| tools | Array<String> | 是 | 建议工具 |

#### RiskItem - 风险项

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| risk | String | 是 | 风险描述 |
| impact | String | 是 | 影响程度 |
| mitigation | String | 是 | 缓解措施 |

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

---

## 前端调用示例

### JavaScript (Fetch API)

```javascript
// 1. 获取最近30天的需求对话列表
async function getRecentConversations() {
  const response = await fetch('/api/client/requirement-conversation/recent', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data;
}

// 2. 根据ID获取详情
async function getConversationById(id) {
  const response = await fetch(`/api/client/requirement-conversation/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const result = await response.json();
  return result.data;
}

// 3. 创建需求对话列表
async function createConversation(requestData) {
  const response = await fetch('/api/client/requirement-conversation/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  const result = await response.json();
  return result.data; // 返回创建的ID
}

// 4. 删除需求对话列表
async function deleteConversation(id) {
  const response = await fetch(`/api/client/requirement-conversation/${id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const result = await response.json();
  return result.success;
}
```

### TypeScript (Axios)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/client/requirement-conversation',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// 1. 获取最近30天的需求对话列表
export const getRecentConversations = async () => {
  const { data } = await api.get('/recent');
  return data;
};

// 2. 根据ID获取详情
export const getConversationById = async (id: number) => {
  const { data } = await api.get(`/${id}`);
  return data.data;
};

// 3. 创建需求对话列表
export const createConversation = async (requestData: CreateRequirementConversationRequest) => {
  const { data } = await api.post('/create', requestData);
  return data.data;
};

// 4. 删除需求对话列表
export const deleteConversation = async (id: number) => {
  const { data } = await api.post(`/${id}`);
  return data.success;
};
```

---

## 注意事项

1. **认证**: 所有接口都需要在请求头中携带有效的JWT Token
2. **响应式**: 后端使用WebFlux响应式编程，接口响应速度快
3. **时间格式**: 所有时间字段使用ISO 8601格式（如：`2024-03-01T10:30:00+08:00`）
4. **颜色格式**: 颜色字段使用十六进制格式（如：`#FF5733`）
5. **字段命名**: 请求体中部分字段使用下划线命名（如：`most_likely`），响应体使用驼峰命名（如：`mostLikely`）
6. **错误处理**: 建议前端统一处理`ApiResponse`的`success`字段，当为`false`时展示`message`中的错误信息
7. **追踪ID**: 响应中的`traceId`可用于问题排查和日志追踪

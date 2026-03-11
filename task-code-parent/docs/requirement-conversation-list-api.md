# 需求对话列表基础接口文档

## 基础信息

**Base URL**: `/api/client/requirement-conversation-list`

**认证方式**: JWT Token（请求头添加 `Authorization: Bearer {token}`）

**响应格式**: 统一 `ApiResponse`

```json
{
  "success": true,
  "data": 1923728192371283,
  "code": "200",
  "message": null,
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

---

## 接口列表

### 1. 创建需求对话列表基础记录（无请求体）

创建一条 `t_requirement_conversation_list` 记录，只返回新生成的 `id`。

**请求信息**

- **URL**: `/api/client/requirement-conversation-list/create`
- **Method**: `POST`
- **Content-Type**: `application/json`

**请求参数**: 无

**请求体**: 无

**请求示例**

```http
POST /api/client/requirement-conversation-list/create HTTP/1.1
Authorization: Bearer {token}
Content-Type: application/json
```

**成功响应示例**

```json
{
  "success": true,
  "data": 1923728192371283,
  "code": "200",
  "message": null,
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| success | Boolean | 是否成功 |
| data | Long | 新创建的 `conversation_list_id` |
| code | String | 响应码，成功为 `"200"` |
| message | String/null | 提示信息，成功时通常为 `null` |
| timestamp | Long | 响应时间戳（毫秒） |
| traceId | String/null | 请求链路追踪ID |

**失败响应示例（未认证）**

```json
{
  "success": false,
  "data": null,
  "code": "401",
  "message": "Unauthorized",
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

**失败响应示例（服务异常）**

```json
{
  "success": false,
  "data": null,
  "code": "500",
  "message": "Internal Server Error",
  "timestamp": 1709539200000,
  "traceId": "trace-id-xxx"
}
```

---

## 前端对接示例

### Axios

```ts
import axios from "axios";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  code: string;
  message: string | null;
  timestamp: number;
  traceId: string | null;
};

export async function createConversationListId(token: string): Promise<number> {
  const resp = await axios.post<ApiResponse<number>>(
    "/api/client/requirement-conversation-list/create",
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!resp.data.success || resp.data.data == null) {
    throw new Error(resp.data.message ?? "创建对话列表ID失败");
  }
  return resp.data.data;
}
```

---

## 对接说明

1. 该接口用于先拿到 `conversation_list_id`。
2. 后续创建对话明细时，将该 ID 传入 `t_requirement_conversation.conversation_list_id` 对应字段。

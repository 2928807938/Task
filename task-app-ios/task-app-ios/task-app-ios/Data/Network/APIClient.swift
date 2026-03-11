//
//  APIClient.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import Foundation

/**
 * API客户端
 * 负责处理所有HTTP请求和响应的基础封装
 */
class APIClient {
    static let shared = APIClient()
    
    private let session: URLSession
    private let networkManager = NetworkManager.shared
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)
    }
    
    /**
     * 通用GET请求
     */
    func get<T: Codable>(_ path: String, responseType: T.Type) async throws -> T {
        guard let request = networkManager.createRequest(for: path, method: .GET) else {
            throw NetworkError.invalidURL
        }
        
        return try await performRequest(request, responseType: responseType)
    }
    
    /**
     * 通用POST请求
     */
    func post<T: Codable, U: Codable>(_ path: String, body: T, responseType: U.Type) async throws -> U {
        guard var request = networkManager.createRequest(for: path, method: .POST) else {
            throw NetworkError.invalidURL
        }
        
        do {
            let jsonData = try JSONEncoder().encode(body)
            request.httpBody = jsonData
        } catch {
            throw NetworkError.decodingError(error)
        }
        
        return try await performRequest(request, responseType: responseType)
    }
    
    /**
     * 通用PUT请求
     */
    func put<T: Codable, U: Codable>(_ path: String, body: T, responseType: U.Type) async throws -> U {
        guard var request = networkManager.createRequest(for: path, method: .PUT) else {
            throw NetworkError.invalidURL
        }
        
        do {
            let jsonData = try JSONEncoder().encode(body)
            request.httpBody = jsonData
        } catch {
            throw NetworkError.decodingError(error)
        }
        
        return try await performRequest(request, responseType: responseType)
    }
    
    /**
     * 通用DELETE请求
     */
    func delete(_ path: String) async throws {
        guard let request = networkManager.createRequest(for: path, method: .DELETE) else {
            throw NetworkError.invalidURL
        }
        
        let _: EmptyResponse = try await performRequest(request, responseType: EmptyResponse.self)
    }
    
    /**
     * 执行请求的核心方法
     */
    private func performRequest<T: Codable>(_ request: URLRequest, responseType: T.Type) async throws -> T {
        // 检查网络连接
        guard networkManager.isConnected else {
            throw NetworkError.noConnection
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            // 检查HTTP状态码
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.invalidResponse
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                // 成功响应
                break
            case 401:
                // 未授权，需要重新登录
                DispatchQueue.main.async {
                    AuthenticationManager.shared.logout()
                }
                throw NetworkError.unauthorized
            case 400...499:
                throw NetworkError.serverError(httpResponse.statusCode)
            case 500...599:
                throw NetworkError.serverError(httpResponse.statusCode)
            default:
                throw NetworkError.serverError(httpResponse.statusCode)
            }
            
            // 解析响应数据
            if responseType == EmptyResponse.self {
                return EmptyResponse() as! T
            }
            
            // 处理API响应包装
            if let apiResponse = try? JSONDecoder().decode(APIResponse<T>.self, from: data) {
                if apiResponse.success {
                    if let responseData = apiResponse.data {
                        return responseData
                    } else {
                        throw NetworkError.invalidData
                    }
                } else {
                    throw NetworkError.serverError(apiResponse.code ?? 0)
                }
            }
            
            // 直接解析为目标类型
            do {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                return try decoder.decode(responseType, from: data)
            } catch {
                throw NetworkError.decodingError(error)
            }
            
        } catch {
            if error is NetworkError {
                throw error
            } else {
                throw NetworkError.unknown(error)
            }
        }
    }
}

/**
 * API响应包装类
 * 对应后端的ApiResponse<T>结构
 */
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let code: Int?
    let message: String?
    let data: T?
}

/**
 * 空响应类型（用于DELETE等无返回值的请求）
 */
struct EmptyResponse: Codable {
    init() {}
}

/**
 * 分页数据响应
 * 对应后端的PageData<T>结构
 */
struct PageData<T: Codable>: Codable {
    let content: [T]
    let totalElements: Int64
    let totalPages: Int
    let page: Int
    let size: Int
    let first: Bool
    let last: Bool
}

/**
 * APIClient的任务相关扩展
 */
extension APIClient {
    
    /**
     * 获取所有任务
     */
    func getAllTasks(page: Int = 0, size: Int = 20) async throws -> PageData<TaskDTO> {
        let path = "\(NetworkManager.APIPath.tasks)?page=\(page)&size=\(size)"
        return try await get(path, responseType: PageData<TaskDTO>.self)
    }
    
    /**
     * 获取任务详情
     */
    func getTaskDetail(taskId: Int64) async throws -> TaskDTO {
        let path = String(format: NetworkManager.APIPath.taskDetail, taskId)
        return try await get(path, responseType: TaskDTO.self)
    }
    
    /**
     * 创建任务
     */
    func createTask(request: CreateTaskRequest) async throws -> TaskDTO {
        return try await post(NetworkManager.APIPath.taskCreate, body: request, responseType: TaskDTO.self)
    }
    
    /**
     * 更新任务
     */
    func updateTask(request: UpdateTaskRequest) async throws -> TaskDTO {
        return try await post(NetworkManager.APIPath.taskEdit, body: request, responseType: TaskDTO.self)
    }
    
    /**
     * 删除任务
     */
    func deleteTask(taskId: Int64) async throws {
        let path = String(format: NetworkManager.APIPath.taskDelete, taskId)
        try await delete(path)
    }
    
    /**
     * 切换任务状态
     */
    func toggleTaskStatus(taskId: Int64, isCompleted: Bool) async throws {
        let path = String(format: NetworkManager.APIPath.taskStatus, taskId)
        let request = UpdateTaskStatusRequest(isCompleted: isCompleted)
        let _: EmptyResponse = try await post(path, body: request, responseType: EmptyResponse.self)
    }
    
    /**
     * 过滤任务
     */
    func filterTasks(request: FilterTasksRequest) async throws -> PageData<TaskDTO> {
        let path = NetworkManager.APIPath.taskFilter
        return try await post(path, body: request, responseType: PageData<TaskDTO>.self)
    }
    
    /**
     * 获取任务统计
     */
    func getTaskStatistics(userId: Int64? = nil, projectId: Int64? = nil) async throws -> TaskStatisticsDTO {
        var path = NetworkManager.APIPath.taskStatistics + "?"
        
        var queryParams: [String] = []
        if let userId = userId {
            queryParams.append("userId=\(userId)")
        }
        if let projectId = projectId {
            queryParams.append("projectId=\(projectId)")
        }
        
        if !queryParams.isEmpty {
            path += queryParams.joined(separator: "&")
        }
        
        return try await get(path, responseType: TaskStatisticsDTO.self)
    }
}
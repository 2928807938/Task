//
//  NetworkManager.swift
//  task-app-ios
//
//  Created by Claude on 2025/9/11.
//

import Foundation
import Network

/**
 * 网络管理器单例
 * 负责管理网络连接状态、请求配置和基础网络操作
 */
class NetworkManager: ObservableObject {
    static let shared = NetworkManager()
    
    @Published var isConnected = false
    @Published var connectionType: NWInterface.InterfaceType = .other
    
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    
    // 服务器配置
    struct ServerConfig {
        static let developmentBaseURL = "http://localhost:8080"
        static let productionBaseURL = "https://api.taskapp.com"
        
        #if DEBUG
        static let baseURL = developmentBaseURL
        #else
        static let baseURL = productionBaseURL
        #endif
    }
    
    // API路径
    struct APIPath {
        static let tasks = "/api/client/task"
        static let taskDetail = "/api/client/task/%d/detail"
        static let taskCreate = "/api/client/task/create"
        static let taskEdit = "/api/client/task/edit"
        static let taskStatus = "/api/client/task/%d/status"
        static let taskDelete = "/api/client/task/%d"
        static let taskFilter = "/api/client/task/filter"
        static let taskStatistics = "/api/client/task/statistics"
        static let dashboard = "/api/client/homepage/dashboard"
        static let auth = "/api/auth/login"
    }
    
    private init() {
        startMonitoring()
    }
    
    deinit {
        stopMonitoring()
    }
    
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                
                if let interface = path.availableInterfaces.first {
                    self?.connectionType = interface.type
                }
            }
        }
        monitor.start(queue: queue)
    }
    
    private func stopMonitoring() {
        monitor.cancel()
    }
    
    /**
     * 获取完整的API URL
     */
    func getURL(for path: String) -> URL? {
        return URL(string: ServerConfig.baseURL + path)
    }
    
    /**
     * 创建基础URLRequest
     */
    func createRequest(for path: String, method: HTTPMethod = .GET) -> URLRequest? {
        guard let url = getURL(for: path) else {
            return nil
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        request.timeoutInterval = 30
        
        // 添加认证token
        if let token = AuthenticationManager.shared.currentToken {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        return request
    }
}

/**
 * HTTP方法枚举
 */
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
    case PATCH = "PATCH"
}

/**
 * 网络错误类型
 */
enum NetworkError: Error, LocalizedError {
    case noConnection
    case invalidURL
    case invalidResponse
    case invalidData
    case unauthorized
    case serverError(Int)
    case decodingError(Error)
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .noConnection:
            return "网络连接不可用"
        case .invalidURL:
            return "无效的URL地址"
        case .invalidResponse:
            return "无效的服务器响应"
        case .invalidData:
            return "无效的数据格式"
        case .unauthorized:
            return "用户认证失败"
        case .serverError(let code):
            return "服务器错误: \(code)"
        case .decodingError(let error):
            return "数据解析错误: \(error.localizedDescription)"
        case .unknown(let error):
            return "未知错误: \(error.localizedDescription)"
        }
    }
}

/**
 * 认证管理器
 * 负责管理用户认证状态和token
 */
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()
    
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let tokenKey = "auth_token"
    private let userKey = "current_user"
    
    var currentToken: String? {
        return UserDefaults.standard.string(forKey: tokenKey)
    }
    
    private init() {
        loadStoredAuth()
    }
    
    private func loadStoredAuth() {
        if let token = currentToken,
           let userData = UserDefaults.standard.data(forKey: userKey),
           let user = try? JSONDecoder().decode(User.self, from: userData) {
            self.isAuthenticated = true
            self.currentUser = user
        }
    }
    
    func login(token: String, user: User) {
        UserDefaults.standard.set(token, forKey: tokenKey)
        
        if let userData = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(userData, forKey: userKey)
        }
        
        DispatchQueue.main.async {
            self.isAuthenticated = true
            self.currentUser = user
        }
    }
    
    func logout() {
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: userKey)
        
        DispatchQueue.main.async {
            self.isAuthenticated = false
            self.currentUser = nil
        }
    }
}

/**
 * 简化的用户模型（用于认证）
 */
struct User: Codable {
    let id: Int64
    let username: String
    let email: String?
    let displayName: String?
}
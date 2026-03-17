// HTTP客户端接口
export interface IHttpClient {
  get<T>(url: string): Promise<T>;
  post<T, D = unknown>(url: string, data: D): Promise<T>;
  put<T, D = unknown>(url: string, data: D): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

/**
 * 密码加密工具函数
 * 用于前端密码加密处理
 */

/**
 * 使用SHA-256算法对密码进行加密
 * @param password 原始密码
 * @returns 加密后的密码
 */
export async function encryptPassword(password: string): Promise<string> {
  // 使用Web Crypto API进行SHA-256加密
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // 将ArrayBuffer转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * 同步版本的密码加密函数（用于不支持async/await的场景）
 * 注意：这个方法在浏览器环境中使用，依赖于Web Crypto API
 * @param password 原始密码
 * @returns 加密后的密码的Promise
 */
export function encryptPasswordSync(password: string): Promise<string> {
  return encryptPassword(password);
}

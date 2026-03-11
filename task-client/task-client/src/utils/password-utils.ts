/**
 * 密码强度评估工具
 * 用于评估密码的强度并提供反馈
 */

/**
 * 密码强度级别
 */
export enum PasswordStrength {
  VERY_WEAK = 0,
  WEAK = 1,
  MEDIUM = 2,
  STRONG = 3,
  VERY_STRONG = 4
}

/**
 * 密码强度评估结果
 */
export interface PasswordStrengthResult {
  score: PasswordStrength;
  feedback: string;
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isLongEnough: boolean;
}

/**
 * 评估密码强度
 * @param password 密码
 * @returns 密码强度评估结果
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: PasswordStrength.VERY_WEAK,
      feedback: '请输入密码',
      hasLowerCase: false,
      hasUpperCase: false,
      hasNumber: false,
      hasSpecialChar: false,
      isLongEnough: false
    };
  }

  // 检查密码特征
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;

  // 计算得分
  let score = 0;
  if (hasLowerCase) score++;
  if (hasUpperCase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;
  if (isLongEnough) score++;

  // 根据得分和密码长度调整最终强度
  let finalScore: PasswordStrength;
  
  if (password.length < 6) {
    finalScore = PasswordStrength.VERY_WEAK;
  } else if (score <= 2) {
    finalScore = PasswordStrength.WEAK;
  } else if (score === 3) {
    finalScore = PasswordStrength.MEDIUM;
  } else if (score === 4) {
    finalScore = PasswordStrength.STRONG;
  } else {
    finalScore = PasswordStrength.VERY_STRONG;
  }

  // 生成反馈
  let feedback = '';
  switch (finalScore) {
    case PasswordStrength.VERY_WEAK:
      feedback = '非常弱：密码太短或太简单';
      break;
    case PasswordStrength.WEAK:
      feedback = '弱：尝试添加大写字母、数字或特殊字符';
      break;
    case PasswordStrength.MEDIUM:
      feedback = '中等：可以使用，但建议增强';
      break;
    case PasswordStrength.STRONG:
      feedback = '强：这是一个好密码';
      break;
    case PasswordStrength.VERY_STRONG:
      feedback = '非常强：极佳的密码';
      break;
  }

  return {
    score: finalScore,
    feedback,
    hasLowerCase,
    hasUpperCase,
    hasNumber,
    hasSpecialChar,
    isLongEnough
  };
}

/**
 * 获取密码强度对应的颜色类名
 * @param strength 密码强度得分
 * @param indicatorPosition 指示器位置（1-4），可选
 * @returns Tailwind CSS颜色类名
 */
export function getPasswordStrengthColor(strength: PasswordStrength, indicatorPosition?: number): string {
  // 如果只是获取颜色（没有指定指示器位置）
  if (indicatorPosition === undefined) {
    switch (strength) {
      case PasswordStrength.VERY_WEAK:
        return 'bg-red-500';
      case PasswordStrength.WEAK:
        return 'bg-orange-500';
      case PasswordStrength.MEDIUM:
        return 'bg-yellow-500';
      case PasswordStrength.STRONG:
        return 'bg-green-500';
      case PasswordStrength.VERY_STRONG:
        return 'bg-green-600';
      default:
        return 'bg-gray-200';
    }
  }
  
  // 根据密码强度和指示器位置决定是否点亮
  // 非常弱（0）：只点亮第1个指示器
  // 弱（1）：点亮第1、2个指示器
  // 中等（2）：点亮第1、2、3个指示器
  // 强（3）或非常强（4）：点亮所有指示器
  
  // 判断当前指示器是否应该点亮
  let shouldLight = false;
  switch (strength) {
    case PasswordStrength.VERY_WEAK: // 0
      shouldLight = indicatorPosition === 1;
      break;
    case PasswordStrength.WEAK: // 1
      shouldLight = indicatorPosition <= 2;
      break;
    case PasswordStrength.MEDIUM: // 2
      shouldLight = indicatorPosition <= 3;
      break;
    case PasswordStrength.STRONG: // 3
    case PasswordStrength.VERY_STRONG: // 4
      shouldLight = indicatorPosition <= 4;
      break;
    default:
      shouldLight = false;
  }
  
  // 如果应该点亮，返回对应强度的颜色
  if (shouldLight) {
    switch (strength) {
      case PasswordStrength.VERY_WEAK:
        return 'bg-red-500';
      case PasswordStrength.WEAK:
        return 'bg-orange-500';
      case PasswordStrength.MEDIUM:
        return 'bg-yellow-500';
      case PasswordStrength.STRONG:
      case PasswordStrength.VERY_STRONG:
        return 'bg-green-500';
    }
  }
  
  // 默认不点亮
  return 'bg-gray-200';
}

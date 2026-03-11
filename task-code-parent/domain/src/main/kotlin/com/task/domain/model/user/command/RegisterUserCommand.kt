package com.task.domain.model.user.command

/**
 * 用户注册命令
 * 封装用户注册所需的所有参数
 */
data class RegisterUserCommand(
    val username: String,
    val email: String,
    val password: String,
    val verificationCode: String,
) {
    /**
     * 验证命令参数的有效性
     * @throws IllegalArgumentException 当验证失败时
     */
    fun validate() {
        require(username.isNotBlank()) { "用户名不能为空" }
        require(email.isNotBlank()) { "邮箱不能为空" }
        require(password.isNotBlank()) { "密码不能为空" }
        require(verificationCode.isNotBlank()) { "验证码不能为空" }
    }
}
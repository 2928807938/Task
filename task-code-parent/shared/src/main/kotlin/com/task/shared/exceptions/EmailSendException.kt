package com.task.shared.exceptions

import com.task.shared.constants.ResponseCode

class EmailSendException(
    message: String = "邮件发送失败，请检查邮件服务配置后重试",
    cause: Throwable? = null
) : BusinessException(ResponseCode.THIRD_PARTY_SERVICE_ERROR, message, cause)

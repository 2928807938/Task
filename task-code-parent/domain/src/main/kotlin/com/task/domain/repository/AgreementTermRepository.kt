package com.task.domain.repository

import com.task.domain.model.agreement.AgreementTerm

/**
 * 协议条款仓储接口
 * 继承通用Repository接口，定义协议条款特有的数据访问方法
 */
interface AgreementTermRepository : Repository<AgreementTerm> {
   
}
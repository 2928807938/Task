package com.task.infrastructure.id

import com.github.f4b6a3.tsid.TsidCreator
import org.springframework.stereotype.Service

/**
 * 分布式ID生成服务
 * 基于TSID（Time-Sorted Unique Identifiers）算法
 * 生成有序的、基于时间的唯一ID
 */
@Service
class IdGeneratorService {
    
    /**
     * 生成TSID格式的ID（64位长整型）
     * @return 64位长整型ID
     */
    fun generateId(): Long {
        return TsidCreator.getTsid().toLong()
    }
}

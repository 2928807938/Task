package com.task.infrastructure.config

import io.r2dbc.spi.ConnectionFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.dialect.PostgresDialect
import org.springframework.data.r2dbc.dialect.R2dbcDialect
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories
import org.springframework.data.relational.core.mapping.NamingStrategy
import org.springframework.data.relational.core.mapping.RelationalPersistentProperty
import org.springframework.data.util.ParsingUtils
import org.springframework.r2dbc.core.DatabaseClient
import java.util.*

/**
 * R2DBC配置类
 * 提供R2dbcEntityTemplate的配置和数据库映射相关策略
 */
@Configuration
//@EnableR2dbcRepositories(basePackages = ["com.task.infrastructure.persistence.mapper"])
class R2dbcConfig {

    /**
     * 配置R2dbcEntityTemplate
     * 这是Spring Data R2DBC的核心组件，用于执行数据库操作
     */
//    @Bean
//    fun r2dbcEntityTemplate(connectionFactory: ConnectionFactory): R2dbcEntityTemplate {
//        val dialect: R2dbcDialect = PostgresDialect.INSTANCE
//        val databaseClient = DatabaseClient.builder()
//            .connectionFactory(connectionFactory)
//            .build()
//
//        return R2dbcEntityTemplate(databaseClient, dialect)
//    }

    /**
     * 配置命名策略，实现驼峰命名到下划线命名的自动转换
     * 例如：createdAt -> created_at
     */
    @Bean
    fun namingStrategy(): NamingStrategy {
        return SnakeCaseNamingStrategy()
    }
    
    /**
     * 蛇形命名策略（下划线命名）
     * 将Java/Kotlin的驼峰命名自动转换为数据库的下划线命名
     */
    class SnakeCaseNamingStrategy : NamingStrategy {
        override fun getTableName(type: Class<*>): String {
            return type.simpleName.lowercase(Locale.getDefault())
        }
        
        override fun getColumnName(property: RelationalPersistentProperty): String {
            return ParsingUtils.reconcatenateCamelCase(property.name, "_").lowercase(Locale.getDefault())
        }
    }
}

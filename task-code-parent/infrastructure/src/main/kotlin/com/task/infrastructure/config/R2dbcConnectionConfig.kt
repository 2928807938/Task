package com.task.infrastructure.config

import io.r2dbc.pool.ConnectionPool
import io.r2dbc.pool.ConnectionPoolConfiguration
import io.r2dbc.postgresql.PostgresqlConnectionConfiguration
import io.r2dbc.postgresql.PostgresqlConnectionFactory
import io.r2dbc.spi.ConnectionFactory
import io.r2dbc.spi.ValidationDepth
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.event.EventListener
import org.springframework.data.r2dbc.config.AbstractR2dbcConfiguration
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate
import org.springframework.data.r2dbc.dialect.PostgresDialect
import org.springframework.data.r2dbc.dialect.R2dbcDialect
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories
import org.springframework.r2dbc.connection.R2dbcTransactionManager
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.transaction.ReactiveTransactionManager
import org.springframework.transaction.annotation.EnableTransactionManagement
import reactor.core.publisher.Mono
import java.time.Duration

/**
 * R2DBC连接配置类
 * 提供PostgreSQL数据库的R2DBC连接工厂，并添加连接池监控
 */
@Configuration
@EnableR2dbcRepositories(basePackages = ["com.task.infrastructure.persistence.mapper"])
@EnableTransactionManagement
class R2dbcConnectionConfig : AbstractR2dbcConfiguration() {
    private val log = LoggerFactory.getLogger(javaClass)

    @Value("\${spring.r2dbc.url}")
    private lateinit var url: String

    @Value("\${spring.r2dbc.username}")
    private lateinit var username: String

    @Value("\${spring.r2dbc.password}")
    private lateinit var password: String
    
    @Value("\${spring.r2dbc.pool.initial-size:10}")
    private val initialSize: Int = 10
    
    @Value("\${spring.r2dbc.pool.max-size:30}")
    private val maxSize: Int = 30
    
    @Value("\${spring.r2dbc.pool.max-idle-time:10m}")
    private val maxIdleTime: Duration = Duration.ofMinutes(10)
    
    @Value("\${spring.r2dbc.pool.max-acquire-time:20s}")
    private val maxAcquireTime: Duration = Duration.ofSeconds(20)
    
    @Value("\${spring.r2dbc.pool.max-life-time:30m}")
    private val maxLifeTime: Duration = Duration.ofMinutes(30)
    
    @Value("\${spring.r2dbc.pool.validation-query:SELECT 1}")
    private val validationQuery: String = "SELECT 1"

    /**
     * 创建连接池并添加监控
     */
    @Bean
    @Primary
    override fun connectionFactory(): ConnectionFactory {
        // 解析URL
        // 支持格式: r2dbc:postgresql://localhost:5432/task_code_parent
        val urlPattern = "r2dbc:postgresql://([^:]+):(\\d+)/(.+)".toRegex()
        val matchResult = urlPattern.find(url)
            ?: throw IllegalArgumentException("Invalid R2DBC URL format: $url. Expected format: r2dbc:postgresql://host:port/database")
        
        val (host, port, database) = matchResult.destructured
        
        // 创建PostgreSQL连接配置
        val config = PostgresqlConnectionConfiguration.builder()
            .host(host)
            .port(port.toInt())
            .database(database)
            .username(username)
            .password(password)
            .connectTimeout(Duration.ofSeconds(10))
            .build()
        
        val connectionFactory = PostgresqlConnectionFactory(config)
        
        // 创建连接池配置
        val poolConfig = ConnectionPoolConfiguration.builder(connectionFactory)
            .initialSize(initialSize)
            .maxSize(maxSize)
            .maxIdleTime(maxIdleTime)
            .maxAcquireTime(maxAcquireTime)
            .maxLifeTime(maxLifeTime)
            .validationQuery(validationQuery)
            .validationDepth(ValidationDepth.REMOTE) // 执行全面验证
            .build()
        
        // 创建连接池
        return ConnectionPool(poolConfig)
    }
    
    /**
     * 检查连接池状态
     */
    private fun checkConnectionPool(connectionFactory: ConnectionFactory) {
        try {
            if (connectionFactory is ConnectionPool) {
                log.info("连接池配置检查: 属于ConnectionPool类型")
            } else {
                log.info("连接池配置检查: 非ConnectionPool类型, 实际类型={}", connectionFactory.javaClass.name)
            }
        } catch (e: Exception) {
            log.error("检查连接池状态失败: {}", e.message, e)
        }
    }
    
    /**
     * 添加事务管理器
     */
    @Bean
    fun reactiveTransactionManager(connectionFactory: ConnectionFactory): ReactiveTransactionManager {
        return R2dbcTransactionManager(connectionFactory)
    }
    
//    /**
//     * 创建R2DBC实体模板
//     * 直接使用connectionFactory()方法以解决AOT处理问题
//     */
//    @Bean
//    fun r2dbcEntityTemplate(): R2dbcEntityTemplate {
//        return R2dbcEntityTemplate(connectionFactory())
//    }

    /**
     * 配置R2dbcEntityTemplate
     * 这是Spring Data R2DBC的核心组件，用于执行数据库操作
     */
    @Bean
    fun r2dbcEntityTemplate(connectionFactory: ConnectionFactory): R2dbcEntityTemplate {
        val dialect: R2dbcDialect = PostgresDialect.INSTANCE
        val databaseClient = DatabaseClient.builder()
            .connectionFactory(connectionFactory)
            .build()

        return R2dbcEntityTemplate(databaseClient, dialect)
    }
    
    /**
     * 在应用程序启动时记录连接池配置
     */
    @EventListener(ApplicationReadyEvent::class)
    fun logDatabaseConfig() {
        log.info("数据库连接池配置: 初始连接数={}, 最大连接数={}, 最大空闲时间={}分钟, 验证查询={}", 
                initialSize, maxSize, maxIdleTime.toMinutes(), validationQuery)
        
        val factory = connectionFactory()
        // 检查连接池类型
        checkConnectionPool(factory)
        
        // 验证连接池是否正常工作
        Mono.from(factory.create())
            .flatMap { connection ->
                Mono.from(connection.createStatement(validationQuery).execute())
                    .doFinally { _ -> connection.close() }
            }
            .doOnSuccess { _ -> 
                log.info("数据库连接池初始化成功，连接测试通过") 
            }
            .doOnError { e -> log.error("数据库连接池初始化失败: {}", e.message, e) }
            .subscribe()
    }
}

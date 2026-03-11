package com.task.infrastructure.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.data.convert.ReadingConverter
import org.springframework.data.convert.WritingConverter
import org.springframework.data.r2dbc.convert.R2dbcCustomConversions
import org.springframework.data.r2dbc.dialect.PostgresDialect
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneOffset

/**
 * R2DBC转换器配置
 * 提供LocalDateTime和OffsetDateTime之间的相互转换
 */
@Configuration
class R2dbcConverterConfig {

    /**
     * 配置自定义R2DBC转换器
     * 用于处理LocalDateTime和OffsetDateTime之间的转换
     */
    @Bean
    fun r2dbcCustomConversions(): R2dbcCustomConversions {
        return R2dbcCustomConversions.of(
            PostgresDialect.INSTANCE,
            listOf(
                LocalDateTimeToOffsetDateTimeConverter(),
                OffsetDateTimeToLocalDateTimeConverter()
            )
        )
    }

    /**
     * LocalDateTime转OffsetDateTime的读取转换器
     * 在从数据库读取数据时，将LocalDateTime转换为OffsetDateTime
     */
    @ReadingConverter
    class LocalDateTimeToOffsetDateTimeConverter : Converter<LocalDateTime, OffsetDateTime> {
        override fun convert(source: LocalDateTime): OffsetDateTime {
            // 使用系统默认时区进行转换
            return source.atOffset(ZoneOffset.systemDefault().rules.getOffset(source))
        }
    }

    /**
     * OffsetDateTime转LocalDateTime的写入转换器
     * 在写入数据库时，将OffsetDateTime转换为LocalDateTime
     */
    @WritingConverter
    class OffsetDateTimeToLocalDateTimeConverter : Converter<OffsetDateTime, LocalDateTime> {
        override fun convert(source: OffsetDateTime): LocalDateTime {
            return source.toLocalDateTime()
        }
    }
}

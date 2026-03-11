package com.task.infrastructure.llm.config

import io.netty.channel.ChannelOption
import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.web.reactive.function.client.ExchangeStrategies
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import java.time.Duration
import java.util.concurrent.TimeUnit

/**
 * OpenAI兼容接口配置
 */
@Configuration
class OpenAiCompatibleConfig {

    @Value("\${llm.api.base-url}")
    lateinit var apiUrl: String

    @Value("\${llm.api.key:}")
    lateinit var apiKey: String

    @Value("\${llm.api.model:gpt-5.2}")
    lateinit var model: String

    @Value("\${llm.timeout-ms:3600000}")
    var timeoutMs: Long = 3600000

    @Value("\${llm.connection-timeout:5000}")
    var connectionTimeout: Int = 5000

    @Value("\${llm.read-timeout:3600000}")
    var readTimeout: Int = 3600000

    @Value("\${llm.write-timeout:3600000}")
    var writeTimeout: Int = 3600000

    @Value("\${llm.prompt.dir:xml/xml}")
    lateinit var promptDir: String

    @Bean
    fun llmWebClient(): WebClient {
        val effectiveReadTimeout = maxOf(readTimeout.toLong(), timeoutMs)
        val httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectionTimeout)
            .responseTimeout(Duration.ofMillis(timeoutMs))
            .doOnConnected { conn ->
                conn.addHandlerLast(ReadTimeoutHandler(effectiveReadTimeout, TimeUnit.MILLISECONDS))
                conn.addHandlerLast(WriteTimeoutHandler(writeTimeout.toLong(), TimeUnit.MILLISECONDS))
            }

        val exchangeStrategies = ExchangeStrategies.builder()
            .codecs { configurer ->
                configurer.defaultCodecs().maxInMemorySize(1024 * 1024 * 10)
            }
            .build()

        return WebClient.builder()
            .baseUrl(apiUrl)
            .clientConnector(ReactorClientHttpConnector(httpClient))
            .exchangeStrategies(exchangeStrategies)
            .build()
    }
}

package com.task.bootstrap.nativehints

import org.springframework.aot.hint.RuntimeHints
import org.springframework.aot.hint.RuntimeHintsRegistrar
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.ImportRuntimeHints

@Configuration
@ImportRuntimeHints(NativeHints.NativeHintsRegistrar::class)
class NativeHints {
    
    class NativeHintsRegistrar : RuntimeHintsRegistrar {
        override fun registerHints(hints: RuntimeHints, classLoader: ClassLoader?) {
            // 注册反射
            hints.reflection()
                .registerType(com.task.bootstrap.TaskCodeApplication::class.java)
                
            // 注册资源
            hints.resources()
                .registerPattern("META-INF/spring.factories")
                .registerPattern("META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports")
                .registerPattern("META-INF/spring.components")
                .registerPattern("application.properties")
                .registerPattern("application.yml")
                .registerPattern("application-*.yml")
                .registerPattern("static/*")
        }
    }
}

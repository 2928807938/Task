# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Task Code Parent** is a modern Kotlin-based task management system built using **Domain-Driven Design (DDD)** principles with a modular, multi-layered architecture. The project leverages reactive programming patterns and cloud-native technologies for high performance and scalability.

## Quick Start

### Prerequisites
- Java 21+
- Docker & Docker Compose
- Gradle 8.0+

### Development Setup
```bash
# Start infrastructure services
./start-postgres.sh
./start-redis.sh

# Build and run
./gradlew bootRun

# Run tests
./gradlew test
```

## Architecture & Module Structure

### Modular DDD Architecture
```
task-code-parent/
├── bootstrap/       # Application startup and configuration
├── web/            # Presentation layer (Controllers, Security, Filters)
├── application/    # Application services, DTOs, Use cases
├── domain/         # Core business logic, Domain models, Services
├── infrastructure/ # External concerns (Database, Redis, Email, LLM)
└── shared/         # Common utilities and exceptions
```

### Module Dependencies
- **Bootstrap** → depends on all other modules (entry point)
- **Web** → depends on Application, Shared
- **Application** → depends on Domain, Shared  
- **Domain** → depends only on Shared (core business layer)
- **Infrastructure** → depends on Domain, Shared
- **Shared** → no dependencies (base utilities)

## Key Technologies

### Core Stack
- **Language**: Kotlin 2.0.0 with Java 21
- **Framework**: Spring Boot 3.2.3 + Spring WebFlux (Reactive)
- **Database**: PostgreSQL with R2DBC (Reactive Database Connectivity)
- **Caching**: Redis with Reactive support
- **Build**: Gradle with Kotlin DSL
- **Testing**: JUnit 5, MockK, TestContainers

### Advanced Features
- **GraalVM Native**: Ready for native compilation
- **Domain Events**: Event-driven architecture with reactive event bus
- **JWT Authentication**: Stateless security
- **LLM Integration**: AI-powered requirement analysis via Dify
- **Non-intrusive Permissions**: AOP-based authorization system

## Key Design Patterns

### 1. Repository Pattern
```kotlin
// Domain layer - Interface
interface TaskRepository : Repository<Task, Long> {
    fun findByProjectId(projectId: Long): Flux<Task>
}

// Infrastructure layer - Implementation  
@Repository
class TaskRepositoryImpl : TaskRepository {
    // R2DBC implementation
}
```

### 2. Command Pattern
```kotlin
// Structured command handling
data class EditTaskCommand(
    val taskId: Long,
    val updates: Map<String, Any>
)

@Component
class TaskCommandHandler {
    fun handle(command: EditTaskCommand): Mono<Task> { }
}
```

### 3. Non-intrusive Permission System
```kotlin
// Old way (intrusive)
fun getProject(projectId: Long): Mono<Project> {
    return securityUtils.withCurrentUserId { userId ->
        accessControlService.checkProjectAccess(userId, projectId)
            .then(projectService.findById(projectId))
    }
}

// New way (non-intrusive with AOP)
@RequireProjectPermission(
    permission = ProjectPermissions.PROJECT_VIEW,
    projectIdParam = "projectId"
)
fun getProject(projectId: Long): Mono<Project> {
    return projectService.findById(projectId)
}
```

### 4. Event-Driven Architecture
```kotlin
// Domain events
@DomainEvent
data class TaskCreatedEvent(
    val taskId: Long,
    val projectId: Long,
    val createdBy: Long
)

// Event handling
@EventHandler
class TaskNotificationHandler {
    fun handle(event: TaskCreatedEvent): Mono<Void> { }
}
```

## Configuration Structure

### Environment Files
- `application.yml` - Base configuration
- `application-dev.yml` - Development (local PostgreSQL/Redis)
- `application-prod.yml` - Production settings
- `application-test.yml` - Test environment

### Auto-Configuration Classes
- `DomainAutoConfiguration` - Core business services, events
- `InfrastructureAutoConfiguration` - Database, Redis, external services
- `ApplicationAutoConfiguration` - Use case services
- `WebAutoConfiguration` - Controllers, security, filters

## Database Architecture

### Key Aggregates
- **User/UserProfile** - User management and profiles
- **Project/ProjectMember** - Project organization with RBAC
- **Task/TaskHistory** - Task management with audit trail
- **Team/TeamMember** - Team collaboration
- **Requirement** - AI-powered requirement analysis

### Schema Management
- SQL files in `bootstrap/src/main/resources/db/schema/`
- 40+ tables with comprehensive relationships
- Audit trails and change logging
- State machines for project/task workflows

## Development Guidelines

### Code Organization
1. **Follow DDD strictly** - Keep domain layer pure
2. **Use reactive patterns** - Mono/Flux throughout
3. **Implement proper error handling** - Custom exceptions in shared module
4. **Permission annotations** - Use `@RequireProjectPermission` / `@RequireTaskPermission`

### Code Style & Standards
- **Language**: Use Chinese for comments and responses when working with this codebase
- **Accuracy**: Ensure generated content is accurate and error-free
- **Verification**: Always check generated code for correctness

### Testing Strategy
```kotlin
// Reactive testing
@Test
fun `should create task successfully`() {
    StepVerifier.create(taskService.createTask(request))
        .expectNextMatches { task -> task.title == "Test Task" }
        .verifyComplete()
}

// Permission testing
@Test
fun `should deny access without permission`() {
    StepVerifier.create(service.getProject(projectId))
        .expectError(PermissionDeniedException::class.java)
        .verify()
}
```

### Build Commands
```bash
# Full build with quality checks
./gradlew clean build

# Build optimized JAR for production
./gradlew :bootstrap:bootJar

# Run specific module tests
./gradlew :domain:test
./gradlew :application:test
./gradlew :infrastructure:test

# Check code style
./gradlew ktlintCheck

# Static analysis
./gradlew detekt

# Generate native image (in bootstrap module)
./gradlew :bootstrap:nativeCompile

# Build with optimization (CDS + JVM tuning)
./build-and-optimize.sh

# Start optimized application
./start-optimized.sh

# Infrastructure management
./start-postgres.sh
./start-redis.sh
docker-compose up -d postgres redis
docker-compose stop postgres redis
```

## External Integrations

### LLM Integration (Dify)
- **Requirement Analysis** - AI-powered requirement processing
- **Multiple Analyzers** - Completeness, Priority, Workload, Task Breakdown
- **Async Processing** - Non-blocking AI service calls

```kotlin
@Service
class RequirementAnalysisApplicationService {
    fun analyzeRequirement(request: RequirementAnalysisRequest): Mono<LlmResultVO> {
        return llmService.analyze(request.content, AnalyzerTypeEnum.COMPLETENESS)
    }
}
```

### Email & Notifications
- SMTP configuration for email verification
- Reactive notification system
- Template-based email generation

## Performance & Deployment

### JVM Optimization
- **CDS (Class Data Sharing)** - Faster startup with shared class archives
- **G1GC** - Low-latency garbage collection
- **Compressed OOPs** - Memory optimization

### Container Deployment
```bash
# Infrastructure
docker-compose up -d postgres redis

# Application
./gradlew bootBuildImage
docker run -p 8080:8080 task-code-parent:latest
```

### Monitoring & Health
- Spring Actuator endpoints
- Reactive health indicators
- Custom metrics for business operations

## Permission System

### Available Annotations
```kotlin
// Project permissions
@RequireProjectPermission(
    permission = ProjectPermissions.PROJECT_VIEW,
    projectIdParam = "projectId",
    ownerOnly = false,
    message = "Access denied"
)

// Task permissions  
@RequireTaskPermission(
    permission = ProjectPermissions.TASK_EDIT,
    taskIdParam = "taskId",
    message = "Cannot edit this task"
)
```

### Permission Constants
Located in `domain/constants/ProjectPermissions.kt`:
- `PROJECT_VIEW`, `PROJECT_EDIT`, `PROJECT_DELETE`
- `TASK_VIEW`, `TASK_CREATE`, `TASK_EDIT`, `TASK_DELETE`
- `MEMBER_VIEW`, `MEMBER_ADD`, `MEMBER_REMOVE`

## Troubleshooting

### Common Issues
1. **Module dependency errors** - Check that annotations are in `shared`, aspects in `domain`
2. **R2DBC connection issues** - Verify PostgreSQL is running and accessible
3. **Permission errors** - Ensure `RequestContextHolder` has user context
4. **Native compilation** - Use Java 21 and ensure all dependencies support GraalVM

### Useful Commands
```bash
# Check dependency tree
./gradlew dependencies

# Verify project health
./gradlew checkHealth

# Clean build caches
./gradlew clean --refresh-dependencies
```

## Recent Changes

The project has been optimized with a **non-intrusive permission system** that uses AOP and annotations instead of manual permission checks in business logic. This makes the code cleaner and more maintainable while providing robust security controls.

Key files for permissions:
- `shared/src/main/kotlin/com/task/shared/annotation/` - Permission annotations
- `domain/src/main/kotlin/com/task/domain/aspect/PermissionAspect.kt` - AOP implementation
- `docs/non-intrusive-permission-guide.md` - Detailed usage guide
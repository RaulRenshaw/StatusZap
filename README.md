# Serviço Rápido — Backend API

API REST para gerenciamento de Ordens de Serviço (OS) para pequenos negócios.

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Java | 21 | Linguagem |
| Spring Boot | 4.0.5 | Framework |
| Spring Security | 7.x | Autenticação + Autorização |
| jjwt | 0.12.6 | Tokens JWT |
| Spring Data JPA / Hibernate | 7.x | Persistência |
| PostgreSQL | 16 | Banco de dados |
| Bucket4j | 8.14 | Rate limiting |
| Lombok | latest | Boilerplate |
| Docker Compose | — | Ambiente de desenvolvimento |

---

## Estrutura de Pacotes

```
src/main/java/status/zap/Application/
│
├── Application.java                  # Entry point
│
├── auth/                             # Autenticação e usuários
│   ├── config/
│   │   ├── SecurityConfig.java       # Filtros, CORS, PasswordEncoder
│   │   ├── JwtUtil.java              # Geração e validação de tokens
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── RateLimitFilter.java      # 10 req/min por IP em /api/auth/**
│   │   ├── RateLimitConfig.java
│   │   └── CorsProperties.java
│   ├── controller/
│   │   └── AuthController.java       # POST /api/auth/register|login|logout
│   ├── dto/
│   │   ├── LoginRequestDTO.java
│   │   ├── RegisterRequestDTO.java
│   │   ├── AuthResponseDTO.java      # { user, session }
│   │   ├── UserResponse.java
│   │   ├── SessionResponse.java
│   │   └── AuthenticatedUser.java    # Principal injetado via @AuthenticationPrincipal
│   ├── model/
│   │   ├── UserEntity.java           # Tabela: users
│   │   └── enums/UserRole.java       # USER | ADMIN
│   ├── repository/
│   │   └── UserRepository.java
│   └── service/
│       ├── AuthService.java          # register, login, logout
│       └── AccountLockService.java   # Bloqueio temporário após 5 falhas
│
├── order/                            # Ordens de Serviço (domínio principal)
│   ├── controller/
│   │   ├── OrderController.java      # /api/orders — autenticado
│   │   └── PublicController.java     # /api/public — sem auth
│   ├── dto/
│   │   ├── OrderResponseDTO.java
│   │   ├── CreateOrderRequestDTO.java
│   │   ├── UpdateOrderRequestDTO.java
│   │   ├── UpdateOrderStatusRequestDTO.java
│   │   ├── StatusEventDTO.java
│   │   ├── PublicTrackingResponseDTO.java
│   │   └── OrderUpdatedEventDTO.java # Payload do SSE
│   ├── events/
│   │   ├── OrderStatusChangedEvent.java
│   │   └── OrderStatusChangedListener.java  # Dispara SSE após commit
│   ├── model/
│   │   ├── ServiceOrder.java         # Tabela: service_order
│   │   ├── StatusEvent.java          # Tabela: status_event
│   │   └── enums/OrderStatus.java    # recebido|analise|conserto|pronto|entregue
│   ├── repository/
│   │   └── OrderRepository.java
│   ├── service/
│   │   └── OrderService.java
│   └── sse/
│       └── SseService.java           # Server-Sent Events por publicToken
│
├── profile/                          # Perfil da loja
│   ├── controller/
│   │   └── ProfileController.java    # GET|PUT /api/profile, POST /api/profile/logo
│   ├── dto/
│   │   ├── ProfileRequestDTO.java
│   │   └── ProfileResponseDTO.java
│   ├── model/
│   │   └── ProfileEntity.java        # Tabela: profile
│   ├── repository/
│   │   └── ProfileRepository.java
│   └── service/
│       └── ProfileService.java
│
├── admin/                            # Painel administrativo
│   ├── controller/
│   │   └── AdminController.java      # GET /api/admin/metrics|accounts
│   ├── dto/
│   │   ├── AdminMetricsDTO.java
│   │   └── AdminAccountDTO.java
│   └── service/
│       └── AdminService.java
│
└── commons/                          # Compartilhado
    ├── exception/
    │   ├── GlobalExceptionHandler.java
    │   ├── ErrorResponse.java
    │   ├── ResourceNotFoundException.java
    │   ├── ConflictException.java
    │   └── ForbiddenException.java
    └── storage/
        ├── StorageService.java       # Interface (pronto para S3)
        └── LocalStorageService.java  # Implementação em disco local
```

---

## Como rodar

### Pré-requisitos

- Java 21
- Docker + Docker Compose
- Maven (ou use o wrapper `./mvnw`)

### 1. Variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env e defina JWT_SECRET com pelo menos 32 caracteres aleatórios
```

### 2. Subir o banco de dados

```bash
docker compose up db -d
```

### 3. Rodar a aplicação

```bash
# Com Maven
JWT_SECRET=sua-chave-aqui mvn spring-boot:run

# Ou com Docker Compose completo
docker compose up --build
```

A API fica disponível em `http://localhost:8080`.

---

## Fluxos principais

### Fluxo de autenticação

```
Cliente                     API                         Banco
  │                          │                            │
  │── POST /api/auth/register ──>                         │
  │   { email, password, shopName }                       │
  │                          │── INSERT users ──────────>│
  │                          │── INSERT profile ─────────>│
  │<── 201 { user, session } ──                           │
  │   session.token = JWT                                 │
  │                          │                            │
  │── POST /api/auth/login ──>                            │
  │   { email, password }    │                            │
  │                          │── SELECT users ───────────>│
  │                          │   BCrypt.matches()         │
  │<── 200 { user, session } ──                           │
  │                          │                            │
  │── POST /api/auth/logout ──>                           │
  │   Authorization: Bearer <token>                       │
  │<── 204 No Content ───────                             │
```

**Proteção de conta:** após 5 senhas erradas, a conta é bloqueada por 15 minutos automaticamente.

**Rate limiting:** máximo 10 requisições/minuto por IP em `/api/auth/**`.

---

### Fluxo de criação de OS

```
Dono da Loja                API                         Banco
  │                          │                            │
  │── POST /api/orders ─────>│                            │
  │   Authorization: Bearer <token>                       │
  │   { customerName, device, observations, ... }         │
  │                          │── Valida JWT ──────────────│
  │                          │── generateUniqueToken()    │
  │                          │── INSERT service_order ───>│
  │                          │── INSERT status_event ────>│
  │                          │   (status: "recebido")     │
  │<── 201 { order } ────────│                            │
  │   order.publicToken = token para o cliente            │
```

---

### Fluxo de atualização de status

```
Dono da Loja                API                         Cliente (SSE)
  │                          │                            │
  │                          │<── GET /api/public/stream/:token (SSE)
  │                          │    conexão mantida aberta  │
  │                          │──────────────────────────>│ connected
  │                          │                            │
  │── PATCH /api/orders/:id/status ──>                    │
  │   { status: "pronto", note: "Trocamos a tela" }       │
  │                          │── UPDATE service_order     │
  │                          │── INSERT status_event      │
  │                          │── COMMIT                   │
  │                          │── publishEvent() ─────────>Listener
  │<── 200 { order } ────────│                 SSE.send() │
  │                          │──────────────────────────>│ status-changed
  │                          │                         { orderId, status, updatedAt }
```

O SSE dispara **após o commit** da transação (`@TransactionalEventListener(AFTER_COMMIT)`) — sem risco de notificar antes de persistir.

---

### Fluxo de rastreamento público (cliente)

```
Cliente da OS               API                         Banco
  │                          │                            │
  │── GET /api/public/:token ──>                          │
  │   (link compartilhado pelo dono)                      │
  │                          │── SELECT service_order ───>│
  │                          │── SELECT profile ─────────>│
  │<── 200 { order, profile }──                           │
  │                          │                            │
  │── GET /api/public/:slug/:shortToken ──>               │
  │   (link amigável: /techfix/abc123)                    │
  │                          │── SELECT profile by slug ─>│
  │                          │── SELECT order by userId + shortToken
  │<── 200 { order, profile }──                           │
```

---

### Fluxo de upload de logo

```
Dono da Loja                API                         Disco/S3
  │                          │                            │
  │── POST /api/profile/logo ──>                          │
  │   Authorization: Bearer <token>                       │
  │   multipart/form-data: file=logo.png                  │
  │                          │── Valida tipo (PNG/JPEG/WebP)
  │                          │── Valida tamanho (≤ 2MB)   │
  │                          │── UUID.randomUUID() + ext  │
  │                          │── Files.copy() ───────────>│
  │                          │── DELETE arquivo antigo    │
  │                          │── UPDATE profile.logoUrl   │
  │<── 200 { logoUrl } ──────│                            │
  │                          │                            │
  │── PUT /api/profile ──────>                            │
  │   { name, slug, ... logoUrl: <url retornada> }        │
  │<── 200 { profile } ──────│                            │
```

---

## Endpoints

### Autenticação (sem auth)

| Método | Endpoint | Body | Retorno |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, shopName? }` | `201 { user, session }` |
| POST | `/api/auth/login` | `{ email, password }` | `200 { user, session }` |
| POST | `/api/auth/logout` | — | `204` |

### Ordens de Serviço (🔒 Bearer token)

| Método | Endpoint | Body | Retorno |
|---|---|---|---|
| GET | `/api/orders` | — | `200 [ OrderResponseDTO ]` |
| POST | `/api/orders` | `CreateOrderRequestDTO` | `201 OrderResponseDTO` |
| GET | `/api/orders/:id` | — | `200 OrderResponseDTO` |
| PATCH | `/api/orders/:id` | `UpdateOrderRequestDTO` | `200 OrderResponseDTO` |
| PATCH | `/api/orders/:id/status` | `{ status, note? }` | `200 OrderResponseDTO` |
| DELETE | `/api/orders/:id` | — | `204` |

### Perfil (🔒 Bearer token)

| Método | Endpoint | Body | Retorno |
|---|---|---|---|
| GET | `/api/profile` | — | `200 ProfileResponseDTO` |
| PUT | `/api/profile` | `ProfileRequestDTO` | `200 ProfileResponseDTO` |
| POST | `/api/profile/logo` | `multipart: file` | `200 { logoUrl }` |

### Público (sem auth)

| Método | Endpoint | Retorno |
|---|---|---|
| GET | `/api/public/:token` | `200 { order, profile }` |
| GET | `/api/public/:slug/:shortToken` | `200 { order, profile }` |
| GET | `/api/public/stream/:token` | `SSE stream` |
| GET | `/api/profile/public/:slug` | `200 ProfileResponseDTO` |

### Admin (🔒 Bearer token + ROLE_ADMIN)

| Método | Endpoint | Retorno |
|---|---|---|
| GET | `/api/admin/metrics` | `200 AdminMetricsDTO` |
| GET | `/api/admin/accounts` | `200 [ AdminAccountDTO ]` |

---

## Segurança

- **Senhas:** BCrypt — nunca armazenadas em texto puro
- **Token:** JWT HS256, expiração em 24h (configurável via `JWT_EXPIRATION_MS`)
- **Secret:** obrigatoriamente via variável de ambiente `JWT_SECRET` — nunca commitado
- **Rate limit:** 10 req/min por IP em `/api/auth/**` (Bucket4j)
- **Bloqueio de conta:** 5 falhas de login → bloqueio de 15 min (automático)
- **IDOR:** `findAndAuthorize()` verifica ownership em toda operação de OS
- **CORS:** lista de origens configurável via `cors.allowed-origins` no yaml
- **Upload:** apenas PNG, JPEG e WebP (SVG removido — risco de XSS)
- **Autorização admin:** `@PreAuthorize("hasRole('ADMIN')")` no `AdminController`

### O que falta para produção

- [ ] **Token blacklist:** `logout()` atual não revoga o token. Implementar com Redis: `SET revoked:<jti> 1 EX <ttl-restante>`
- [ ] **Refresh token:** sessão de 24h sem renovação — implementar `POST /api/auth/refresh`
- [ ] **HTTPS:** obrigatório em produção (configure no load balancer ou proxy reverso)
- [ ] **Migrations com Flyway:** trocar `ddl-auto: update` por `validate` + scripts SQL versionados

---

## Variáveis de ambiente

| Variável | Padrão | Obrigatória em prod |
|---|---|---|
| `JWT_SECRET` | — | ✅ Sim (mín. 32 chars) |
| `DB_URL` | `jdbc:postgresql://localhost:5433/appdb` | ✅ Sim |
| `DB_USER` | `appuser` | ✅ Sim |
| `DB_PASS` | `app123` | ✅ Sim |
| `FRONT_URL` | `http://localhost:5173` | ✅ Sim |
| `PORT` | `8080` | Não |
| `DDL_AUTO` | `update` | Sim (`validate` em prod) |
| `SHOW_SQL` | `false` | Não |
| `STORAGE_DIR` | `uploads` | Não |
| `STORAGE_URL` | `http://localhost:8080/uploads` | Sim |

---

## Renomeações realizadas

| Antes | Depois | Motivo |
|---|---|---|
| `UsersEntity` | `UserEntity` | Singular; entidade representa um registro |
| `UsersService` | `AuthService` | Nome expressa responsabilidade |
| `UsersController` | `AuthController` | Idem |
| `UsersRepository` | `UserRepository` | Singular |
| `ObjetoService` | `ServiceOrder` | Nome genérico e confuso → domínio claro |
| `ServiceService` | `OrderService` | Evita repetição e confusão |
| `ServiceController` | `OrderController` | Idem |
| `ServiceRepository` | `OrderRepository` | Idem |
| `StatusServico` | `OrderStatus` | Inglês consistente com o resto |
| `Roles` | `UserRole` | Singular + contexto |
| `failed_attempts` | `failedAttempts` | camelCase Java |
| `estimatedReadAt` | `estimatedReadyAt` | Correção semântica |
| `statusServico` (campo) | `status` | Redundância removida |
| `ServiceStatusChangedEvent` | `OrderStatusChangedEvent` | Consistência |
| `ServiceUpdatedEvent` | `OrderUpdatedEventDTO` | Sufixo DTO explícito |
| `objeto_service` (tabela) | `service_order` | SQL legível |
| `short_` (parâmetro) | `shortToken` | Nome descritivo |

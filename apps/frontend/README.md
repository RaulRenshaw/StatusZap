# Serviço Rápido — Frontend

Sistema de acompanhamento de serviços para pequenos negócios.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + shadcn/ui
- React Router v6
- TanStack Query

## Estrutura de pastas

```
src/
├── App.tsx                     # Roteamento raiz
├── main.tsx
├── index.css
│
├── lib/
│   └── store.ts                # Camada de dados (stubs prontos para backend)
│
├── modules/                    # Funcionalidades por domínio
│   ├── auth/
│   │   ├── hooks/
│   │   │   ├── use-auth.tsx    # Context de autenticação (sem Supabase)
│   │   │   └── use-is-admin.ts
│   │   └── pages/
│   │       └── Auth.tsx
│   ├── repairs/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/           # Stubs de serviços (prontos para backend)
│   │   ├── service.ts          # Barrel de tipos
│   │   └── types.ts            # Tipos de domínio
│   ├── dashboard/
│   ├── profile/
│   ├── admin/
│   └── publicTracking/
│
└── shared/
    ├── components/
    │   ├── ui/                 # shadcn/ui components
    │   ├── AppLayout.tsx
    │   ├── ProtectedRoute.tsx
    │   └── ...
    ├── hooks/
    │   ├── use-store.ts        # Barrel de hooks de dados
    │   └── use-toast.ts
    ├── services/
    │   └── api.ts              # Cliente HTTP base (pronto para conectar backend)
    └── utils/
```

## Rodando o projeto

```bash
# Instale as dependências
npm install

# Copie o env de exemplo
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

O app roda em `http://localhost:8080`.

## Conectando o backend

Todo o acesso a dados passa por `src/lib/store.ts`.  
Cada método tem um comentário `TODO:` com o endpoint sugerido.

O cliente HTTP base está em `src/shared/services/api.ts`.

### Autenticação

- `src/modules/auth/hooks/use-auth.tsx` — substituir os stubs por chamadas reais à sua API de auth.
- O token de sessão deve ser injetado no header `Authorization` das requests em `src/shared/services/api.ts`.

### Dados

| Método em store.ts | Endpoint sugerido |
|---|---|
| `list()` | `GET /services` |
| `get(id)` | `GET /services/:id` |
| `create(input)` | `POST /services` |
| `update(id, patch)` | `PATCH /services/:id` |
| `setStatus(id, status)` | `PATCH /services/:id/status` |
| `remove(id)` | `DELETE /services/:id` |
| `getPublicTracking(token)` | `GET /public/:token` |
| `getProfile()` | `GET /profile` |
| `saveProfile(profile)` | `PUT /profile` |
| `uploadLogo(file)` | `POST /profile/logo` |

## Build

```bash
npm run build
# Saída em ./dist
```

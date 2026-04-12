# Infrastructure Agent Guide

> 本文档定义了 Infratructure 相关的 Agent 工作规范。

## 目录结构

```
infra/
├── aspire-local-dev/      # 本地开发环境 (Aspire AppHost)
├── aspire-docker-compose/ # Docker Compose 部署输出
└── AGENTS.md             # 本文档
```

## Aspire 概览

Aspire 用于编排分布式应用程序的依赖关系和生命周期管理。

**核心概念**:
- **AppHost**: 应用入口，定义所有资源和依赖关系
- **Resource**: 应用组件 (容器、服务、项目等)
- **Reference**: 资源之间的引用关系
- **Docker Compose Environment**: 用于生成 docker-compose 部署文件

## 目录职责

### `infra/aspire-local-dev/` - 本地开发

用于本地开发调试，包含:
- `apphost.ts` - AppHost 入口
- `aspire.config.json` - Aspire 配置
- `package.json` - Node.js 依赖

**启动本地开发**:
```bash
cd infra/aspire-local-dev
aspire start
```

### `infra/aspire-docker-compose/` - Docker Compose 部署

用于生成生产部署的 docker-compose 文件。

## Apphost 编写规范

### 基本结构

```typescript
import { createBuilder } from './.modules/aspire.js';

const builder = await createBuilder();

// 添加资源
const cache = await builder.addRedis("cache");
const api = await builder.addProject('api', '../services/Api/Api.csproj', 'http');

// 设置依赖关系
await api.withReference(cache);

// 添加 Docker Compose 环境 (用于发布)
await builder.addDockerComposeEnvironment('env');

await builder.build().run();
```

### 常用资源类型

| 资源类型 | 方法 | 说明 |
|---------|------|------|
| Redis | `builder.addRedis(name)` | Redis 缓存服务 |
| PostgreSQL | `builder.addPostgres(name)` | PostgreSQL 数据库 |
| SQL Server | `builder.addSqlServer(name)` | SQL Server 数据库 |
| MySQL | `builder.addMySql(name)` | MySQL 数据库 |
| MongoDB | `builder.addMongoDB(name)` | MongoDB 数据库 |
| Container | `builder.addContainer(name, image, tag)` | 自定义容器 |
| Node App | `builder.addNodeApp(name, path, script)` | Node.js 应用 |
| .NET Project | `builder.addProject(name, path, endpoint)` | .NET 项目 |

### 资源引用 (Reference)

使用 `withReference()` 建立资源间的依赖关系:

```typescript
const api = await builder.addProject('api', '../Api/Api.csproj', 'http');
await api.withReference(cache);  // api 依赖 cache
await api.withReference(db);     // api 依赖 db
```

### Docker Compose 发布配置

```typescript
await builder.addDockerComposeEnvironment('env');

const api = await builder.addProject('api', '../Api/Api.csproj', 'http')
  .publishAsDockerComposeService((resource, service) => {
    service.name = 'api';
  });

const cache = await builder.addRedis('cache')
  .publishAsDockerComposeService((resource, service) => {
    service.name = 'redis';
  });
```

## 工作流程

### 1. 本地开发

```bash
# 启动 Aspire AppHost
cd infra/aspire-local-dev
aspire start

# 查看资源状态
aspire describe

# 查看日志
aspire logs [resource]
aspire otel logs [resource]

# 重启单个资源 (代码修改后)
aspire resource [resource] rebuild
```

### 2. 发布 Docker Compose

```bash
cd infra/aspire-local-dev

# 生成 docker-compose 文件 (不构建镜像)
aspire publish

# 准备环境并构建镜像
aspire do prepare-compose --environment staging

# 部署
aspire deploy

# 清理
aspire do docker-compose-down-env
```

### 3. 添加新集成

```bash
# 搜索可用集成
aspire docs search <keyword>

# 添加集成 (如 Redis)
aspire add redis

# 重启 AppHost 使更改生效
aspire start
```

## 常用命令参考

| 任务 | 命令 |
|------|------|
| 启动 | `aspire start` |
| 启动 (隔离) | `aspire start --isolated` |
| 等待资源健康 | `aspire wait <resource>` |
| 停止 | `aspire stop` |
| 查看资源 | `aspire describe` |
| 查看日志 | `aspire logs [resource]` |
| 查看结构化日志 | `aspire otel logs [resource>` |
| 重置资源 | `aspire resource <resource> rebuild` |
| 添加集成 | `aspire add <integration>` |
| 搜索文档 | `aspire docs search <query>` |
| 发布 | `aspire publish` |
| 部署 | `aspire deploy` |
| 构建镜像 | `aspire do push` |

## 文档参考

- Aspire 官方文档: https://aspire.dev
- Microsoft Learn: https://learn.microsoft.com/microsoft/aspire
- 使用 `aspire docs search <keyword>` 查找集成文档

## 重要规则

1. **修改 AppHost 后重启**: `aspire start`
2. **修改 .NET 项目后重建**: `aspire resource <name> rebuild`
3. **优先使用 `--isolated`**: 在 worktree 中开发时避免端口冲突
4. **善用 `aspire docs`**: 查找 API 文档和集成指南
5. **不要安装 Aspire workload**: Aspire workload 已过时

## 输出目录配置

`aspire-docker-compose` 目录预留给 Docker Compose 部署输出。运行 `aspire publish` 或 `aspire deploy` 时，输出文件将生成到指定目录。

# MCP Integration Platform - Rust Backend

This is the high-performance Rust backend for the MCP Integration Platform. It implements the core agent system, API endpoints, and MCP protocol handling.

## 🏗️ Architecture

The backend is organized into several key modules:

- **`agents/`** - AI agent implementations and management
- **`api/`** - REST API handlers and middleware
- **`infrastructure/`** - Database, MCP protocol, and external services
- **`coordination/`** - Task orchestration and execution engine
- **`monitoring/`** - Metrics, tracing, and health checks

## 🚀 Quick Start

### Prerequisites

- Rust 1.70+
- PostgreSQL 14+
- Redis (optional, for caching)

### Development Setup

1. **Install dependencies:**
   ```bash
   cargo build
   ```

2. **Set up configuration:**
   ```bash
   cp configs/development.toml.example configs/development.toml
   # Edit configs/development.toml with your database credentials
   ```

3. **Run database migrations:**
   ```bash
   sqlx migrate run
   ```

4. **Start the server:**
   ```bash
   cargo run
   ```

The server will start on `http://localhost:8080`

## 📊 API Documentation

The API documentation is available at `http://localhost:8080/swagger-ui/` when running the server.

## 🧪 Testing

```bash
# Run unit tests
cargo test

# Run integration tests
cargo test --features integration-tests

# Run with coverage
cargo tarpaulin --out Html
```

## 🐳 Docker

```bash
# Build image
docker build -t mcp-platform .

# Run container
docker run -p 8080:8080 -p 3000:3000 mcp-platform
```

## 📋 Configuration

Configuration is handled through TOML files in the `configs/` directory:

- `development.toml` - Development environment
- `production.toml` - Production environment
- `mcp.toml` - MCP protocol settings

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `RUST_LOG` | Log level | `info` |
| `DATABASE_URL` | PostgreSQL connection | Required |
| `REDIS_URL` | Redis connection | Optional |
| `MCP_SERVER_PORT` | MCP server port | `3000` |

## 🏭 Production Deployment

See the [Production Deployment Guide](../docs/deployment/PRODUCTION_DEPLOYMENT_PLAN.md) for detailed instructions.

## 🤝 Contributing

See the main [Contributing Guide](../docs/development/contribution-guidelines.md) for details.
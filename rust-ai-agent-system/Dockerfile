# Multi-stage build for production
FROM rust:1.70 as builder

WORKDIR /app

# Copy dependency files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Copy source code
COPY src ./src
COPY configs ./configs

# Build the application
RUN touch src/main.rs
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1001 appuser

# Copy the binary
COPY --from=builder /app/target/release/mcp-platform /usr/local/bin/mcp-platform

# Copy configuration files
COPY --from=builder /app/configs /app/configs

# Set proper permissions
RUN chown -R appuser:appuser /app
USER appuser

WORKDIR /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
EXPOSE 3000

CMD ["mcp-platform"]
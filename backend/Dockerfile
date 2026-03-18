# Stage 1: Build
FROM golang:1.21-bullseye AS builder

# Install TensorFlow C library dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Download and install TensorFlow C library
RUN curl -L https://storage.googleapis.com/tensorflow/libtensorflow/libtensorflow-cpu-linux-x86_64-2.15.0.tar.gz | tar -C /usr/local -xz
RUN ldconfig

WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary
RUN go build -o main ./server.go

# Stage 2: Runtime
FROM debian:bullseye-slim

# Install runtime dependencies for TensorFlow
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy TensorFlow C library from builder
COPY --from=builder /usr/local/lib/libtensorflow.so* /usr/local/lib/
RUN ldconfig

WORKDIR /app

# Copy the built binary
COPY --from=builder /app/main .

# Copy models and storage directories
COPY --from=builder /app/ml/models ./ml/models
RUN mkdir -p storage/results

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]

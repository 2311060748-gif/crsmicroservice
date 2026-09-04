# Stage 1: Build Frontend bằng Node.js
FROM node:22-alpine AS builder
WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm install

# Copy source code và build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve bằng Nginx gọn nhẹ
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Xóa trang mặc định của Nginx
RUN rm -rf ./*

# Copy build artifacts từ Stage 1
COPY --from=builder /app/dist .

# Copy file cấu hình Nginx SPA & Reverse Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# 1. 使用官方 Node.js 镜像作为基础镜像
FROM node:20-bullseye AS base

# 2. 设置工作目录
WORKDIR /app

# 3. 复制 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 4. 安装依赖（使用 npm ci 保证一致性）
RUN npm ci --omit=dev

# 5. 复制全部项目文件（.dockerignore 会自动忽略 node_modules/.next 等）
COPY . .

# 6. 清理缓存并重建二进制依赖，兼容 ARM64 lightningcss
RUN npm cache clean --force \
    && npm rebuild \
    && npm run build

# 7. 使用更小的镜像仅运行产物
FROM node:20-bullseye AS runner
WORKDIR /app

# 8. 仅复制生产依赖和 .next 静态产物
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./
COPY --from=base /app/next.config.* ./
COPY --from=base /app/next-env.d.ts ./
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/app ./app
COPY --from=base /app/components ./components
COPY --from=base /app/utils ./utils

# 9. 设置环境变量（可选：生产模式）
ENV NODE_ENV=production
# 10. 设置默认端口
ENV PORT=3000

# 11. 启动 Next.js 应用
CMD ["npx", "next", "start"]

# 12. 开放端口
EXPOSE 3000

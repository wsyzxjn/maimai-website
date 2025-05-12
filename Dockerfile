# 1. 依赖安装阶段，仅用于缓存依赖层
FROM node:20-bullseye AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2. 构建产物阶段，重新安装依赖以确保架构一致
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
RUN npm rebuild lightningcss
COPY . .
RUN npm run build

# 3. 生产运行阶段
FROM node:20-bullseye AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
COPY next.config.* ./
COPY next-env.d.ts* ./
COPY tsconfig.json ./
COPY app ./app
COPY components ./components
COPY utils ./utils
ENV NODE_ENV=production
ENV PORT=3000
CMD ["npx", "next", "start"]
EXPOSE 3000

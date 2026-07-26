FROM node:20-bookworm-slim

WORKDIR /app

# Prisma butuh OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy all source
COPY package*.json prisma ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NODE_ENV=development
ENV SKIP_ENV_VALIDATION=true

EXPOSE 3000

# Startup: push schema, lalu dev server
CMD ["sh", "-c", "npx prisma db push && npm run dev"]

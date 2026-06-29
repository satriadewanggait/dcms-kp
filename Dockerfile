FROM node:20-alpine

WORKDIR /app

# Copy dependency files AND prisma schema (biar postinstall prisma generate gak gagal)
COPY package*.json prisma ./

RUN npm install

# Copy the rest of the source
COPY . .

EXPOSE 3000

# Start: push DB schema, then run dev server with hot reload
CMD ["sh", "-c", "npx prisma db push && npm run dev"]

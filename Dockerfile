# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Placeholder vars satisfy prisma.config.ts during build (no DB connection is made)
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DIRECT_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# Generate Prisma Client and build (the pre-build script also runs prisma generate)
RUN yarn build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Copy Prisma schema and generate client for production
RUN DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder \
    DIRECT_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder \
    npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"]

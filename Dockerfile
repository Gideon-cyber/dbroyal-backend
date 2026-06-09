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

# Generate Prisma Client
RUN npx prisma generate

# Build the application
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
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main.js"]

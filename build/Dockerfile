###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:22-alpine AS development

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies including devDependencies
RUN npm ci

# Copy application source
COPY --chown=node:node . .

# Generate Prisma Client
RUN npx prisma generate

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################
FROM node:22-alpine AS build

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./

# Copy node_modules from development stage
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Set NODE_ENV
ENV NODE_ENV=production

# Install only production dependencies and clean cache
RUN npm ci --only=production --omit=dev && npm cache clean --force

USER node

###################
# PRODUCTION
###################
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling and tini
RUN apk add --no-cache dumb-init tini

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./

# Copy production dependencies from build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules

# Copy built application from build stage
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Copy Prisma schema and migrations (needed for runtime)
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Use the node user from the image (instead of the root user)
USER node

# Expose the port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly (PID 1 problem)
# This ensures graceful shutdown on SIGTERM/SIGINT
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

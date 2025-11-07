FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY package.json yarn.lock ./
COPY apps/verifier-api/package.json ./apps/verifier-api/
COPY packages/agenticdid-sdk/package.json ./packages/agenticdid-sdk/
COPY packages/midnight-adapter/package.json ./packages/midnight-adapter/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source
COPY apps/verifier-api ./apps/verifier-api
COPY packages ./packages

# Build
RUN yarn --cwd apps/verifier-api build

# Expose port
EXPOSE 8787

# Start
CMD ["node", "apps/verifier-api/dist/index.js"]

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template (PORT is substituted at runtime)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Render injects $PORT at runtime; default to 10000 for local docker run
ENV PORT=10000
EXPOSE 10000

# Substitute $PORT in the template, then start nginx
CMD ["/bin/sh", "-c", \
  "envsubst '$PORT' < /etc/nginx/templates/default.conf.template \
   > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx /tmp && \
    chmod -R 755 /usr/share/nginx/html

USER nginx
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

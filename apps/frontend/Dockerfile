FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ARG VITE_APP_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_URL=${VITE_APP_URL}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run typecheck && npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD [ "wget", "-qO-", "http://localhost/healthz" ]

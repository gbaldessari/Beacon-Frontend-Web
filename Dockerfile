FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_BACK_URL=http://localhost:3000
ENV VITE_BACK_URL=${VITE_BACK_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

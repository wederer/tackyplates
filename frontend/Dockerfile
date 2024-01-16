FROM node:16-alpine AS builder

WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --pure-lockfile --network-timeout 600000

COPY public ./public/
COPY src ./src/
RUN yarn build

FROM nginx:stable-alpine
COPY --from=builder ./app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


FROM node:22-alpine as build

WORKDIR /app

COPY package.json ./
RUN yarn

COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json .

RUN yarn build --production

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

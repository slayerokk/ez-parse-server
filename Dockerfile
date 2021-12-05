FROM node:14-alpine AS BUILD_IMAGE
RUN apk --no-cache add curl openssh git
RUN apk update && apk upgrade
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | /bin/sh -s -- -b /usr/local/bin
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci --only=production
RUN /usr/local/bin/node-prune

FROM mhart/alpine-node:slim-12
WORKDIR /usr/app
COPY --from=BUILD_IMAGE /usr/app ./
COPY . .
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "-r", "esm", "./node_modules/moleculer/bin/moleculer-runner.js", "services"]
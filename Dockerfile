FROM node:8-alpine AS BUILD_IMAGE
RUN apk --no-cache add curl
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | /bin/sh -s -- -b /usr/local/bin
WORKDIR /usr/app
COPY package.json package-lock.json ./
RUN npm ci
RUN /usr/local/bin/node-prune

FROM mhart/alpine-node:slim-10.22
WORKDIR /usr/app
COPY --from=BUILD_IMAGE /usr/app ./
COPY ./.server ./src
EXPOSE 44235

CMD ["node", "./node_modules/moleculer/bin/moleculer-runner.js"]
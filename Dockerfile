FROM mhart/alpine-node:slim-12
WORKDIR /usr/app
RUN apk --no-cache add curl
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | /bin/sh -s -- -b /usr/local/bin
COPY . .
RUN /usr/local/bin/node-prune
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "-r", "esm", "./node_modules/moleculer/bin/moleculer-runner.js", "services"]
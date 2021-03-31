FROM --platform=linux/amd64 node:14-alpine

RUN apk --no-cache add bash
RUN npm i -g yarn --force
RUN yarn install

RUN mkdir -p /project/ute-issuer-api
COPY ["package.json", "yarn.lock", "ormconfig.ts", "tsconfig.json", "./"]
RUN yarn install

COPY ["./bin", "./src", "./"]

WORKDIR /project/ute-issuer-api

CMD ["/bin/bash","-c", "yarn typeorm:migrate && bin/ute-issuer-api"]

FROM --platform=linux/amd64 node:14-alpine

WORKDIR /project/ute-issuer-api

RUN apk --no-cache add bash
RUN npm i -g yarn --force

COPY ["package.json", "yarn.lock", "/project/ute-issuer-api/"]
RUN yarn install
COPY . .

CMD ["/bin/bash","-c", "pwd && ls -lah && yarn typeorm:migrate && /project/ute-issuer-api/bin/ute-issuer-api"]

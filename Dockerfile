FROM node:14-alpine

RUN apk --no-cache add bash
RUN npm i -g yarn --force
RUN mkdir /var/deployment
COPY ./ /var/deployment

WORKDIR /var/deployment/apps/ute-issuer-api

CMD ["/bin/bash","-c", "yarn migrate:docker && bin/ute-issuer-api"]

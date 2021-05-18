FROM node:lts-alpine
WORKDIR /opt/project
COPY . .
RUN npm install
ENTRYPOINT [ "node", "serv.mjs" ]
FROM node:10.15.0-alpine

WORKDIR /opt/jmwebapp
COPY yarn.lock ./
COPY package.json ./
RUN yarn install --production
COPY . .

EXPOSE 8888

CMD ["yarn", "start"]
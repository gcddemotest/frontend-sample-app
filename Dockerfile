FROM node:12-alpine

EXPOSE 8080
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY dist/ dist/

CMD [ "npm", "start" ]

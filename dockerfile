FROM node:18-alpine

RUN apk --no-cache add make gcc g++ python3

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --frozen-lock-file

RUN npm rebuild bcrypt --build-from-source

RUN apk del make gcc g++ python3

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
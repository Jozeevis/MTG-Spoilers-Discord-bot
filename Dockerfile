FROM node:lts

WORKDIR app/

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

WORKDIR app/src/

CMD ["npm", "start", "run"]

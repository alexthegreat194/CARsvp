FROM node:latest
WORKDIR .
COPY package.json .
RUN npm install
COPY . .

ENV PORT 80

CMD ["npm", "start"]

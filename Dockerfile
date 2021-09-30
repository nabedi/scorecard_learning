FROM node:14

EXPOSE 4500

RUN npm install npm@latest -g

COPY package.json package-lock.json* ./

RUN npm install --no-optional && npm cache clean --force

WORKDIR /app

COPY . .

CMD ["node", "app.js"]
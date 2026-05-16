FROM node:24-alpine

RUN addgroup -S nodejs && adduser -S express -G nodejs

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

RUN chown -R express:nodejs /app

USER express

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
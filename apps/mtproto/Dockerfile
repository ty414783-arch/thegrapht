FROM node:22-alpine

WORKDIR /app

COPY apps/mtproto apps/mtproto

WORKDIR /app/apps/mtproto

EXPOSE 3100

CMD ["node", "src/index.js"]

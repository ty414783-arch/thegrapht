FROM node:22-alpine

WORKDIR /app

COPY apps/frontend apps/frontend
COPY res res

WORKDIR /app/apps/frontend

EXPOSE 5173

CMD ["node", "src/index.js"]

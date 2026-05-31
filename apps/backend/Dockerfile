FROM node:20-bookworm-slim AS deps

ENV npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false

WORKDIR /app/apps/backend

COPY apps/backend/package.json apps/backend/package-lock.json ./

RUN npm ci --omit=dev

FROM deps AS test

WORKDIR /app

COPY apps/backend/src apps/backend/src
COPY apps/backend/test apps/backend/test
COPY apps/frontend/src apps/frontend/src
COPY scripts/check-generated-client.mjs scripts/check-generated-client.mjs

WORKDIR /app/apps/backend

RUN npm test

CMD ["npm", "test"]

FROM deps AS runtime

WORKDIR /app/apps/backend

COPY apps/backend/src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]

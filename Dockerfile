# Image tag must match the Playwright version in package-lock.json
FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV TEST_ENV=staging
ENV HEADLESS=true
ENV CI=true

CMD ["npm", "test"]

FROM node:20-slim

RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    git \
    fonts-liberation \
    fonts-noto \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /app

COPY package.json ./
RUN npm install

# Install chrome-headless-shell for HyperFrames optimized render path
RUN npx @puppeteer/browsers install chrome-headless-shell@stable --path /app/.chrome || true
ENV PRODUCER_HEADLESS_SHELL_PATH=/app/.chrome/chrome-headless-shell/linux-*/chrome-headless-shell/chrome-headless-shell

RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads renders compositions/projects music/library music/generated static

RUN node --input-type=module < scripts/download-music.js || true

EXPOSE 7860
CMD ["node", "server.js"]

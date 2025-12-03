---
title: n8n Docker 部署
description: 使用 Docker 部署 n8n 自动化工作流
---

This guide explains how to deploy [n8n](https://n8n.io/) (Workflow Automation Tool) using Docker Compose with a PostgreSQL database.

## 1. Prerequisites

Ensure Docker and Docker Compose are installed.

**Ubuntu:**
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

## 2. Configuration

Create a file named `docker-compose.yml` with the following content.

:::note[重要]
Replace the placeholder values (e.g., `xxx.xxx`, `your_email`, `smtp_password`) with your actual configuration.
:::

```yaml
version: "3"

networks:
  n8n:
    external: false

volumes:
  db_storage:
  n8n_storage:

services:
  # PostgreSQL Database
  n8n_db:
    image: postgres:13
    container_name: n8n_db
    restart: unless-stopped
    networks:
      - n8n
    environment:
      TZ: "Asia/Shanghai"
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n_password  # Change this
      POSTGRES_DB: n8n
    volumes:
      - db_storage:/var/lib/postgresql/data
    logging:
      options:
        max-size: "1m"

  # n8n Service
  n8n_service:
    image: n8nio/n8n
    container_name: n8n_service
    restart: unless-stopped
    depends_on:
      - n8n_db
    environment:
      GENERIC_TIMEZONE: "Asia/Shanghai"
      TZ: "Asia/Shanghai"
      
      # n8n Host Configuration
      N8N_HOST: "n8n.example.com"
      N8N_PORT: 5678
      N8N_PROTOCOL: "https"
      NODE_ENV: "production"
      WEBHOOK_URL: "https://n8n.example.com"
      
      # Database Configuration
      DB_TYPE: "postgresdb"
      DB_POSTGRESDB_HOST: "n8n_db"
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: "n8n"
      DB_POSTGRESDB_USER: "n8n"
      DB_POSTGRESDB_PASSWORD: "n8n_password"  # Must match POSTGRES_PASSWORD above
      
      # Email Configuration (Optional)
      N8N_EMAIL_MODE: "smtp"
      N8N_SMTP_HOST: "smtp.example.com"
      N8N_SMTP_PORT: 587
      N8N_SMTP_USER: "user@example.com"
      N8N_SMTP_PASS: "smtp_password"
      N8N_SMTP_SENDER: "n8n <user@example.com>"
    ports:
      - "5678:5678"
    networks:
      - n8n
    volumes:
      - n8n_storage:/home/node/.n8n
    logging:
      options:
        max-size: "1m"
```

## 3. Deployment

Start the services in the background:

```bash
docker-compose up -d
```

Access n8n at `https://n8n.example.com` (or `http://localhost:5678` if running locally and protocol is set to http).

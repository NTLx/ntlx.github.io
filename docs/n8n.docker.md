# Deploy n8n via docker

## Prepare Docker

In Ubuntu, just run:

```shell
sudo apt install docker-compose
sudo usermod -aG docker $USER
```

## Deploy n8n

```yaml
version: "3"
networks:
  n8n:
    external: false
volumes:
  db_storage:
  n8n_storage:
services:
  n8n_db:
    image: postgres:13
    container_name: n8n_db
    restart: unless-stopped
    # ports:
    #   - "5432:5432"
    networks:
      - n8n
    environment:
      TZ: "Asia/Shanghai"
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n
      POSTGRES_DB: n8n
    volumes:
      - db_storage:/var/lib/postgresql/data
    logging:
      options:
        max-size: "1m"
  n8n_service:
    image: n8nio/n8n
    container_name: n8n_service
    restart: unless-stopped
    depends_on:
      - n8n_db
    environment:
      GENERIC_TIMEZONE: "Asia/Shanghai"
      TZ: "Asia/Shanghai"
      N8N_HOST: "xxx.xxx"
      N8N_PORT: 5678
      N8N_PROTOCOL: "https"
      NODE_ENV: "production"
      WEBHOOK_URL: "https://xxx.xxx"
      DB_TYPE: "postgresdb"
      DB_POSTGRESDB_HOST: "n8n_db"
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: "n8n"
      DB_POSTGRESDB_USER: "n8n"
      DB_POSTGRESDB_PASSWORD: "n8n"
      # DB_POSTGRESDB_SCHEMA: "n8n_"
      N8N_EMAIL_MODE: "smtp"
      N8N_SMTP_HOST: "xxx.com"
      N8N_SMTP_PORT: 587
      N8N_SMTP_USER: "xxx.com"
      N8N_SMTP_PASS: "xxx"
      N8N_SMTP_SENDER: "Admin xxx.com"
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

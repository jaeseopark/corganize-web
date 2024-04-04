# corganize-web

## Development

```bash
docker compose up --build -d
docker compose exec ui npx prettier --write .
```

## Production

```bash
docker compose -f docker-compose.yml up --build -d
```

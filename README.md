# corganize-web

## Usage

```bash
docker-compose up -d
```

## Development

```bash
docker-compose -f docker-compose-dev.yml up
docker-compose -f docker-compose-local.yml up
docker-compose -f docker-compose-local.yml logs -f
docker-compose -f docker-compose-local.yml exec ui npx prettier --write .
```

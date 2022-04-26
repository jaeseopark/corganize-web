# corganize-web

## Usage

```bash
docker-compose up -d
```

## Development

```bash
docker-compose up -d
docker-compose exec ui npx prettier --write .
```

### Import Order

TODO: any way to automate this using linters?

```js
// Third party libs
// Local type definitions
// Non-UI imports
// UI imports
```

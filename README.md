<h1 align="center">
  <br>
  <a href="https://www.energyweb.org/"><img src="https://www.energyweb.org/wp-content/uploads/2019/04/logo-brand.png" alt="EnergyWeb" width="150"></a>
  <br>
  EnergyWeb Origin
  <br>
  <h2 align="center">UTE Issuer API</h2>
  <br>
</h1>

**ute-issuer-api** package provides is a runner for a nest.js application that consist of **Origin Issuer API** packages.

## Versions

Tested and working with the following package versions:

- `yarn`: 1.22.10
- `node`: 14.15.5
- `docker`: 20.10.8
- `docker-compose`: 1.29.2

## Development

1. `yarn` - Installs the package dependencies
2. `yarn build` - Builds the packages
3. `yarn migrate` - Deploy all the contracts necessary for the app to work
3. `yarn start` - Starts the UTE backend

Default TypeOrm configuration requires running PostgreSQL database. The detailed config with .env parameters is:

```
DB_HOST      - default 'localhost'
DB_PORT      - default 5432
DB_USERNAME  - default 'postgres',
DB_PASSWORD  - default 'postgres',
DB_DATABASE  - default 'ute-issuer',
```

or

```
DATABASE_URL  - postgres://{user}:{password}@{host}:{port}/{database}
```

Other configuration variables

```
BACKEND_PORT:                                           <PORT to which nest application start listening>
WEB3:                                           <WEB3 provider url>
```

### PostgreSQL installation using Docker

```
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
```

### Swagger

Swagger endpoint can be found at

`http://localhost:3030/swagger`

## Docker

If you want to use UTE Issuer API in a dockerized approach, you can:

1. Integrate the `Dockerfile` into your Docker workflow
2. Use `docker-compose.yml` to automatically build and run the UTE Issuer API along with a Postgres instance. Then:
  - Build: `docker-compose -p ute build`
  - Run: `docker-compose -p ute up -d`

_Note: If you are using docker-compose, make sure that `DB_HOST=postgres` and `WEB3=http://ganache:8545` (if you are using Ganache) in your `.env` file._
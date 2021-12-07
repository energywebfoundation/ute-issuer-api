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

## Development

`yarn start` to start the origin backend and exchange as one application Note: this will not run the migrations for origin-backend and exchange.

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
PORT:                                           <PORT to which nest application start listening>
BACKEND_PORT:                                   <Same as PORT>
BLOCKCHAIN_EXPLORER_URL:                        <For e.g for Volta network https://volta-rpc-origin-0a316ab339e3d2ee3.energyweb.org>
WEB3:                                           <WEB3 provider url>
```

### PostgreSQL installation using Docker

```
docker pull postgres
docker run --name origin-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres
```

### Swagger

Swagger endpoint can be found at

`http://localhost:3033/api`

### Deploy to Heroku

1. Create app in Heroku
```
heroku create <app_name>
```

2. Add Postgres plugin

Go to `https://dashboard.heroku.com/apps/<app_name>`, click `Configure Add-ons`, select Heroku Postgres

3. Deploy to Heroku

```
HEROKU_API_KEY=<key> HEROKU_STABLE_APP_API=ute-issuer-api-stable yarn deploy:heroku
```

By default `HEROKU_API_KEY` is set in .netrc when you authorize with `heroku` login
Also it can be retrieved by `heroku auth:token` command


### Tips on development

1. Create a repo
2. Create App Module, import all required modules
3. Make changes accordingly to your requirements
4. Add github action if needed
5. Add migrations if required
    5.1. Create blockchain properties if required 
6. Prepare Dockerfile:
    6.1. Specify platform for image (e.g. `FROM --platform=linux/amd64 node:14-alpine`)
    6.2. Specify migration run before main process (e.g. `CMD ["/bin/bash","-c", "yarn typeorm:migrate && /project/ute-issuer-api/bin/ute-issuer-api"]`)

## Docker

If you want to use UTE Issuer API in a dockerized approach, you can:

1. Integrate the `Dockerfile` into your Docker workflow
2. Use `docker-compose.yml` to automatically build and run the UTE Issuer API along with a Postgres instance. Then:
  - Build: `docker-compose -p ute build`
  - Run: `docker-compose -p ute up -d`

_Note: If you are using docker-compose, make sure that `DB_HOST=postgres` and `WEB3=http://ganache:8545` (if you are using Ganache) in your `.env` file._
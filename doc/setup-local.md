# Setup local development environment

## Start docker services

```
docker-compose up -d
```

## Setup database

- Add new postgres connection in PHP Storm

If you have different psql version on your host, you can manually restore dump inside container:
- Put dump to `./dumps` directory
- Connect to postgres container
- Restore database: `psql -h localhost --set ON_ERROR_STOP=on -U root -d rifeberry -1 -f /dumps/rifeberry.sql`

## Connect to node service and run other commands inside container

```
docker exec -it nest-backend_node_1 sh
```

### Install packages

```
yarn
```

### Generate JWT keys if not exists

```
openssl rsa -pubout -in var/jwt/private.pem -out var/jwt/public.pem
```

### Migrate database

```
yarn typeorm:run-migrations
```

### Add host to /etc/hosts

```
127.0.0.1   test.rifeberry.loc    
```

### Setup node debug

[Настройка node debug](https://olivergrand.atlassian.net/wiki/spaces/BACK/pages/14319617/Node+debug)

### Send test request to test.rifeberry.loc/api

### Optional: Setup wildcard subdomains using dnsmasq

https://askubuntu.com/questions/1029882/how-can-i-set-up-local-wildcard-127-0-0-1-domain-resolution-on-18-04-20-04
# camunda platform 

## configuration 

github: https://github.com/camunda/camunda-platform
vps: **/home/devops/lvluu/camunda-platform/docker-compose/camunda-8.6**

## start all services

please note that you HAVE to cd to `/home/devops/lvluu/camunda-platform/docker-compose/camunda-8.6` before executing any command with docker compose:

```bash
docker compose --profile full up -d
```

## stop all services

```bash
docker compose --profile full down -d
```

## restart a container

you can press tab to auto suggest the [service_name]

```bash
docker compose --profile full restart [service_name]
```

## change version of a service

edit the `/home/devops/lvluu/camunda-platform/docker-compose/camunda-8.6/.env`
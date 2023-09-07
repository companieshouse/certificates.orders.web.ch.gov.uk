FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-18
WORKDIR /opt
COPY api-enumerations ./api-enumerations
COPY dist ./package.json ./package-lock.json docker_start.sh routes.yaml ./

CMD ["./docker_start.sh"]

EXPOSE 3000

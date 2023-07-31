FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-18

COPY api-enumerations ./api-enumerations

CMD ["/app/dist/bin/www.js", "--", "3000"]

EXPOSE 3000

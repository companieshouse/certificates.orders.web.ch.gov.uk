#!/bin/bash
# Start script for <service_name>
npm i
PORT=3000
export NODE_PORT=${PORT}
exec node /opt/bin/www.js -- ${PORT}

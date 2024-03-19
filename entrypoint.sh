#!/bin/bash
set -e

echo "Starting docker entrypoint…"

# RUN npx prisma generate
# RUN npx prisma:reset

echo "Finished docker entrypoint."
exec "$@"

FROM node:20-slim

COPY . .

RUN npm i

# Disable experimental features by default in docker images
RUN echo "VITE_ENABLE_EXPERIMENTAL=false" >> front/.env

# err: cannot read properties of null (reading 'matches')
RUN npm cache clean --force

RUN npm run build:front

RUN npm run build:setup-node

EXPOSE 3000

CMD [ "node", "build/src/index.js" ]

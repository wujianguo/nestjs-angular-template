# https://www.tomray.dev/nestjs-docker-production
###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:18-alpine As development
WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli @angular/cli
USER node

###################
# BUILD FOR PRODUCTION
###################
FROM development As build
WORKDIR /usr/src/app
COPY --chown=node:node server ./server
COPY --chown=node:node web ./web
ENV NODE_ENV production
# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN cd server && npm run build && npm ci --omit=dev && npm cache clean --force && cd ../web && ng build
USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As prod
COPY --chown=node:node --from=build /usr/src/app/server/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/server/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/web/dist/nestjs-angular ./dist/apps/backend/web

EXPOSE 3000 3001
# CMD [ "node", "dist/apps/backend/main.js" ]
# CMD [ "node", "dist/apps/frontend/main.js" ]

# docker build . -t nestjs-angular

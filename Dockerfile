# https://www.tomray.dev/nestjs-docker-production
# docker build . -t nestjs-angular
###################
# BUILD FOR LOCAL DEVELOPMENT
###################
FROM node:18-alpine As development
WORKDIR /usr/src/app
RUN npm install -g @nestjs/cli @angular/cli
# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################
FROM development As build
WORKDIR /usr/src/app
# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node server/package*.json ./server/
COPY --chown=node:node web/package*.json ./web/
# Install app dependencies using the `npm ci` command instead of `npm install`
RUN cd server && npm ci && cd ../web && npm ci
# Bundle app source
COPY --chown=node:node . .
# Run the build command which creates the production bundle
RUN cd server && npm run build && cd ../web && ng build
# Set NODE_ENV environment variable
ENV NODE_ENV production
# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN cd server && npm ci --omit=dev && npm cache clean --force
# Use the node user from the image (instead of the root user)
USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As prod
# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/server/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/server/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/web/dist/nestjs-angular ./dist/apps/nestjs-angular/web

EXPOSE 3000
# Start the server using the production build
CMD [ "node", "dist/apps/nestjs-angular/main.js" ]

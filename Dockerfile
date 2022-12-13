FROM node:16
RUN npm install -g @digital-boss/n8n-manager
CMD [ "8man" ]
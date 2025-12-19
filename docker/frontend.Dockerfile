FROM node:20-alpine AS build
WORKDIR /app
COPY src/Frontend/ai-resume-analyzer-ui/package*.json ./
RUN npm install
COPY src/Frontend/ai-resume-analyzer-ui .
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 4173
CMD ["nginx", "-g", "daemon off;"]



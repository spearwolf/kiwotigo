FROM nginx
COPY dist /usr/share/nginx/html/dist
COPY index.html /usr/share/nginx/html/

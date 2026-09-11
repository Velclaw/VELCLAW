FROM nginx:1.27-alpine
COPY index.html /usr/share/nginx/html/index.html
COPY docs-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

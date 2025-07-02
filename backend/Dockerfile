FROM denoland/deno:2.4.0

WORKDIR /app

COPY . .

RUN deno install

EXPOSE 8000

CMD ["task", "start"]
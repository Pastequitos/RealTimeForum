FROM golang:latest
COPY . /src
WORKDIR /src
RUN go build -o RTF
CMD ["./RTF"]
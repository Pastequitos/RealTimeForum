package main

import (
	"log"
	"net/http"

	"realtime-forum/controllers"
)

func main() {
	http.HandleFunc("/", controllers.Index)

	log.Print("Starting server on http://localhost:3003")
	err := http.ListenAndServe(":3003", nil)
	if err != nil {
		log.Fatal(err)
	}
}

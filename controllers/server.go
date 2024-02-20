package controllers

import (
	"flag"
	"log"
	"net/http"
	"path"
)

func Server() {
	flag.Parse()
	hub := newHub()
	go hub.run()

	http.HandleFunc("/", Index)
	http.HandleFunc("/register", Register)
	http.HandleFunc("/login", Login)
	http.HandleFunc("/logout", Logout)
	http.HandleFunc("/getusers", GetUsers)
	http.HandleFunc("/post", Post)
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./ui/static"))))

	// Handle CSS files separately to set the correct MIME type
	http.HandleFunc("/static/css/", func(w http.ResponseWriter, r *http.Request) {
		filePath := path.Join("./ui", r.URL.Path)
		http.ServeFile(w, r, filePath)
	})

	// Handle JavaScript files separately to set the correct MIME type
	http.HandleFunc("/static/js/", func(w http.ResponseWriter, r *http.Request) {
		filePath := path.Join("./ui", r.URL.Path)
		http.ServeFile(w, r, filePath)
		w.Header().Set("Content-Type", "application/javascript")
	})

	log.Print("Starting server on http://localhost:3003")
	err := http.ListenAndServe(":3003", nil)
	if err != nil {
		log.Fatal(err)
	}
}

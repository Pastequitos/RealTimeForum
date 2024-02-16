package main

import (
	"log"
	"net/http"
	"path"

	"realtimeforum/controllers"
)

func main() {
	http.HandleFunc("/", controllers.Index)
	http.HandleFunc("/register", controllers.Register)
	http.HandleFunc("/login", controllers.Login)
	http.HandleFunc("/logout", controllers.Logout)
	http.HandleFunc("/getusers", controllers.GetUsers)


	

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

package main

import (
	"flag"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"sync"
)

type templateHandler struct {
	once     sync.Once
	filename string
	templ    *template.Template
}

func (t *templateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	t.once.Do(func() {
		t.templ = template.Must(template.ParseFiles(filepath.Join("ui", t.filename)))
	})
	t.templ.Execute(w, r)
}

func main() {
	address := flag.String( /* name: */ "address" /* value: */, ":8080" /* usage: */, "The address of the application.")
	flag.Parse()
	r := newRoom()
	http.Handle("/", &templateHandler{filename: "html/index.html"})
	http.Handle("/room", r)
	// start the web server
	go r.run()

	log.Println("Starting web server on", *address)
	if err := http.ListenAndServe(*address, nil); err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}

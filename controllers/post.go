package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type PostData struct {
	ID        int
	Username  string
	Title     string
	Content   string
	Category  string
	Date      string
	NbComment int
}

func Post(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/post" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}

	var post PostData

	if r.Method == "POST" {
		json.NewDecoder(r.Body).Decode(&post)

		db, err := sql.Open("sqlite3", "database.db")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer db.Close()

		cookie, _ := r.Cookie("session_token")

		post.Date = time.Now().Format("2006-01-02 15:04:05")
		post.Username, _ = CurrentUser(cookie.Value)
		post.NbComment = 0

		_, err = db.Exec("INSERT INTO post (username, title, content, category, date, nbcomment) VALUES (?, ?, ?, ?, ?, ?)", post.Username, post.Title, post.Content, post.Category, post.Date, post.NbComment)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to insert post into database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		msg := Resp{Msg: "✅ New Post Created", Type: "success"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response."+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)

	} else if r.Method == "GET" {

		fmt.Println("chargement post")
		db, err := sql.Open("sqlite3", "database.db")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer db.Close()

		rowposts, err := db.Query("SELECT * FROM post")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}

		var posts []PostData
		for rowposts.Next() {
			var p PostData
			err := rowposts.Scan(&p.ID, &p.Username, &p.Title, &p.Content, &p.Category, &p.Date, &p.NbComment)
			if err != nil {
				break
			}
			posts = append(posts, p)
		}

		resp, err := json.Marshal(posts)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response."+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)
	}
}

func CurrentUser(val string) (string, error) {
	// Open a connection to the database
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		return "", err
	}
	defer db.Close()

	// Query user from the database
	var user User
	err = db.QueryRow("SELECT username FROM user_account_data WHERE session_token=?", val).Scan(&user.Username)
	if err != nil {
		return "", err
	}
	return user.Username, nil
}

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
	ID       int
	Username string
	Title    string
	Content  string
	Category string
	Date     string
}

func Post(w http.ResponseWriter, r *http.Request) {
	var post PostData

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

	fmt.Println(post)

	_, err = db.Exec("INSERT INTO post (username, title, content, category, date) VALUES (?, ?, ?, ?, ?)", post.Username, post.Title, post.Content, post.Category, post.Date)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to insert post into database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	msg := Resp{Msg: "✅ New Post Created", Type: "success"}
	resp, err := json.Marshal(msg)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(resp)
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

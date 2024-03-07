package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type CommentData struct {
	ID       int
	PostId   int
	Username string
	Content  string
	Date     string
}

func Comment(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/comment" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}

	var comment CommentData

	if r.Method == "POST" {
		json.NewDecoder(r.Body).Decode(&comment)

		// Print the decoded JSON for debugging

		db, err := sql.Open("sqlite3", "database.db")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer db.Close()

		cookie, _ := r.Cookie("session_token")

		comment.Date = time.Now().Format("2006-01-02 15:04:05")
		comment.Username, _ = CurrentUser(cookie.Value)

		_, err = db.Exec("INSERT INTO comments (post_id, username, comment, date) VALUES (?, ?, ?, ?)", comment.PostId, comment.Username, comment.Content, comment.Date)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to insert post into database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		_, err = db.Exec("UPDATE post SET nbcomment = nbcomment + 1 WHERE id = ?", comment.PostId)
		if err != nil {
			// Handle the error, for example by logging it or sending an error response
			http.Error(w, "500 internal server error: Failed to update comment count in post. "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Continue with the rest of your logic, e.g., sending a success response
		msg := Resp{Msg: "✅ New Comment Created", Type: "success"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response."+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)

	} else if r.Method == "GET" {
		
		postIdParam := r.URL.Query().Get("postId")
		if postIdParam == "" {
			http.Error(w, "400 Bad Request: postId parameter is required", http.StatusBadRequest)
			return
		}

		postId, err := strconv.Atoi(postIdParam) // Convert postIdParam to int
		if err != nil {
			http.Error(w, "400 Bad Request: invalid postId", http.StatusBadRequest)
			return
		}

		db, err := sql.Open("sqlite3", "database.db")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer db.Close()

		query := "SELECT id, post_id, username, comment, date FROM comments WHERE post_id = ?"
		rows, err := db.Query(query, postId)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to query comments. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var comments []CommentData
		for rows.Next() {
			var c CommentData
			if err := rows.Scan(&c.ID, &c.PostId, &c.Username, &c.Content, &c.Date); err != nil {
				http.Error(w, "500 internal server error: Failed to scan comment. "+err.Error(), http.StatusInternalServerError)
				return
			}
			comments = append(comments, c)
		}

		// Check for errors encountered during iteration over rows
		if err := rows.Err(); err != nil {
			http.Error(w, "500 internal server error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		resp, err := json.Marshal(comments)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal comments. "+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)
	}
}

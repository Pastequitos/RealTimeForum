package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Connected int    `json:"connected"`
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Retrieve the current user's username from the session
	currentUsername, err := GetUsernameFromSession(w, r)
	if err != nil {
		http.Error(w, "Failed to retrieve session information. "+err.Error(), http.StatusInternalServerError)
		return
	}

	rows, err := db.Query("SELECT id, username, connected FROM user_account_data")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Create a slice to store user data
	var users []User

	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Connected); err != nil {
			http.Error(w, "500 internal server error: Failed to scan row. "+err.Error(), http.StatusInternalServerError)
			return
		}
		// Exclude the current user from the list
		if user.Username != currentUsername {
			users = append(users, user)
		}
	}
	if err := rows.Err(); err != nil {
		http.Error(w, "500 internal server error: Failed to iterate over rows. "+err.Error(), http.StatusInternalServerError)
		return
	}

	userJSON, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal user data. "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(userJSON)
}
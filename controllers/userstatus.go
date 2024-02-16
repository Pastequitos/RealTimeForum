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
	/* 	fmt.Println("Fetching users...") */
	// Connect to the database
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Query users from the database
	rows, err := db.Query("SELECT id, username, connected FROM user_account_data")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Create a slice to store user data
	var users []User

	// Iterate through the rows and populate the users slice
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Connected); err != nil {
			http.Error(w, "500 internal server error: Failed to scan row. "+err.Error(), http.StatusInternalServerError)
			return
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		http.Error(w, "500 internal server error: Failed to iterate over rows. "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Marshal user data to JSON
	userJSON, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal user data. "+err.Error(), http.StatusInternalServerError)
		return
	}

	/* 	fmt.Println("userJSON: ", string(userJSON)) */
	// Set the content type and write the JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(userJSON)
}

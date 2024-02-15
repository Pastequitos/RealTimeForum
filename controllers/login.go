package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type LoginData struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var login LoginData

	err = json.NewDecoder(r.Body).Decode(&login)
	if err != nil {
		http.Error(w, "400 bad request: Invalid request body", http.StatusBadRequest)
		return
	}

	fmt.Println(login)

	var storedPassword string

	err = db.QueryRow("SELECT password FROM user_account_data WHERE username=?", login.Username).Scan(&storedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "401 unauthorized: Username not found", http.StatusUnauthorized)
		} else {
			http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Check if the password provided matches the stored password
	if login.Password != storedPassword {
		http.Error(w, "401 unauthorized: Incorrect password", http.StatusUnauthorized)
		return
	}

	// Respond with a success message
	msg := Resp{Msg: "Login successful"}
	resp, err := json.Marshal(msg)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(resp)
}

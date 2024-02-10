package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type UserData struct {
	ID        int
	Username  string
	Email     string
	Password  string
	Firstname string
	Lastname  string
	Age       int
	Gender    string
	Color     string
}

type Resp struct {
	Msg string `json:"msg"`
}

func Register(w http.ResponseWriter, r *http.Request) {
	var user UserData

	json.NewDecoder(r.Body).Decode(&user)

	// Open a connection to the database
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Insert user data into the database
	_, err = db.Exec("INSERT INTO user_account_data (username, email, password, fname, lname, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?)",
		user.Username, user.Email, user.Password, user.Firstname, user.Lastname, user.Age, user.Gender)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to insert user data into database. "+err.Error(), http.StatusInternalServerError)
		return
	}

	msg := Resp{Msg: "Successful registration"}
	resp, err := json.Marshal(msg)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(resp)
}

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
	Connected int
	Pp        []byte
}

type Resp struct {
	Msg  string `json:"msg"`
	Type string `json:"type"`
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

	// Check if user already exists
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM user_account_data WHERE username=?", user.Username).Scan(&count)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	if count > 0 {
		msg := Resp{Msg: "username already exist", Type: "error"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
			return
		}
		// return false
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)

	} else {

		// Insert user data into the database
		_, err = db.Exec("INSERT INTO user_account_data (username, email, password, fname, lname, age, gender, connected, pp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			user.Username, user.Email, user.Password, user.Firstname, user.Lastname, user.Age, user.Gender, user.Connected, user.Pp)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to insert user data into database. "+err.Error(), http.StatusInternalServerError)
			return
		}

		msg := Resp{Msg: "Successful registration", Type: "success"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
			return
		}

		// return true
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)
	}
}

package controllers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
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
	var storedPassword string
	var userID int

	err = db.QueryRow("SELECT id, password FROM user_account_data WHERE username=?", login.Username).Scan(&userID, &storedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			msg := Resp{Msg: "❌ Oups! Username not found", Type: "error"}
			resp, err := json.Marshal(msg)
			if err != nil {
				http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write(resp)
		} else {
			http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if login.Password != storedPassword {
		msg := Resp{Msg: "❌ Oups! Invalid password", Type: "error"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write(resp)
		return
	} else {
		// Generate session token
		sessionToken := uuid.New().String()

		// Store session token in the database
		_, err = db.Exec("UPDATE user_account_data SET session_token = ? WHERE id = ?", sessionToken, userID)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to insert session into database. "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set cookie with session token
		expiration := time.Now().Add(24 * time.Hour)
		cookie := http.Cookie{Name: "session_token", Value: sessionToken, Expires: expiration}
		http.SetCookie(w, &cookie)

		// set connected status
		_, err = db.Exec("UPDATE user_account_data SET connected = 1 WHERE id = ?", userID)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to update connected status. "+err.Error(), http.StatusInternalServerError)
			return
		}

		msg := Resp{Msg: "✅ Successfully logged-in!", Type: "success"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)
	}
}

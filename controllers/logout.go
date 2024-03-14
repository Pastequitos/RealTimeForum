package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Logging out...")

	// Fetch session token from the cookie
	session, err := r.Cookie("session_token")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to get session token. "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Clear the session token in the database
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	// Set disconnected status
	_, err = db.Exec("UPDATE user_account_data SET connected = 0 WHERE session_token = ?", session.Value)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to update connected status. "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Delete the session token cookie
	cookie_token := &http.Cookie{
		Name:   "session_token",
		Value:  "",
		MaxAge: -1,
		Path:   "/",
	}
	http.SetCookie(w, cookie_token)

	msg := Resp{Msg: "✅ Successfully logged-out!", Type: "success"}
	resp, err := json.Marshal(msg)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(resp)

	fmt.Println("Logout successful")
}

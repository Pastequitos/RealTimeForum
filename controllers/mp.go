package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func SendMessage(msg Message) {
	fmt.Println("Sending message")
	fmt.Println("Sending message", msg)

	var mp Message

	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		fmt.Println("Failed to connect to database. ", err)
		return
	}
	defer db.Close()

	mp.Date = time.Now().Format("2006-01-02 15:04:05")

	mp.Sender_id = msg.Sender_id
	mp.Receiver_id = msg.Receiver_id
	mp.Content = msg.Content

	_, err = db.Exec("INSERT INTO mp (s_id, r_id, content, date) VALUES (?, ?, ?, ?)", mp.Sender_id, mp.Receiver_id, mp.Content, mp.Date)
	if err != nil {
		fmt.Println("Failed to insert message into database. ", err)
		return
	}
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Loading messages")

	cookie, _ := r.Cookie("session_token")
	senderID, err := CurrentID(cookie.Value)
	receiverID := r.URL.Query().Get("receiver_id")

	fmt.Println("senderid",senderID,"recieverid", receiverID)

	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	query := `SELECT id, s_id, r_id, content, date FROM mp WHERE (s_id = ? AND r_id = ?) OR (s_id = ? AND r_id = ?) ORDER BY date ASC`
	rows, err := db.Query(query, senderID, receiverID, receiverID, senderID)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var m Message
		err := rows.Scan(&m.Id, &m.Sender_id, &m.Receiver_id, &m.Content, &m.Date)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to scan row. "+err.Error(), http.StatusInternalServerError)
			return
		}
		messages = append(messages, m)
	}

	resp, err := json.Marshal(messages)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response."+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(resp)
}

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
	/* 	fmt.Println("Sending message")
	   	fmt.Println("Sending message", msg) */

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
	/* 	fmt.Println("Loading messages") */

	cookie, _ := r.Cookie("session_token")
	senderID, err := CurrentID(cookie.Value)
	receiverID := r.URL.Query().Get("receiver_id")

	/* fmt.Println("senderid", senderID, "recieverid", receiverID) */

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

type UnreadMessageRequest struct {
	Rid         int `json:"receiver_id"`
	UnreadCount int `json:"unread_count"`
}

type UnreadMessageResponse struct {
	UnreadedUser            []int `json:"unreadeduser"`
	UnreadedNumberOfMessage []int `json:"unreadednumbeofmessage"`
}

func updateUnreadMessages(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Update unread messages")

	var umr UnreadMessageRequest
	// Decode the JSON request body into the UnreadMessageRequest struct
	err := json.NewDecoder(r.Body).Decode(&umr)
	if err != nil {
		http.Error(w, "400 bad request: Failed to decode request body. "+err.Error(), http.StatusBadRequest)
		return
	}

	// Check if the UnreadCount is 0, if so, delete the corresponding entry from the database
	if umr.UnreadCount == 0 {
		db, err := sql.Open("sqlite3", "database.db")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer db.Close()

		userID, err := GetIdFromSession(w, r)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to get user ID from session. "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Delete the corresponding entry from the database
		_, err = db.Exec("DELETE FROM unreadedmp WHERE id = ? AND sender = ?", userID, umr.Rid)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to delete entry from the database. "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Set response headers and write the response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		return
	}

	// If UnreadCount is not 0, update or insert into the database as before
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	userID, err := GetIdFromSession(w, r)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to get user ID from session. "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if there are existing entries for the combination of userID and umr.Rid
	var um int
	err = db.QueryRow("SELECT um FROM unreadedmp WHERE id = ? AND sender = ?", userID, umr.Rid).Scan(&um)
	if err != nil {
		if err == sql.ErrNoRows {
			// No existing entry found, insert a new row
			_, err := db.Exec("INSERT INTO unreadedmp (id, sender, um) VALUES (?, ?, ?)", userID, umr.Rid, umr.UnreadCount)
			if err != nil {
				http.Error(w, "500 internal server error: Failed to insert user data into database. "+err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		// Existing entry found, update the um count by incrementing it
		um++
		_, err := db.Exec("UPDATE unreadedmp SET um = ? WHERE id = ? AND sender = ?", um, userID, umr.Rid)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to update um in the database. "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Set response headers and write the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func GetUnreadMessages(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Get unread messages")

	if r.Method != "GET" {
		http.Error(w, "405 method not allowed: Only GET requests are allowed.", http.StatusMethodNotAllowed)
		return
	}

	userID, err := GetIdFromSession(w, r)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to get user ID from session. "+err.Error(), http.StatusInternalServerError)
		return
	}

	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var unreadedUsers []int
	var unreadedNumberOfMessages []int
	rows, err := db.Query("SELECT sender, um FROM unreadedmp WHERE id = ?", userID)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to query database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var sender int
		var um int
		err := rows.Scan(&sender, &um)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to scan row. "+err.Error(), http.StatusInternalServerError)
			return
		}
		unreadedUsers = append(unreadedUsers, sender)
		unreadedNumberOfMessages = append(unreadedNumberOfMessages, um)
	}

	fmt.Println("Unreaded users: ", unreadedUsers)
	fmt.Println("Unreaded number of messages: ", unreadedNumberOfMessages)

	response := UnreadMessageResponse{
		UnreadedUser:            unreadedUsers,
		UnreadedNumberOfMessage: unreadedNumberOfMessages,
	}

	umJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(umJSON)
}

package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
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
	// Fetch the current unread messages from the database
	var currentUnreadMessages string
	err = db.QueryRow("SELECT unreadmessages FROM user_account_data WHERE id = ?", userID).Scan(&currentUnreadMessages)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "500 internal server error: Failed to fetch current unread messages from database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Parse the current unread messages and update the count if the same receiver ID is found
	updatedUnreadMessages := currentUnreadMessages
	if strings.Contains(currentUnreadMessages, fmt.Sprintf("%d:", umr.Rid)) {
		// Extract the current count and increment it
		re := regexp.MustCompile(fmt.Sprintf("(%d):(\\d+)", umr.Rid))
		updatedUnreadMessages = re.ReplaceAllStringFunc(currentUnreadMessages, func(s string) string {
			parts := strings.Split(s, ":")
			count, _ := strconv.Atoi(parts[1])
			count += 1
			fmt.Printf("%d:%d", umr.Rid, count)
			return fmt.Sprintf("%d:%d", umr.Rid, count)
		})
	} else {
		// Append the new data to the current unread messages
		updatedUnreadMessages = fmt.Sprintf("%s,%d:%d", currentUnreadMessages, umr.Rid, umr.UnreadCount)
	}
	// Update the database with the combined value
	_, err = db.Exec("UPDATE user_account_data SET unreadmessages = ? WHERE id = ?", updatedUnreadMessages, userID)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to update unreadmessages in the database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Split the updated unread messages into separate receiver IDs and unread counts
	unreadedUsers := []int{}
	unreadedNumberOfMessages := []int{}
	parts := strings.Split(updatedUnreadMessages, ",")
	for _, part := range parts {
		kv := strings.Split(part, ":")
		if len(kv) == 2 {
			rid, _ := strconv.Atoi(kv[0])
			count, _ := strconv.Atoi(kv[1])
			unreadedUsers = append(unreadedUsers, rid)
			unreadedNumberOfMessages = append(unreadedNumberOfMessages, count)
		}
	}
	// Prepare the response
	response := UnreadMessageResponse{
		UnreadedUser:            unreadedUsers,
		UnreadedNumberOfMessage: unreadedNumberOfMessages,
	}
	// Marshal the response to JSON
	umJSON, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
		return
	}
	// Set response headers and write the response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(umJSON)
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

	var currentUnreadMessages string
	err = db.QueryRow("SELECT unreadmessages FROM user_account_data WHERE id = ?", userID).Scan(&currentUnreadMessages)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "500 internal server error: Failed to fetch current unread messages from database. "+err.Error(), http.StatusInternalServerError)
		return
	}

	unreadedUsers := []int{}
	unreadedNumberOfMessages := []int{}

	parts := strings.Split(currentUnreadMessages, ",")
	for _, part := range parts {
		kv := strings.Split(part, ":")
		if len(kv) == 2 {
			rid, _ := strconv.Atoi(kv[0])
			count, _ := strconv.Atoi(kv[1])
			unreadedUsers = append(unreadedUsers, rid)
			unreadedNumberOfMessages = append(unreadedNumberOfMessages, count)
		}
	}

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

package controllers

import (
	"database/sql"
	"fmt"
	"time"
)

func SendMessage(msg Message) {
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		fmt.Println("Failed to connect to database:", err)
		return
	}
	defer db.Close()

	msg.Date = time.Now().Format("2006-01-02 15:04:05")

	_, err = db.Exec("INSERT INTO mp (s_id, r_id, content, date, msg_type, user_id) VALUES (?, ?, ?, ?, ?, ?)", msg.Sender_id, msg.Receiver_id, msg.Content, msg.Date, msg.Msg_type, msg.UserID)
	if err != nil {
		fmt.Println("Failed to insert message into database:", err)
		return
	}

	fmt.Println("Message sent successfully")
}



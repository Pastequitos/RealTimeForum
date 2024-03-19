package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	ID         int    `json:"id"`
	Username   string `json:"username"`
	Connected  int    `json:"connected"`
	ReceiverID int    `json:"receiver_id"`
	Date       string `json:"date"`
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		fmt.Println("Error:", err)
		http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	currentUsername, err := GetUsernameFromSession(w, r)
	if err != nil {
		http.Error(w, "Failed to retrieve session information. "+err.Error(), http.StatusInternalServerError)
		return
	}

	userId, err := GetIdFromSession(w, r)
	if err != nil {
		fmt.Println("Error getting user ID from session:", err)
		http.Error(w, "Error getting user ID from session", http.StatusInternalServerError)
		return
	}

	fmt.Println("currentUsername: ", currentUsername)
	fmt.Println("userId: ", userId)

	var users []User

	// Query to retrieve the last message for each user
	query := `
	SELECT
    uad.id,
    uad.username,
    uad.connected,
    COALESCE(mp.r_id, -1) AS r_id,  -- Replace NULL with -1 for r_id
    COALESCE(mp.date, '') AS date  -- Replace NULL with empty string for date
FROM
    user_account_data AS uad
LEFT JOIN (
    SELECT
        CASE
            WHEN s_id = ? THEN r_id
            ELSE s_id
        END AS other_user_id,
        MAX(date) AS max_date
    FROM
        mp
    WHERE
        s_id = ? OR r_id = ?
    GROUP BY
        other_user_id
) AS latest_msg ON uad.id = latest_msg.other_user_id
LEFT JOIN mp ON (uad.id = mp.s_id OR uad.id = mp.r_id) AND mp.date = latest_msg.max_date
WHERE
    uad.id != ?
ORDER BY
    mp.date DESC;
    `

	rows, err := db.Query(query, userId, userId, userId, userId)
	if err != nil {
		fmt.Println("Error executing query:", err)
		http.Error(w, "500 internal server error: Failed to execute query. "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var u User
		err := rows.Scan(&u.ID, &u.Username, &u.Connected, &u.ReceiverID, &u.Date)
		if err != nil {
			fmt.Println("Error scanning row:", err)
			continue
		}
		fmt.Println("receiverID", u.ReceiverID)
		fmt.Println("userID", u.ID)

		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("Error iterating over rows:", err)
		http.Error(w, "500 internal server error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Users:", users)

	// Marshal the user slice to JSON
	userJSON, err := json.Marshal(users)
	if err != nil {
		fmt.Println("Error marshaling user data:", err)
		http.Error(w, "500 internal server error: Failed to marshal user data. "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(userJSON)
}

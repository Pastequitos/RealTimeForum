package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func AddPp(w http.ResponseWriter, r *http.Request) {

	// Parse the form data to get the uploaded file
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	// Get the file from the form data
	file, _, err := r.FormFile("profilePicture")
	if err != nil {
		http.Error(w, "Error retrieving profile picture", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Read the file data
	pictureData, err := ioutil.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file data", http.StatusInternalServerError)
		return
	}

	userID, err := GetIdFromSession(w, r)

	// Save the picture data to the database
	// Assuming you're using the same SQLite database as before
	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "Error connecting to database", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	fmt.Println(userID)
	fmt.Println(pictureData)

	_, err = db.Exec("UPDATE user_account_data SET pp = ? WHERE id = ?", pictureData, userID)
	if err != nil {
		http.Error(w, "Error updating profile picture in database", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Profile picture uploaded successfully")
}

func GetPp(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("id")
	if userID == "" {
		http.Error(w, "User ID is missing in the request", http.StatusBadRequest)
		return
	}

	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "Failed to connect to database: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var pp []byte
	err = db.QueryRow("SELECT pp FROM user_account_data WHERE id = ?", userID).Scan(&pp)
	if err != nil {
		http.Error(w, "Failed to query database: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "image/jpeg")

	_, err = w.Write(pp)
	if err != nil {
		http.Error(w, "Failed to write image data to response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetPpByUsername(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		http.Error(w, "Username is missing in the request", http.StatusBadRequest)
		return
	}

	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "Failed to connect to database: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var pp []byte
	err = db.QueryRow("SELECT pp FROM user_account_data WHERE username = ?", username).Scan(&pp)
	if err != nil {
		http.Error(w, "Failed to query database: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "image/jpeg")
	_, err = w.Write(pp)
	if err != nil {
		http.Error(w, "Failed to write image data to response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func GetUserData(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("id")
	fmt.Println("chargement user", userID)
	if userID == "" {
		http.Error(w, "User ID is missing in the request", http.StatusBadRequest)
		return
	}

	db, err := sql.Open("sqlite3", "database.db")
	if err != nil {
		http.Error(w, "Failed to connect to database: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	var userData UserData
	err = db.QueryRow("SELECT id, username, fname, lname, age, gender, pp FROM user_account_data WHERE id = ?", userID).
		Scan(&userData.ID, &userData.Username, &userData.Firstname, &userData.Lastname, &userData.Age, &userData.Gender, &userData.Pp)
	if err != nil {
		http.Error(w, "Failed to fetch user data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(userData)
}

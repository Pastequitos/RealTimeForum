package controllers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type LikeData struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	PostId   int    `json:"postId"`
	Like     bool   `json:"liked"`
}

func Like(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/like" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}

	var like LikeData
	err := json.NewDecoder(r.Body).Decode(&like)
	if err != nil {
		/* fmt.Println(err) */
	}

	/* fmt.Printf("%+v\n", like) */ // Imprime la structure avec les noms des champs

	if r.Method == "POST" {
		json.NewDecoder(r.Body).Decode(&like)

		db, err := sql.Open("sqlite3", "database.db")
		if err != nil {
			http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer db.Close()

		cookie, _ := r.Cookie("session_token")
		like.Username, _ = CurrentUser(cookie.Value)

		username, _ := CurrentUser(cookie.Value)

		// Vérifier si l'utilisateur a déjà aimé le post
		var id int
		err = db.QueryRow("SELECT id FROM likes WHERE post_id = ? AND username = ?", like.PostId, username).Scan(&id)

		/* fmt.Println(like.PostId, username) */

		if err == sql.ErrNoRows {
			// Aucun "like" existant et l'utilisateur veut aimer le post: insérer un nouvel enregistrement
			_, err = db.Exec("INSERT INTO likes (username, post_id) VALUES (?, ?)", username, like.PostId)
			fmt.Println(like.PostId, username, "nolike, add like")

		} else if err == nil {
			{
				// "Like" existant trouvé mais l'utilisateur veut retirer son "like": supprimer l'enregistrement
				_, err = db.Exec("DELETE FROM likes WHERE id = ?", id)
				fmt.Println(like.PostId, username, "delete already existing like")

			}
		} else {
			// Gérer les autres erreurs potentielles
			http.Error(w, "500 Internal Server Error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		msg := Resp{Msg: "✅ Like Updated", Type: "success"}
		resp, err := json.Marshal(msg)
		if err != nil {
			http.Error(w, "500 internal server error: Failed to marshal response."+err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(resp)
	} else if r.Method == "GET" {
        var like LikeData

        // Retrieve the postId from the URL query parameters
        postId := r.URL.Query().Get("postId")
        if postId == "" {
            http.Error(w, "400 Bad Request: postId parameter is required", http.StatusBadRequest)
            return
        }

        // Retrieve the session token and username
        cookie, err := r.Cookie("session_token")
        if err != nil {
            http.Error(w, "Unauthorized: No session token", http.StatusUnauthorized)
            return
        }
        username, _ := CurrentUser(cookie.Value)

        // Connect to the database
        db, err := sql.Open("sqlite3", "database.db")
        if err != nil {
            http.Error(w, "500 internal server error: Failed to connect to database. "+err.Error(), http.StatusInternalServerError)
            return
        }
        defer db.Close()

        // Initialize like status to false
        like.Like = false

        // Check if the user has liked the post
        err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = ? AND username = ?)", postId, username).Scan(&like.Like)
        if err != nil && err != sql.ErrNoRows {
            // Handle unexpected errors
            fmt.Printf("Error querying the likes table: %v\n", err)
            http.Error(w, "500 Internal Server Error: "+err.Error(), http.StatusInternalServerError)
            return
        }

        // Prepare and send the response
        like.Username = username
        like.PostId, _ = strconv.Atoi(postId) // Convert postId to int, assuming it's in a valid format
        resp, err := json.Marshal(like)
        if err != nil {
            http.Error(w, "500 internal server error: Failed to marshal response. "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write(resp)
    }
}

package controllers

import "encoding/json"

type Hub struct {
	clients    map[int]*Client // Registered clients
	broadcast  chan []byte     // Inbound messages from the clients
	register   chan *Client    // Register requests from the clients
	unregister chan *Client    // Unregister requests from clients
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),     // Initialize the broadcast channel
		register:   make(chan *Client),    // Initialize the register channel
		unregister: make(chan *Client),    // Initialize the unregister channel
		clients:    make(map[int]*Client), // Initialize the clients map
	}
}

type OnlineUsers struct {
	UserIds  []int  `json:"user_ids"`
	Msg_type string `json:"msg_type"`
}

type Message struct {
	Id          int    `json:"id"`
	Sender_id   int    `json:"sender_id"`
	Receiver_id int    `json:"receiver_id"`
	Content     string `json:"content"`
	Date        string `json:"date"`
	Msg_type    string `json:"msg_type"`
	UserID      int    `json:"user_id"`
}

func (h *Hub) Run() { // Run the hub
	for {
		select {
		case client := <-h.register: // Register a client
			h.clients[client.userID] = client // Add the client to the clients map

			// Notify other clients that this client is online
			uids := make([]int, 0, len(h.clients)) // Create a slice of user IDs
			for id := range h.clients {            // Iterate over the clients map
				uids = append(uids, id) // Append the user ID to the slice
			}
			msg := OnlineUsers{ // Create a message
				UserIds:  uids,     // Set the user IDs
				Msg_type: "online", // Set the message type
			}
			sendMsg, err := json.Marshal(msg)
			if err != nil {
				panic(err)
			}

			for _, c := range h.clients {
				select {
				case c.send <- sendMsg: // Send the message to the client
				default:
					close(c.send)               // Close the send channel
					delete(h.clients, c.userID) // Delete the client from the clients map
				}
			}
		case client := <-h.unregister: // Unregister a client
			if _, ok := h.clients[client.userID]; ok { // Check if the client is registered
				delete(h.clients, client.userID)

				// Notify other clients that this client is offline
				uids := make([]int, 0, len(h.clients))
				for id := range h.clients {
					uids = append(uids, id)
				}
				msg := OnlineUsers{
					UserIds:  uids,
					Msg_type: "online",
				}
				sendMsg, err := json.Marshal(msg)
				if err != nil {
					panic(err)
				}

				for _, c := range h.clients {
					select {
					case c.send <- sendMsg:
					default:
						close(c.send)
						delete(h.clients, c.userID)
					}
				}

				close(client.send)
			}
		case message := <-h.broadcast:
			// Process the message
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				panic(err)
			}

			sendMsg, err := json.Marshal(msg)
			if err != nil {
				panic(err)
			}

			if msg.Msg_type == "msg" { // Check if the message is a chat message
				for _, client := range h.clients {
					if client.userID == msg.Receiver_id {
						select {
						case client.send <- sendMsg:
						default:
							close(client.send)
							delete(h.clients, client.userID)
						}
					}
				}
			} else { // Check if the message is a typing status update
				for _, client := range h.clients { // Iterate over the clients map
					if client.userID != msg.Sender_id { // Check if the client is not the sender
						select {
						case client.send <- sendMsg: // Send the message to the client
						default:
							close(client.send)
							delete(h.clients, client.userID)
						}
					}
				}
			}
		}
	}
}

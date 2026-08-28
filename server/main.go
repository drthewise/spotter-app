package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	initDB()

	mux := http.NewServeMux()

	// Static uploads directory
	fs := http.FileServer(http.Dir("./uploads"))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", fs))

	// REST API Routes
	mux.HandleFunc("/api/health", enableCORS(HandleHealth))
	mux.HandleFunc("/api/me", enableCORS(HandleMe))
	mux.HandleFunc("/api/discovery", enableCORS(HandleDiscovery))
	mux.HandleFunc("/api/matches", enableCORS(HandleMatches))
	mux.HandleFunc("/api/matches/", enableCORS(HandleSendMessage))
	mux.HandleFunc("/api/beacons", enableCORS(HandleBeacons))
	mux.HandleFunc("/api/storage/presign", enableCORS(HandleStoragePresign))
	mux.HandleFunc("/api/storage/upload", enableCORS(HandleLocalFileUpload))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("=====================================================")
	log.Printf("🏋️ SPOTTER LOCAL BACKEND & CLOUDFLARE R2 API RUNNING")
	log.Printf("Localhost: http://localhost:%s", port)
	log.Printf("Local LAN: http://192.168.50.43:%s", port)
	log.Printf("Cloudflare R2: Ready (or local /uploads/ fallback)")
	log.Printf("Database: SQLite spotter.db")
	log.Printf("=====================================================")

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

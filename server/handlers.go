package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

func sendJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

// Health Check
func HandleHealth(w http.ResponseWriter, r *http.Request) {
	sendJSON(w, http.StatusOK, map[string]interface{}{
		"status":  "healthy",
		"service": "Spotter Local Go API",
		"time":    time.Now().Format(time.RFC3339),
		"version": "1.0.0",
	})
}

// Get or Update Current User (/api/me)
func HandleMe(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		row := DB.QueryRow(`SELECT 
			id, name, age, gender, bio, photos_json, primary_gym_json, experience_level,
			primary_modalities_json, workout_split, partnership_cadence, cadence_commitment,
			spotting_style, gym_energy, reliability_score, completed_workouts_count,
			is_coach, coach_mode_enabled, coach_verification_status, coach_title, hourly_rate,
			benchmarks_json
		FROM users WHERE id = 'user_me'`)

		var id, name, gender, bio, photosJSON, gymJSON, exp, modJSON, split, cadence, cadenceCommit, spotStyle, gymEnergy, coachStatus, coachTitle, hourlyRate, benchmarksJSON sql.NullString
		var age, completedCount, isCoach, coachMode sql.NullInt64
		var reliability sql.NullFloat64

		err := row.Scan(
			&id, &name, &age, &gender, &bio, &photosJSON, &gymJSON, &exp,
			&modJSON, &split, &cadence, &cadenceCommit, &spotStyle, &gymEnergy,
			&reliability, &completedCount, &isCoach, &coachMode, &coachStatus,
			&coachTitle, &hourlyRate, &benchmarksJSON,
		)
		if err != nil {
			http.Error(w, fmt.Sprintf("User not found: %v", err), http.StatusNotFound)
			return
		}

		var photos []string
		json.Unmarshal([]byte(photosJSON.String), &photos)
		var gym map[string]interface{}
		json.Unmarshal([]byte(gymJSON.String), &gym)
		var modalities []string
		json.Unmarshal([]byte(modJSON.String), &modalities)
		var benchmarks map[string]interface{}
		json.Unmarshal([]byte(benchmarksJSON.String), &benchmarks)

		profile := map[string]interface{}{
			"id":                      id.String,
			"name":                    name.String,
			"age":                     age.Int64,
			"gender":                  gender.String,
			"bio":                     bio.String,
			"photos":                  photos,
			"primaryGym":              gym,
			"experienceLevel":         exp.String,
			"primaryModalities":       modalities,
			"workoutSplit":            split.String,
			"partnershipCadence":      cadence.String,
			"cadenceCommitment":       cadenceCommit.String,
			"spottingStyle":           spotStyle.String,
			"gymEnergy":               gymEnergy.String,
			"reliabilityScore":        reliability.Float64,
			"completedWorkoutsCount":  completedCount.Int64,
			"isCoach":                 isCoach.Int64 == 1,
			"coachModeEnabled":        coachMode.Int64 == 1,
			"coachVerificationStatus": coachStatus.String,
			"coachTitle":              coachTitle.String,
			"hourlyRate":              hourlyRate.String,
			"strengthBenchmarks":      benchmarks,
		}
		sendJSON(w, http.StatusOK, profile)
		return
	}

	if r.Method == http.MethodPut || r.Method == http.MethodPost {
		var updates map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Update database
		if photos, ok := updates["photos"]; ok {
			bytes, _ := json.Marshal(photos)
			DB.Exec("UPDATE users SET photos_json = ? WHERE id = 'user_me'", string(bytes))
		}
		if bio, ok := updates["bio"].(string); ok {
			DB.Exec("UPDATE users SET bio = ? WHERE id = 'user_me'", bio)
		}
		if split, ok := updates["workoutSplit"].(string); ok {
			DB.Exec("UPDATE users SET workout_split = ? WHERE id = 'user_me'", split)
		}
		if exp, ok := updates["experienceLevel"].(string); ok {
			DB.Exec("UPDATE users SET experience_level = ? WHERE id = 'user_me'", exp)
		}
		if cadence, ok := updates["partnershipCadence"].(string); ok {
			DB.Exec("UPDATE users SET partnership_cadence = ? WHERE id = 'user_me'", cadence)
		}
		if commit, ok := updates["cadenceCommitment"].(string); ok {
			DB.Exec("UPDATE users SET cadence_commitment = ? WHERE id = 'user_me'", commit)
		}
		if benchmarks, ok := updates["strengthBenchmarks"]; ok {
			bytes, _ := json.Marshal(benchmarks)
			DB.Exec("UPDATE users SET benchmarks_json = ? WHERE id = 'user_me'", string(bytes))
		}
		if isCoach, ok := updates["isCoach"].(bool); ok {
			val := 0
			if isCoach {
				val = 1
			}
			DB.Exec("UPDATE users SET is_coach = ? WHERE id = 'user_me'", val)
		}
		if coachMode, ok := updates["coachModeEnabled"].(bool); ok {
			val := 0
			if coachMode {
				val = 1
			}
			DB.Exec("UPDATE users SET coach_mode_enabled = ? WHERE id = 'user_me'", val)
		}

		sendJSON(w, http.StatusOK, map[string]string{"status": "updated"})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

// Discovery Feed (/api/discovery)
func HandleDiscovery(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query(`SELECT 
		id, name, age, gender, bio, photos_json, primary_gym_json, experience_level,
		primary_modalities_json, workout_split, partnership_cadence, cadence_commitment,
		spotting_style, gym_energy, reliability_score, completed_workouts_count,
		is_coach, coach_mode_enabled, coach_verification_status, coach_title, hourly_rate,
		accreditation_body, credential_id_number, cpr_aed_verified, liability_insurance_verified,
		coaching_specialties_json, certifications_json
	FROM users WHERE id != 'user_me'`)
	if err != nil {
		http.Error(w, fmt.Sprintf("Database error: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var profiles []map[string]interface{}
	for rows.Next() {
		var id, name, gender, bio, photosJSON, gymJSON, exp, modJSON, split, cadence, cadenceCommit, spotStyle, gymEnergy, coachStatus, coachTitle, hourlyRate, accredBody, credID, specJSON, certsJSON sql.NullString
		var age, completedCount, isCoach, coachMode, cprVerified, liabilityVerified sql.NullInt64
		var reliability sql.NullFloat64

		rows.Scan(
			&id, &name, &age, &gender, &bio, &photosJSON, &gymJSON, &exp,
			&modJSON, &split, &cadence, &cadenceCommit, &spotStyle, &gymEnergy,
			&reliability, &completedCount, &isCoach, &coachMode, &coachStatus,
			&coachTitle, &hourlyRate, &accredBody, &credID, &cprVerified,
			&liabilityVerified, &specJSON, &certsJSON,
		)

		var photos []string
		json.Unmarshal([]byte(photosJSON.String), &photos)
		var gym map[string]interface{}
		json.Unmarshal([]byte(gymJSON.String), &gym)
		var modalities []string
		json.Unmarshal([]byte(modJSON.String), &modalities)
		var specialties []string
		json.Unmarshal([]byte(specJSON.String), &specialties)
		var certs []string
		json.Unmarshal([]byte(certsJSON.String), &certs)

		p := map[string]interface{}{
			"id":                          id.String,
			"name":                        name.String,
			"age":                         age.Int64,
			"gender":                      gender.String,
			"bio":                         bio.String,
			"photos":                      photos,
			"primaryGym":                  gym,
			"experienceLevel":             exp.String,
			"primaryModalities":           modalities,
			"workoutSplit":                split.String,
			"partnershipCadence":          cadence.String,
			"cadenceCommitment":           cadenceCommit.String,
			"spottingStyle":               spotStyle.String,
			"gymEnergy":                   gymEnergy.String,
			"reliabilityScore":            reliability.Float64,
			"completedWorkoutsCount":      completedCount.Int64,
			"isCoach":                     isCoach.Int64 == 1,
			"coachModeEnabled":            coachMode.Int64 == 1,
			"coachVerificationStatus":     coachStatus.String,
			"coachTitle":                  coachTitle.String,
			"hourlyRate":                  hourlyRate.String,
			"accreditationBody":           accredBody.String,
			"credentialIdNumber":          credID.String,
			"cprAedVerified":              cprVerified.Int64 == 1,
			"liabilityInsuranceVerified":  liabilityVerified.Int64 == 1,
			"coachingSpecialties":         specialties,
			"certifications":              certs,
		}
		profiles = append(profiles, p)
	}

	sendJSON(w, http.StatusOK, profiles)
}

// Matches & Messages (/api/matches)
func HandleMatches(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, user2_id, matched_at, schedule_overlap_score, active_session_json FROM matches")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching matches: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var matches []map[string]interface{}
	for rows.Next() {
		var id, partnerId, matchedAt, sessionJSON string
		var overlap int
		rows.Scan(&id, &partnerId, &matchedAt, &overlap, &sessionJSON)

		var session map[string]interface{}
		json.Unmarshal([]byte(sessionJSON), &session)

		// Fetch partner details
		pRow := DB.QueryRow("SELECT name, photos_json, primary_gym_json FROM users WHERE id = ?", partnerId)
		var pName, pPhotosJSON, pGymJSON string
		pRow.Scan(&pName, &pPhotosJSON, &pGymJSON)

		var photos []string
		json.Unmarshal([]byte(pPhotosJSON), &photos)
		var gym map[string]interface{}
		json.Unmarshal([]byte(pGymJSON), &gym)

		// Fetch messages for match
		msgRows, _ := DB.Query("SELECT id, sender_id, text, timestamp FROM messages WHERE match_id = ? ORDER BY created_at ASC", id)
		var messages []map[string]string
		for msgRows.Next() {
			var mID, sID, text, ts string
			msgRows.Scan(&mID, &sID, &text, &ts)
			messages = append(messages, map[string]string{
				"id": mID, "senderId": sID, "text": text, "timestamp": ts,
			})
		}
		msgRows.Close()

		lastMessage := ""
		lastTime := ""
		if len(messages) > 0 {
			lastMessage = messages[len(messages)-1]["text"]
			lastTime = messages[len(messages)-1]["timestamp"]
		}

		matches = append(matches, map[string]interface{}{
			"id":                   id,
			"matchedAt":            matchedAt,
			"scheduleOverlapScore": overlap,
			"lastMessage":          lastMessage,
			"lastMessageTime":      lastTime,
			"activeSession":        session,
			"messages":             messages,
			"partner": map[string]interface{}{
				"id":         partnerId,
				"name":       pName,
				"photos":     photos,
				"primaryGym": gym,
			},
		})
	}

	sendJSON(w, http.StatusOK, matches)
}

// Send Message (/api/matches/{id}/messages)
func HandleSendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}
	matchID := parts[2]

	var req struct {
		SenderId string `json:"senderId"`
		Text     string `json:"text"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	msgID := fmt.Sprintf("msg_%d", time.Now().UnixNano())
	ts := time.Now().Format("3:04 PM")

	_, err := DB.Exec("INSERT INTO messages (id, match_id, sender_id, text, timestamp) VALUES (?, ?, ?, ?, ?)",
		msgID, matchID, req.SenderId, req.Text, ts)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to insert message: %v", err), http.StatusInternalServerError)
		return
	}

	sendJSON(w, http.StatusOK, map[string]string{
		"id":        msgID,
		"matchId":   matchID,
		"senderId":  req.SenderId,
		"text":      req.Text,
		"timestamp": ts,
	})
}

// Gym Beacons (/api/beacons)
func HandleBeacons(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		rows, _ := DB.Query("SELECT id, user_id, user_name, user_photo, gym_name, target_focus, time_window_text, description, responses_count, is_urgent, posted_at FROM beacons ORDER BY created_at DESC")
		defer rows.Close()

		var beacons []map[string]interface{}
		for rows.Next() {
			var id, uid, uname, uphoto, gname, focus, timeWindow, desc, posted string
			var count, urgent int
			rows.Scan(&id, &uid, &uname, &uphoto, &gname, &focus, &timeWindow, &desc, &count, &urgent, &posted)

			beacons = append(beacons, map[string]interface{}{
				"id":             id,
				"userId":         uid,
				"userName":       uname,
				"userPhoto":      uphoto,
				"gymName":        gname,
				"targetFocus":    focus,
				"timeWindowText": timeWindow,
				"description":    desc,
				"responsesCount": count,
				"isUrgent":       urgent == 1,
				"postedAt":       posted,
			})
		}
		sendJSON(w, http.StatusOK, beacons)
		return
	}

	if r.Method == http.MethodPost {
		var b map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		beaconID := fmt.Sprintf("beacon_%d", time.Now().UnixNano())
		DB.Exec(`INSERT INTO beacons (
			id, user_id, user_name, user_photo, gym_name, target_focus, time_window_text, description, responses_count, is_urgent, posted_at
		) VALUES (?, 'user_me', 'Dave', '', ?, ?, ?, ?, 0, 0, 'Just now')`,
			beaconID, b["gymName"], b["targetFocus"], b["timeWindowText"], b["description"])

		sendJSON(w, http.StatusOK, map[string]string{"status": "created", "id": beaconID})
		return
	}

	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}

// Storage Presign Endpoint (/api/storage/presign)
func HandleStoragePresign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	filename := r.URL.Query().Get("filename")
	if filename == "" {
		filename = fmt.Sprintf("fit_check_%d.jpg", time.Now().Unix())
	}
	contentType := r.URL.Query().Get("contentType")
	if contentType == "" {
		contentType = "image/jpeg"
	}

	uploadURL, publicCDNURL, isLocal := GeneratePresignedUploadURL(filename, contentType)

	// If local, prepend the host
	if isLocal {
		host := r.Host
		if !strings.HasPrefix(host, "http") {
			host = "http://" + host
		}
		uploadURL = host + uploadURL
		publicCDNURL = host + publicCDNURL
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"uploadUrl":    uploadURL,
		"publicCdnUrl": publicCDNURL,
		"isLocal":      isLocal,
		"storageType":  func() string { if isLocal { return "local_disk" }; return "cloudflare_r2" }(),
	})
}

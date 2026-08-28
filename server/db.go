package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func initDB() {
	dbPath := filepath.Join(".", "spotter.db")
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open SQLite database: %v", err)
	}

	createTables()
	seedInitialData()
	log.Println("SQLite database initialized successfully at", dbPath)
}

func createTables() {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		age INTEGER,
		gender TEXT,
		bio TEXT,
		photos_json TEXT,
		primary_gym_json TEXT,
		experience_level TEXT,
		primary_modalities_json TEXT,
		workout_split TEXT,
		partnership_cadence TEXT,
		cadence_commitment TEXT,
		spotting_style TEXT,
		gym_energy TEXT,
		reliability_score REAL,
		completed_workouts_count INTEGER,
		is_coach INTEGER DEFAULT 0,
		coach_mode_enabled INTEGER DEFAULT 1,
		coach_verification_status TEXT DEFAULT 'none',
		coach_title TEXT,
		hourly_rate TEXT,
		accreditation_body TEXT,
		credential_id_number TEXT,
		cpr_aed_verified INTEGER DEFAULT 0,
		liability_insurance_verified INTEGER DEFAULT 0,
		coaching_specialties_json TEXT,
		certifications_json TEXT,
		benchmarks_json TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS swipes (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		target_user_id TEXT NOT NULL,
		direction TEXT NOT NULL,
		super_spot_details_json TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS matches (
		id TEXT PRIMARY KEY,
		user1_id TEXT NOT NULL,
		user2_id TEXT NOT NULL,
		matched_at TEXT NOT NULL,
		schedule_overlap_score INTEGER DEFAULT 90,
		active_session_json TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
		match_id TEXT NOT NULL,
		sender_id TEXT NOT NULL,
		text TEXT NOT NULL,
		timestamp TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS beacons (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		user_name TEXT NOT NULL,
		user_photo TEXT,
		gym_name TEXT NOT NULL,
		target_focus TEXT NOT NULL,
		time_window_text TEXT NOT NULL,
		description TEXT,
		responses_count INTEGER DEFAULT 0,
		is_urgent INTEGER DEFAULT 0,
		posted_at TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS coach_verifications (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		accreditation_body TEXT NOT NULL,
		credential_id_number TEXT NOT NULL,
		certificate_file_url TEXT,
		cpr_file_url TEXT,
		liability_insurance_verified INTEGER DEFAULT 0,
		status TEXT DEFAULT 'pending',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := DB.Exec(schema)
	if err != nil {
		log.Fatalf("Failed to create database schema: %v", err)
	}
}

func seedInitialData() {
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM users WHERE id = 'user_me'").Scan(&count)
	if count > 0 {
		return // already seeded
	}

	log.Println("Seeding initial Spotter lifters and default mock state...")

	// 1. Current User (Dave)
	mePhotos, _ := json.Marshal([]string{
		"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
	})
	meGym, _ := json.Marshal(map[string]interface{}{
		"brand":        "Powerhouse Gym",
		"branchName":   "Powerhouse Gym - Saddle Brook",
		"neighborhood": "Saddle Brook, NJ",
	})
	meModalities, _ := json.Marshal([]string{"Powerlifting", "Bodybuilding"})
	meBenchmarks, _ := json.Marshal(map[string]interface{}{
		"category": "Barbell Compounds",
		"benchmarks": []map[string]string{
			{"id": "b1", "name": "Flat Bench", "value": "225 lbs"},
			{"id": "b2", "name": "Barbell Squat", "value": "315 lbs"},
			{"id": "b3", "name": "Barbell Deadlift", "value": "405 lbs"},
			{"id": "b4", "name": "Incline DBs", "value": "90 lb DBs"},
		},
	})

	DB.Exec(`INSERT INTO users (
		id, name, age, gender, bio, photos_json, primary_gym_json, experience_level,
		primary_modalities_json, workout_split, partnership_cadence, cadence_commitment,
		spotting_style, gym_energy, reliability_score, completed_workouts_count,
		is_coach, coach_mode_enabled, coach_verification_status, benchmarks_json
	) VALUES (
		'user_me', 'Dave', 29, 'male',
		'Focusing on heavy compounds (PPL split) and building consistency. Looking for a solid spotter on bench/squat days.',
		?, ?, 'Advanced', ?, 'Push / Pull / Legs (PPL)', 'Consistent Weekly Partner (3-4x/week)',
		'Mon / Wed / Fri @ 6:30 AM', 'Lift-off assist, watch bar velocity, stay focused',
		'Headphones on, high intensity, locked in', 98.5, 34, 0, 0, 'none', ?
	)`, string(mePhotos), string(meGym), string(meModalities), string(meBenchmarks))

	// 2. Maya (Powerlifter)
	mayaPhotos, _ := json.Marshal([]string{
		"https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800",
	})
	mayaGym, _ := json.Marshal(map[string]interface{}{
		"brand": "Retro Fitness", "branchName": "Retro Fitness - Garfield", "neighborhood": "Garfield, NJ",
	})
	mayaModalities, _ := json.Marshal([]string{"Powerlifting", "Glute & Lower Body"})
	DB.Exec(`INSERT INTO users (
		id, name, age, gender, bio, photos_json, primary_gym_json, experience_level,
		primary_modalities_json, workout_split, partnership_cadence, cadence_commitment,
		spotting_style, gym_energy, reliability_score, completed_workouts_count, is_coach
	) VALUES (
		'user_maya', 'Maya', 26, 'female',
		'Powerlifter running a lower body/glute hypertrophy split. Need someone reliable for heavy barbell hip thrust hand-offs and bench lift-offs.',
		?, ?, 'Advanced', ?, 'Glute / Hamstrings / Upper (Lower Focus)', 'Consistent Weekly Partner (3-4x/week)',
		'Mon / Wed / Fri @ 6:00 PM', 'Lift-off assist, count reps, positive reinforcement', 'Locked in with headphones, focused and high energy', 99.0, 48, 0
	)`, string(mayaPhotos), string(mayaGym), string(mayaModalities))

	// 3. Tariq (CSCS Verified Coach)
	tariqPhotos, _ := json.Marshal([]string{
		"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
	})
	tariqGym, _ := json.Marshal(map[string]interface{}{
		"brand": "Powerhouse Gym", "branchName": "Powerhouse Gym - Saddle Brook", "neighborhood": "Saddle Brook, NJ",
	})
	tariqModalities, _ := json.Marshal([]string{"Powerlifting", "Bodybuilding", "Olympic Lifting"})
	tariqSpecialties, _ := json.Marshal([]string{"Barbell Bench Arch & Path", "Squat Depth & Hip Drive", "Deadlift Wedge Setup"})
	tariqCerts, _ := json.Marshal([]string{"NSCA-CSCS (Certified Strength & Conditioning Specialist)", "USA Weightlifting Level 2", "Red Cross CPR/AED Certified"})
	DB.Exec(`INSERT INTO users (
		id, name, age, gender, bio, photos_json, primary_gym_json, experience_level,
		primary_modalities_json, workout_split, partnership_cadence, cadence_commitment,
		spotting_style, gym_energy, reliability_score, completed_workouts_count,
		is_coach, coach_mode_enabled, coach_verification_status, coach_title, hourly_rate,
		accreditation_body, credential_id_number, cpr_aed_verified, liability_insurance_verified,
		coaching_specialties_json, certifications_json
	) VALUES (
		'user_tariq', 'Tariq', 31, 'male',
		'Certified NSCA-CSCS strength coach & competitive powerlifter (750kg total). Offering form clinics and looking for serious heavy spot partners.',
		?, ?, 'Elite Athlete', ?, 'Push / Pull / Legs (PPL)', 'Consistent Weekly Partner (3-4x/week)',
		'Mon / Wed / Fri @ 5:30 PM', 'Active bar path tracking, verbal cueing, strict safety', 'Laser focused, technical precision, high intensity', 99.4, 112,
		1, 1, 'verified', 'CSCS Strength Coach & Barbell Specialist', '$45 / 30-min Form Clinic',
		'NSCA', 'CSCS-72491028', 1, 1, ?, ?
	)`, string(tariqPhotos), string(tariqGym), string(tariqModalities), string(tariqSpecialties), string(tariqCerts))

	// 4. Initial Match & Session with Maya
	activeSession, _ := json.Marshal(map[string]interface{}{
		"id":                     "session_1",
		"matchId":                "match_1",
		"scheduledDate":          "Today",
		"scheduledTime":          "6:00 PM",
		"gymName":                "Retro Fitness - Garfield",
		"splitFocus":             "Flat Bench & Incline PRs",
		"userCheckedIn":          true,
		"partnerCheckedIn":       true,
		"status":                 "scheduled",
		"isRecurring":            true,
		"recurringDays":          []string{"Mon", "Wed", "Fri"},
		"streakWeeks":            3,
		"totalSessionsCompleted": 9,
	})

	DB.Exec(`INSERT INTO matches (id, user1_id, user2_id, matched_at, schedule_overlap_score, active_session_json)
		VALUES ('match_1', 'user_me', 'user_maya', '2 hours ago', 92, ?)`, string(activeSession))

	DB.Exec(`INSERT INTO messages (id, match_id, sender_id, text, timestamp) VALUES
		('m1', 'match_1', 'user_maya', 'Hey Dave! Saw you train at Retro too. What split are you running tonight?', '5:45 PM'),
		('m2', 'match_1', 'user_me', 'Hey Maya! Working on heavy flat barbell bench and incline dumbbells.', '5:50 PM'),
		('m3', 'match_1', 'user_maya', 'I got you on the liftoff! Warming up at Bench Station 3 right now.', '5:55 PM'),
		('m4', 'match_1', 'user_me', 'Just checked in at the front desk. Walking over to the free weights now!', '6:00 PM'),
		('m5', 'match_1', 'user_maya', 'Awesome! Let hit bench & incline first, then I have barbell hip thrusts. See you at 6!', '6:15 PM')
	`)

	// 5. Initial Gym Beacons
	DB.Exec(`INSERT INTO beacons (id, user_id, user_name, gym_name, target_focus, time_window_text, description, responses_count, posted_at) VALUES
		('b1', 'user_maya', 'Maya', 'Retro Fitness - Garfield', 'Flat Bench Spot & Incline DBs', 'Tonight @ 6:00 PM', 'Looking for an experienced spotter for heavy bench sets (working up to 185 lbs).', 3, '10m ago'),
		('b2', 'user_tariq', 'Tariq', 'Powerhouse Gym - Saddle Brook', 'Heavy Weighted Dips (+90 lbs)', 'Friday @ 5:30 PM', 'Hitting heavy chest and weighted dips. Need a partner to load plates on dipping belt.', 2, '45m ago')
	`)
}

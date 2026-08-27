# 🏋️ Spotter — Tinder for Gym Partners

> **Spotter** is an iOS & Android mobile application built with React Native + Expo designed to connect gym-goers, athletes, and lifters with compatible workout partners, spotters, and accountability buddies.

---

## ✨ Features

### 1. 🔥 Fitness DNA Profiles & Gesture Swiping Deck
- **Interactive Card Deck**: Smooth 60fps pan/drag gestures (Swipe Right to Connect, Swipe Left to Pass, Backtrack/Undo).
- **'Request a Spot' (Super-Like)**: Propose a specific workout session (e.g. *"Heavy Chest Day tomorrow at 6 PM"*) directly from the card.
- **Gym Match Badges**: Highlights shared gym memberships (e.g. *🟢 Goes to Equinox - Williamsburg*).
- **Reliability Rating**: Public accountability score based on verified in-gym check-ins (e.g. *99% Reliable • 42 Workouts Completed*).

### 2. 🛡️ Privacy by Design & Anti-Stalking Gating
- **3-Tier Progressive Disclosure**:
  - *Public Deck*: Distance is fuzzed (e.g. *'< 2 miles away'*), gym location is masked to brand or 'Same Gym', and schedule is abstracted (*88% Compatibility*).
  - *Mutual Match*: Unlocks exact gym branch and full schedule calendar.
  - *Workout Booking*: Confirms exact session time and station with in-gym geofenced check-in.
- **Ghost / Stealth Mode**: Browses invisibly; you are only visible to lifters you swipe right on first.
- **Women-Only Mode**: Exclusive discovery queue for female lifters.
- **Anti-Trilateration Jitter**: Prevents triangulating residential coordinates.

### 3. 🚨 Live "Gym Beacon" (Same-Day Urgent Spotter Board)
- Post or respond to urgent, real-time spotter requests happening today at your gym (e.g. *"Need a bench spot for 315 lbs in 30 mins at Equinox Williamsburg"*) with an option for anonymous posting.

### 4. 🔒 Workout Scheduler & In-Gym Check-In
- Lock in gym sessions directly inside match chats.
- Dual-party check-in system that calculates show-up rates and prevents flaking.

---

## 📱 How to Run and Test on Your iPhone

### 1. Install Expo Go
Download the free **Expo Go** app from the [Apple App Store](https://apps.apple.com/app/expo-go/id982105225) on your iPhone.

### 2. Start Development Server on Windows
```powershell
cd C:\Users\daver\spotter-app
npm start
```

### 3. Scan with iPhone Camera
1. Open the default **Camera app** on your iPhone.
2. Point it at the QR code displayed in your terminal.
3. Tap the yellow **"Open in Expo Go"** banner.
4. The Spotter app will launch with live hot-reloading!

---

## 🛠️ Tech Stack
- **Framework**: React Native with Expo (SDK 57)
- **Language**: TypeScript
- **Gestures & Physics**: `react-native-gesture-handler`, `react-native-reanimated`, Animated API
- **Styling**: Athletic dark theme with `expo-linear-gradient`
- **Icons**: `lucide-react-native` & `react-native-svg`
- **Haptics**: `expo-haptics`

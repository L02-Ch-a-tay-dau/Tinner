# User Flows – Tinner MVP

This document describes the user flow diagrams for two crucial MVP features of **Tinner – Tinder for Food**. These flows represent the core user journey from discovering dishes to making a dining decision.

---

# 🔹 Feature 1 – Swipe to Discover & Save Dishes

![Swipe Flow](https://github.com/user-attachments/assets/c00738ec-f52b-475f-b053-a347c415c6e1)

## Overview

This feature enables users to discover nearby dishes using a swipe-based interaction model inspired by Tinder. It serves as the primary discovery mechanism of the application.

The system presents dishes based on the user’s current location, allowing quick and intuitive decision-making.

---

## Objective

- Allow users to browse nearby dishes
- Enable fast decisions (like / skip)
- Save preferred dishes into a personal **“Want to Try”** list
- Provide direct navigation to the restaurant via Google Maps
- Handle edge cases such as no more dishes available

---

## Flow Description

1. The user opens the application.
2. If it is the first time using the app, location permission is requested.
3. The system fetches nearby dishes based on the user’s location.
4. The swipe screen is displayed, showing:
   - Dish image  
   - Dish name  
   - Price  
   - Rating  
   - Distance  
   - Restaurant name  
5. The user can perform one of three actions:
   - **Swipe Left** → Skip the dish  
   - **Swipe Right** → Save the dish to the “Want to Try” list  
   - **Tap Navigate** → View restaurant details and open Google Maps  
6. After each swipe interaction, the system checks:
   - If more dishes are available → display the next dish  
   - If no more dishes are available → show a “No more dishes nearby” state  

---

## Why This Is a Crucial MVP Feature

This feature represents the core value proposition of Tinner:

> Helping users decide what to eat quickly through a simple, engaging interaction.

Without this feature, the application would not fulfill its primary purpose of food discovery.

---

# 🔹 Feature 2 – Manage “Want to Try” List

![Saved List Flow](https://github.com/user-attachments/assets/7c1483a0-71fe-4b7e-a994-d152b7558a0e)

## Overview

This feature allows users to review and manage dishes they previously saved. It transforms the discovery phase into an actionable decision-making process.

---

## Objective

- Allow users to access saved dishes
- Enable comparison and reconsideration
- Provide navigation to selected restaurants
- Allow removal of saved items
- Handle empty list scenarios

---

## Flow Description

1. The user taps the **“Want to Try”** list from the swipe screen.
2. The system displays all saved dishes.
3. The user can perform one of three actions:

   **View Dish Details**
   - Open dish detail screen  
   - View restaurant information  
   - Select “Get Directions” to open Google Maps  

   **Remove Dish**
   - Remove dish from the list  
   - System updates the saved list  
   - If the list becomes empty → display “No saved dishes yet”  

   **Return to Swipe Screen**
   - Navigate back to the discovery screen  

---

## Why This Is a Crucial MVP Feature

The swipe feature enables discovery, while the saved list enables decision-making.

This feature ensures:
- Continuity in the user journey  
- Data persistence  
- Practical usability (users can compare options before deciding)  

Together, both features complete the essential user flow of the MVP:

1. Discover dishes  
2. Save preferred options  
3. Review saved dishes  
4. Navigate to restaurant  

These two features represent the minimum viable experience required to validate the Tinner concept.

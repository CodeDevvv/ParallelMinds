# ParallelMinds

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

ParallelMinds is a MERN-stack web application designed to connect individuals based on psychological profiles, shared interests, and life experiences. The platform utilizes a weighted algorithm to group users into support circles, fostering meaningful connections through real-time chat and local event participation.

The application is divided into two distinct portals: **Client Side** for users and **Admin Side** for platform management.

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
  - [General Architecture](#general-architecture)
  - [Client Side](#client-side)
  - [Admin Side](#admin-side)
- [The Grouping Algorithm](#the-grouping-algorithm)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Contact](#contact)

---

## About the Project

ParallelMinds moves beyond simple social networking by prioritizing mental well-being and shared experiences. Users are not just matched randomly; they are grouped based on standardized psychological assessments (PHQ-9 and GAD-7), specific life-transforming events, and geolocation.

The platform ensures a safe, verified environment where users can chat with their group, attend events curated for their specific community, and receive support.

---

## Tech Stack

**Core Stack**  
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

**Styling & UI**  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Management & Tools**  
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

---

## Key Features

### General Architecture
* **Package Management:** Built entirely using **Bun** for fast dependency management and script execution.
* **Authentication:** Secure custom login system using **JWT (JSON Web Tokens)** and HTTP-only cookies for API verification.
* **Route Protection:** All internal routes are wrapped in protected components ensuring only authenticated access.
* **Data Integrity:**
    * **Yup** is used for rigorous form validation.
    * Critical database operations utilize **MongoDB Transactions** to ensure atomicity.
* **Performance:** All data-heavy pages feature server-side pagination.

### Client Side
The user journey is designed to be mandatory and linear to ensure data quality:
1.  **Registration Flow:** New users must complete a registration form followed immediately by a **compulsory questionnaire** (PHQ-9, GAD-7, Interests, Recent Life Events).
    * *Fail Safe:* If the questionnaire is not successfully completed, the initial registration is rolled back/removed to prevent "ghost" users.
2.  **Intelligent Grouping:** Upon login, the system checks for existing group membership.
    * If ungrouped, the **Grouping Algorithm** runs automatically.
    * Once grouped, the user is redirected to the Dashboard.
3.  **Group Interaction:**
    * **Real-time Chat:** Socket.io integration allows group members to chat (Room ID matches Group ID).
    * **Group Metadata:** Users can see the group's average PHQ/GAD scores and common interests.
4.  **Events & Feedback:**
    * View upcoming events filtered by the group's central location.
    * Register for events.
    * View past/missed events and provide feedback.
5.  **Support:** Integrated ticketing system to send queries to admins and track status.

### Admin Side
* **Dashboard:** High-level metrics (User count, Group count, Events) and daily quotes.
* **Group Management:** Ability to view groups, monitor chats, and remove disruptive users.
* **Event Management:**
    * Create, Read, Update, Delete (CRUD) events.
    * **Auto-Broadcast:** Creating an event triggers an API call that instantly notifies relevant matched groups via their chat rooms.
* **User Management:** Manage user accounts and admin privileges.

---

## The Grouping Algorithm

The core of ParallelMinds is its matching logic. We do not group users randomly. The system calculates a compatibility score based on weighted vectors.

**How it works:**

1.  **Normalization:** The user's PHQ-9 and GAD-7 scores are normalized against the system's total weight configuration.
2.  **Geo-Spatial Filtering:** The system first filters active groups to find those within a specific `cutoffDistance` from the user's coordinates.
3.  **Similarity Calculation:**
    * **Psychometric:** Calculates the absolute difference between User and Group normalized scores.
    * **Jaccard Similarity:** Used for qualitative data (Life Events and Interests) to find the intersection over the union of sets.
4.  **Weighted Scoring:**
    $$TotalSimilarity = (P_{sim} \times W_{phq}) + (G_{sim} \times W_{gad}) + (L_{sim} \times W_{life}) + (I_{sim} \times W_{int})$$
5.  **Threshold & Assignment:** Groups meeting the `matchingThreshold` are sorted by score, and the user is assigned to the highest-match group.

---
## Event Matching Algorithm

The platform employs a secondary matching algorithm on the Admin side to ensure that created events are broadcast only to relevant support groups. This prevents notification fatigue and ensures high engagement by matching events to the specific clinical and social needs of a group.

**How it works:**

1.  **Geo-Spatial Filtering:**
    The system first establishes a **50km radius** boundary around the event's location. Any group with a central coordinate outside this range is automatically excluded from the calculation.

2.  **Clinical Severity Alignment:**
    The algorithm checks the event's target severity range (e.g., "Moderate Anxiety") against the group's aggregated **PHQ-9** and **GAD-7** averages. This ensures that clinical workshops are directed toward groups currently experiencing those specific severity levels.

3.  **Qualitative Overlap (Jaccard Similarity):**
    Using Jaccard Similarity indices, the system calculates the intersection between:
    * **Target Interests:** The event's tags vs. the group's shared interests.
    * **Life Transitions:** The event's topic (e.g., "Job Loss") vs. the group's common life events.

4.  **Dynamic Weighted Scoring:**
    Weights are not static; they shift based on the **Event Type**.
    * *Social Events:* Place higher weight on Shared Interests.
    * *Therapeutic Sessions:* Place higher weight on Clinical Scores and Life Transitions.

    The final relevance score is calculated as:
    $$Score = (Interest_{sim} \times W_{int}) + (Transition_{sim} \times W_{trans}) + (Clinical_{match} \times W_{clinical})$$

5.  **Threshold & Distribution:**
    Only groups achieving a relevance score of **≥ 0.40** are considered matches. The system then atomically updates the matching groups' databases to display the event on their dashboards.


---
## Archetutre

## System Architecture

```text
+---------------------+                            +-------------------------------------------+
|     CLIENT SIDE     |                            |                SERVER SIDE                |
| (React/Vite + Bun)  |                            |           (Node/Express + Bun)            |
+----------+----------+                            +----------------------+--------------------+
           |                                                              |
           | 1. HTTP Request (Login/Data)                                 |
           |    (Sent via Axios with JWT)                                 |
           +------------------------------------------------------------->|  [Authentication Middleware]
           |                                                              |  (Verifies Token & Cookies)
           |                                                              |           |
           |                                                              |           v
           |                                                              |  [API Controllers]
           | 2. WebSocket Connection                                      |  (Handles Logic)
           |    (Real-time Chat)                                          |           |
           +------------------------------------------------------------->|           +----+
                                                                          |           |    |
                                                                          |           |    v
                                        +-----------------------------+   |   +-------+------------------+
                                        |      GROUPING ENGINE        |<--+   |   Database (MongoDB)     |
                                        | (Calculates Weighted Score) |------>| (Transactional Queries)  |
                                        +-----------------------------+       +--------------------------+

```

```text
+-----------------------+                           +------------------------------------------+
|      ADMIN DASHBOARD  |                           |               SERVER SIDE                |
|   (React/Vite + Bun)  |                           |          (Node/Express + Bun)            |
+-----------+-----------+                           +---------------------+--------------------+
            |                                                             |
            | 1. Admin Login Request                                      |
            +------------------------------------------------------------>| [Admin Middleware]
            |                                                             | (Checks Role="Admin")
            |                                                             |           |
            | 2. Management Requests                                      |           v
            | (Ban User, Delete Group, Stats)                             | [Admin Controllers]
            +------------------------------------------------------------>|           |
            |                                                             |           | 3. Data Ops
            |                                                             |           v
            |                                                             | +---------+------------+
            | 4. Create Event & Broadcast                                 | |  MongoDB Database    |
            | (Trigger: "New Event Created")                              | | (Users/Groups/Events)|
            +------------------------------------------------------------>| +---------+------------+
                                                                          |           |
                                                                          |           | 5. Trigger
                                                                          |           v
                                                                          | +---------+------------+
                                                                          | |   Socket.io Server   |
                                                                          | |  (Event Broadcast)   |
                                                                          | +---------+------------+
                                                                                      |
                                                                                      | 6. Push Notification
                                                                                      v
                                                                               [Client Chat Rooms]

```

---
## Getting Started

To run this project locally, ensure you have **Bun** and **MongoDB** installed.

### Prerequisites

* Bun `v1.0+`
* Node.js (LTS recommended)
* MongoDB Instance

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/ParallelMinds.git](https://github.com/yourusername/ParallelMinds.git)
    cd ParallelMinds
    ```

2.  **Install dependencies (Root, Client, and Server)**
    ```bash
    bun install
    cd client && bun install
    cd ../server && bun install
    ```

3.  **Environment Configuration**  
    Create a `.env` file in the admin/backend directory:
    ```env
    MONGODB_URI=your_mongodb_connect_string
    JWT_SECRET_KEY = your_jwt_secret
    ENCRYPTION_KEY = your_encription_key_string
    PORT=5000
    ```
    Create a `.env` file in the admin/frontend directory:
    ```env
    VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
    VITE_API_BASE_URL=http://localhost:5000/api/admin
    ```

     Create a `.env` file in the client/backend directory:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connect_string
    JWT_SECRET_KEY = your_jwt_secret
    ENCRYPTION_KEY = your_encription_key_string
    ```
    Create a `.env` file in the admin/frontend directory:
    ```env
    VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
    VITE_BACKEND_PORT=3000
    VITE_BACKEND_BASE_URL=http://localhost:3000
    VITE_RAPIDAPI_KEY = your_rapid_api_key
    ```

4.  **Run the application**
    *Server:*
    ```bash
    cd server
    bun run dev
    ```
    *Client:*
    ```bash
    cd client
    bun run dev
    ```

---

## Roadmap / Future Improvements

* [ ] **Machine Learning Integration:** Replace the current weighted algorithm with a trained ML model for more nuanced grouping.
* [ ] **Async Processing:** Implement **RabbitMQ** to handle notifications and heavy tasks asynchronously.
* [ ] **Background Jobs:** Move the grouping process to a background job queue for scalability during high traffic.
* [ ] **Mobile App:** Develop a React Native version for iOS and Android.

---

## Lessons Learned

* **Transactional Integrity:** Implementing MongoDB transactions was crucial for the registration flow to ensure users aren't created without their accompanying psychological profile data.
* **Socket.io Rooms:** Managing dynamic room assignment based on database group IDs allowed for scalable, private group conversations.
* **Mathematical Modeling:** Translating qualitative data (interests) into quantitative matching scores using Jaccard Similarity.

---

## Contact

**Author:** VIJAY S PATIL  
**Email:** vijaypatil0516@gmail.com  
**Project Link:** [https://github.com/yourusername/ParallelMinds](https://github.com/yourusername/ParallelMinds)

---

## Acknowledgments

* [Bun](https://bun.sh/)
* [Tailwind CSS](https://tailwindcss.com/)
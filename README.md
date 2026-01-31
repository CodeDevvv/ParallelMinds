# ParallelMinds

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

ParallelMinds is a specialized social platform designed to connect individuals based on psychological profiles, shared interests, and life experiences. Unlike generic social networks, ParallelMinds prioritizes mental wellbeing by using a weighted algorithmic engine to group users into "Support Circles," fostering meaningful connections through realtime chat and hyperlocal event participation.

The application serves two distinct user bases: the **Client Portal** for users seeking community, and the **Admin Portal** for platform management and event orchestration.

## Table of Contents

* [About the Project](#about-the-project)
* [Tech Stack](#tech-stack)
* [Architectural Evolution](#architectural-evolution)
* [Key Features](#key-features)
* [The Matching Engines](#the-matching-engines)
* [Geospatial Infrastructure](#geospatial-infrastructure)
* [System Architecture](#system-architecture)
* [Getting Started](#getting-started)
* [Contact](#contact)

---

## About the Project

ParallelMinds moves beyond simple social networking by ensuring users are placed in environments that genuinely support their mental health. Users are not matched randomly; they are grouped based on standardized psychological assessments (PHQ-9 and GAD-7), specific life transforming events (e.g., "Job Loss", "Lost someone close"), and precise geolocation.

The platform ensures a safe, verified environment where users can chat with their group, attend events curated for their specific community, and receive support.

---

## Tech Stack

**Core Stack**  
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) 
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)  
**(NEW)**    
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)  
**(PREVIOUSLY)**   
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)  

**Styling & UI**  
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
 
**Management & Tools**  
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

---

## Architectural Evolution

During the development lifecycle, ParallelMinds underwent a massive architectural refactor, moving from a NoSQL (MongoDB) document structure to a Relational (PostgreSQL) Spatial database.

### 1. Migration: MongoDB → PostgreSQL
Initially, MongoDB was chosen for its flexible schema. However, due to the complexity of the relationships specifically between Users, Groups, Events, Feedbacks, and Chat Logs maintaining data integrity became a significant challenge.

* **Referential Integrity:** In MongoDB, ensuring that a user wasn't assigned to a non existent group required manual application layer checks. PostgreSQL’s Foreign Keys and `ON DELETE CASCADE` constraints now handle this automatically, ensuring zero orphaned data.
* **Strict Data Validation:** The nature of mental health data requires precision. We moved from Mongoose Schemas to PostgreSQL Enums and Check Constraints (e.g., ensuring GAD-7 scores never exceed 21 at the database level), providing a stronger guarantee of data quality.
* **Complex Joins:** The dashboard metrics required aggregating data across four different collections. PostgreSQL's optimized `JOIN` capabilities reduced what was previously 4 separate network calls into a single, high performance query.

### 2. Moving Logic to the Database
The most critical optimization was migrating the Matching Algorithm from the Node.js application layer to the Database layer.

* **(PREVIOUSLY) The Problem:** The server would fetch all available groups into memory, loop through them in JavaScript, calculate distances, and compute similarity scores. This was an O(N) operation that choked the Node.js event loop as the dataset grew.
* **(NEW) The Solution:** I rewrote the algorithm as a complex SQL Query utilizing PostGIS. Now, the database filters groups by distance using Spatial Indices (R-Tree) and calculates similarity scores on the fly. (Refer: [The Matching Engines](#the-matching-engines))
* **The Result:** What used to take ~400ms in Node.js now takes ~15ms in PostgreSQL, as the data never leaves the database engine until the final match is found.

---

## Key Features

### General Architecture
* **Package Management:** Built entirely using **Bun** for fast dependency management and script execution.
* **Authentication:** Secure custom login system using **JWT** and HTTP only cookies for API verification.
* **Route Protection:** All internal routes are wrapped in protected components ensuring only authenticated access.
* **Performance:** All heavy data pages feature server side pagination.

### Client Side
The user journey is designed to be mandatory and linear to ensure data quality:
1.  **Registration Flow:** New users must complete a registration form followed immediately by a **compulsory questionnaire** (PHQ-9, GAD-7, Interests, Recent Life Events).
    * *Failsafe:* If the questionnaire is not successfully completed, the initial registration is rolled back to prevent "ghost" users.
2.  **Intelligent Grouping:** Upon login, the system checks for existing group membership. If ungrouped, the algorithm runs automatically.
3.  **Group Interaction:**
    * **Realtime Chat:** Socket.io integration allows group members to chat (Room ID matches Group ID).
    * **Group Metadata:** Users can see the group's average PHQ/GAD scores and common interests.
4.  **Events & Feedback:** View upcoming events filtered by the group's central location, register, and provide feedback on past events.
5.  **Support:** Integrated ticketing system to send queries to admins.

### Admin Side
* **Dashboard:** High level metrics (User count, Group count, Events).
* **Group Management:** View groups, monitor chats, and remove disruptive users.
* **Event Management:**
    * CRUD operations for events.
    * **Auto Broadcast:** Creating an event triggers an API call that instantly notifies relevant matched groups via their chat rooms.
* **User Management:** Manage user accounts and admin privileges.

---

## The Matching Engines

### 1. Grouping Algorithm (PREVIOUSLY)
*Legacy Node.js Implementation*

The system originally calculated compatibility scores based on weighted vectors in the application layer.
1.  **Normalization:** Scores normalized against total weight configuration.
2.  **Geospatial Filtering:** Filtered groups within `cutoffDistance`.
3.  **Similarity Calculation:** Used Jaccard Similarity for qualitative data.
4.  **Weighted Scoring:**
    $$TotalSimilarity = (P_{sim} \times W_{phq}) + (G_{sim} \times W_{gad}) + (L_{sim} \times W_{life}) + (I_{sim} \times W_{int})$$

### 2. The SQL Based Matching Engine (NEW)
*Current PostGIS Implementation*

The core of ParallelMinds is now a set of optimized SQL queries that perform multi dimensional vector matching directly in the database.

* **Spatial Filtering (PostGIS):** Instead of calculating the Haversine formula in code, we use `ST_DWithin`.
    ```sql
    WHERE ST_DWithin(group_location, user_location, 50000) -- 50km Radius
    ```
    This utilizes spatial indexing, allowing the DB to ignore 99% of groups instantly without loading them.

* **Vector Similarity:** We calculate the intersection of interests directly in the query:
    ```sql
    (SELECT COUNT(*) FROM UNNEST(group.interests) INTERSECT SELECT COUNT(*) FROM UNNEST(user.interests))
    ```

* **Weighted Scoring:** The final selection uses a weighted formula injected directly into the `ORDER BY` clause:
    $$Score = (Interest_{overlap} \times 0.4) + (Clinical_{delta} \times 0.3) + (LifeEvent_{match} \times 0.3)$$

---

## Geospatial Infrastructure

To achieve hyperlocal community building, we utilize a dual stack approach:

1.  **Frontend (GeoApify):** We use the GeoApify API for address autocomplete and forward geocoding. When a user types their city, GeoApify converts it into precise `[Latitude, Longitude]` coordinates before the form is even submitted.
2.  **Backend (PostGIS Extension):** Standard databases treat coordinates as simple numbers. We use the PostGIS extension for PostgreSQL to treat them as `GEOGRAPHY` types. This allows us to perform accurate earth curvature calculations.

---

## System Architecture

```plaintext
+----------------------+           +------------------------------------------+
|      CLIENT SIDE     |           |              SERVER SIDE                 |
|   (React + Docker)   |           |        (Node/Express + Docker)           |
+----------+-----------+           +---------------------+--------------------+
           |                                             |
           | 1. HTTP Request (Axios)                     |
           +-------------------------------------------->| [Auth Middleware]
           |                                             | (JWT Validation)
           | 2. Address Lookup (GeoApify)                |         |
           +-----------------.                           |         v
                             |                           | [Controllers]
          (External API) <---+                           |         |
                                                         |         | 3. SQL Query
           | 3. WebSocket (Chat/Presence)                |         v
           +-------------------------------------------->| +-------+------------------+
                                                         | |  PostgreSQL + PostGIS    |
                                                         | | (Spatial Indexing Engine)|
                                                         | +-------+------------------+
                                                         |         ^
                                                         |         | 4. Cache/Count
                                                         |         v
                                                         | +-------+-------+
                                                         | |     Redis     |
                                                         | | (Online Count)|
                                                         | +---------------+

```

---

## Getting Started

The entire project is containerized. You do not need to install Node, Mongo, or Postgres locally. You only need Docker Desktop.

### Prerequisites

* Docker & Docker Compose
* Bun 
* Node 

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/CodeDevvv/ParallelMinds
cd ParallelMinds
```
2. **Run with Docker Compose**
This spins up Postgres (with PostGIS), Redis, and pgAdmin.
```bash
docker-compose up -d
```
* Postgres: Port 5432
* Redis: Port 6379
* pgAdmin: http://localhost:5050 (Email: admin@admin.com / Pass: root)

3. **Run Application** (Frontend & Backend)
Open two terminals:

**Terminal 1 (backend):**
```bash
cd server
bun install
bun run server
```
**Terminal 2 (frontend):**
```bash
cd client
bun install
bun run dev
```

4. **Configuration & Database Setup**

* **Environment Variables:** Please refer to the `config_templates/env_examples.md` folder for sample `.env` configurations for both the Client and Admin portals.
* **Infrastructure:** Check `config_templates/docker-compose_example.md` for specific Redis and PostgreSQL + PostGIS container settings.
* **Database Schema:** Refer to `config_templates/init_schema.sql` for all table creation queries, including Enums and Triggers.

---

## Contact

**Author:** VIJAY S PATIL   
**Email:** vijaypatil0516@gmail.com   
**Project Link:** [https://github.com/yourusername/ParallelMinds](https://github.com/yourusername/ParallelMinds)

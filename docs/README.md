---
layout: home
permalink: index.html

# Please update this with your repository name and title
repository-name: cepdnaclk/e21-co227-PeraVerse-Organizer-Dashboard
title: Organizer Dashboard of the Engex exhibition crowd management system
---

# Peraverse Organizer Dashboard (Team-02)

---

[comment]: # "This is the standard layout for the project, but you can clean this and use your own template"

<!-- 
This is a sample image, to show how to add images to your page. To learn more options, please refer [this](https://projects.ce.pdn.ac.lk/docs/faq/how-to-add-an-image/)

![Sample Image](./images/sample.png)
 -->

## Team
- E/21/137, W.W.C.C.J. Fernando, [e21137@eng.pdn.ac.lk](mailto:e21137@eng.pdn.ac.lk)
- E/21/391, Sudasinghe W.R., [e21391@eng.pdn.ac.lk](mailto:e21391@eng.pdn.ac.lk)
- E/21/017, ADEESHA W.L.T., [e21017@eng.pdn.ac.lk](mailto:e21017@eng.pdn.ac.lk)
- E/21/157,  R.C. GUNARATNE, [e21157@eng.pdn.ac.lk](mailto:e21157@eng.pdn.ac.lk)

## Supervisors
- Ms. Yasodha Vimukthi, [yasodhav@eng.pdn.ac.lk](mailto:yasodhav@eng.pdn.ac.lk)

## Table of Contents
1. [Introduction](#introduction)
2. [Solution & Impact](#solution--impact)
3. [Features & Architecture](#features--architecture)
4. [How to Run](#how-to-run)
5. [Deployment](#deployment)
6. [Links](#links)

---

## Introduction

The 75Exhibition Organizer Dashboard is a full-stack web application that provides organizers with a central platform to manage events, alerts, and buildings including exhibits. Built with a web UI and microservices architecture, it delivers real-time updates, modular services, and a scalable, user-friendly interface to ensure efficient and smooth exhibition management.


## Solution & Impact

The Organizer Dashboard provides:

- A clear, intuitive interface for managing events, alerts, Organizers, and buildings including exhibits.
- Real-time updates on event status and Real time alerts sent to kiosks.
- Centralized monitoring of exhibition activities
- A modular microservices architecture for scalable and reliable operations
- A responsive web-based UI for easy access on multiple devices
- Quick decision-making support through consolidated information

This enhances organizer efficiency, improves coordination, and ensures smooth management of the 75Exhibition.


## Features & Architecture

### Key Features
- **Authentication & Security:** JWT authentication is used for secure access And use bcrypt for password hashing.
- **Event Management:** Create, view, and update event details such as title, date, time, description, and venue.
- **Alert System:** Real-time notifications for critical events or updates for kiosks.
- **Building Management:** Managing buildings including exhibits, exhibition spaces for easier planning.
- **Dashboard Interface:** Centralized view of all items.
- **User-Interfac:** Provides a clear and intuitive interface for organizers to manage events, alerts, and building layouts.

### Architecture Overview
- **Frontend:** Web-based UI built with React, javascript, CSS, and responsive design
- **Backend:** Microservices using Node.js and Express, exposing RESTful APIs for each service
- **Services:** Authentication, Event, Alert, Building, and Organizer Management
- **Database:** PostgreSQL  for storing event, alert, organizer data and building data

## How to Run

1.  **Clone Repository**
   ```bash
   git clone https://github.com/cepdnaclk/e21-co227-PeraVerse-Organizer-Dashboard.git
   cd e21-co227-PeraVerse-Organizer-Dashboard
   ```

2. **Install Dependencies**

   **a) Frontend**
   ```bash
   cd frontend
   npm install
   ```

   **b)Backend**

   *Api gateway*
   ```bash
   cd backend/backend/api-gateway
   npm install
   ```

   *Auth service*
   ```bash
   cd backend/backend/services/auth-service
   npm install
   ```

   *Alert service*
   ```bash
   cd backend/backend/services/alert-service
   npm install
   ```

   *Websocket for kiosk*
   ```bash
   cd backend/backend/tools
   npm install
   ```

   *Building service*
   ```bash
   cd backend/backend/services/building-service
   npm install
   ```

   *Event service*
   ```bash
   cd backend/backend/services/event-service
   npm install
   ```

   *Organizer management service*
   ```bash
   cd backend/backend/services/orgMng-service
   npm install
   ```

 3.  **Environmental Variables : Edit .env file inside the backend:**
     ```bash
     PORT=5000
     BASE_URL=http://localhost:5000
     JWT_SECRET=”Your JWT secret key”
     DB_USER=postgres
     DB_PASSWORD=”Your database password”
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=organizer_dashboard
     ADMIN_EMAIL=”Email sending approval request to admin”
     ADMIN_PASSWORD=”your-app-password for ADMIN_EMAIL”
     ADMIN_NOTIFY_EMAIL=”Admin’s email(this email receives the approval request)
     ```


4. **Running the System Locally**

    **a) Frontend**
    ```bash
    cd frontend
    npm run dev
    ```

    **b) Backend**
    ``` bash
    # Websocket for kiosk : first you have to run the web socket
    cd backend/backend/tools
    nodemon ws-server.js
    
    # Then go inside each service and run the follwing command inside the directory where the index.js file is situated
    nodemon index

    
## Links

- [Project Repository](https://github.com/cepdnaclk/e21-co227-PeraVerse-Organizer-Dashboard)
- [Project Page](https://cepdnaclk.github.io/e21-co227-PeraVerse-Organizer-Dashboard/)
- [Department of Computer Engineering](http://www.ce.pdn.ac.lk/)
- [University of Peradeniya](https://eng.pdn.ac.lk/)


### Tags
`React`, `Express.js`,`Node.js`, `Full-Stack`, `Microservices` ,`RESTful API`, `JWT Authentication`, `Event Management`, `Dashboard`, `Crowd Management`, `75Exhibition`


[//]: # (Please refer this to learn more about Markdown syntax)
[//]: # (https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

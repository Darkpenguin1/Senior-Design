# 🎟️ Senior Design - PickFix

## 🌟 Highlights
*   **Fast & Reliable:** Powered by Java Spring Boot backend and an AWS RDS PostgreSQL database.
*   **Serverless Flexibility:** Utilizes AWS Lambda for seamless and scalable cloud processing.
*   **Modern Frontend:** Built with React, Vite, and Tailwind CSS for a beautiful, instantly-responsive user experience.
*   **Secure by Design:** Integrates with AWS Secrets Manager to keep your data and credentials locked down.

## ℹ️ Overview
Welcome to our **Senior Design Project PickFix**!

This software makes it incredibly simple for students to submit support tickets, which are then automatically processed, categorized, and converted into actionable work orders for a maintenance or engineering team. If you've ever struggled with messy email chains, lost support requests, or lack of task tracking, this system solves exactly that. It's built as a cohesive monorepo, keeping the frontend UI and behind-the-scenes microservices neatly organized in one place. 

We wanted to build something that wasn't just a basic prototype, but a scalable, production-ready system that anyone could understand, deploy, and use!

## 🚀 Usage
Using the software is incredibly straightforward once it's up and running.

Here is a quick example of how you can create a new ticket by interacting directly with our API endpoint:

```bash
curl -X POST https://api.yourdomain.com/tickets \
     -H "Content-Type: application/json" \
     -d '{"title": "Broken printer", "description": "The printer in room 404 is out of ink.", "priority": "high"}'
```

To see it in action visually on the web frontend:
1. Open your browser and navigate to the application URL (e.g., `http://localhost:5173`).
2. Click the shiny **"New Ticket"** button.
3. Fill out your issue details and hit submit. The backend will take care of the rest!

## ⬇️ Installation
Want to run this yourself? You'll need **Node.js** (for the web frontend) and **Java 17+ with Maven** (for the backend services). 

To spin up the user interface:
```bash
cd frontend
npm install
npm run dev
```

To run a specific backend service locally (like the ticketing service):
```bash
cd services/ticketing-service
mvn clean install
mvn spring-boot:run
```


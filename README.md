# Quiz Management System

A web-based Quiz Management System built using Node.js, Express.js, MySQL, HTML, CSS, and JavaScript.

## Features

- 📝 Take quizzes
- ⏱️ 10-minute quiz timer
- 📊 Automatic score calculation
- 🎯 Percentage calculation
- 🔄 Restart quiz
- 🌙 Dark mode
- 👨‍💼 Admin panel
- ➕ Add questions
- ✏️ Edit questions
- 🗑️ Delete questions
- 🤖 AI-powered quiz generation using Gemini
- 💾 Questions stored in MySQL database
- ⚠️ Finish quiz confirmation

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MySQL
- Gemini API

## Project Structure

quizManagement/
│
├── public/
│   ├── quiz.html
│   ├── quiz.css
│   ├── quiz.js
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── .env

## How to Run

### 1. Clone the repository

git clone https://github.com/Ramsha162006/QuizManagement.git

### 2. Go to the project folder

cd QuizManagement

### 3. Install dependencies

npm install

### 4. Create a `.env` file

Add your own database and Gemini API credentials.

### 5. Start the server

node server.js

### 6. Open the application

Open:

http://localhost:3000

## Database

The project uses MySQL with a database named:

QuizManagementDB

Questions are stored in the `Questions` table.

## Security

API keys and passwords are stored in `.env` and are not included in the GitHub repository.

## Author

Ramsha
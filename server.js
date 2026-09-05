require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.static("public"));


const db = mysql.createConnection({
    host: process.env.DB_host,
    user: process.env.DB_user,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

app.get("/", (req, res) => {
    res.send("Quiz Management Server is running!");
});

app.get("/questions", (req, res) => {
    db.query("SELECT * FROM Questions", (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).send("Database error");
            return;
        }

        res.json(results);
    });
});



app.post("/questions", (req, res) => {
    const {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option
    } = req.body;

    const sql = `
        INSERT INTO Questions
        (question_text, option_a, option_b, option_c, option_d, correct_option)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Database error");
                return;
            }

            res.send("Question added successfully!");
        }
    );
});

app.get("/questions/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "SELECT * FROM Questions WHERE question_id = ?",
        [id],
        (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send("Database error");
                return;
            }

            if (results.length === 0) {
                res.status(404).send("Question not found");
                return;
            }

            res.json(results[0]);
        }
    );
});


app.put("/questions/:id", (req, res) => {
    const id = req.params.id;

    const {
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option
    } = req.body;

    const sql = `
        UPDATE Questions
        SET question_text = ?,
            option_a = ?,
            option_b = ?,
            option_c = ?,
            option_d = ?,
            correct_option = ?
        WHERE question_id = ?
    `;

    db.query(
        sql,
        [
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            id
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Database error");
                return;
            }

            if (result.affectedRows === 0) {
                res.status(404).send("Question not found");
                return;
            }

            res.send("Question updated successfully!");
        }
    );
});

app.delete("/questions/:id", (req, res) => {
    const id = req.params.id;

    db.query(
        "DELETE FROM Questions WHERE question_id = ?",
        [id],
        (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("Database error");
                return;
            }

            if (result.affectedRows === 0) {
                res.status(404).send("Question not found");
                return;
            }

            res.send("Question deleted successfully!");
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
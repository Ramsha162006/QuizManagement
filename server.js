require("dotenv").config();
const express = require("express");
const db = require("./db");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));
db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

//app.get("/", (req, res) => {
//    res.send("Quiz Management Server is running!");
//});

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


app.post("/generate-quiz", async (req, res) => {
     
    console.log("GENERATE QUIZ ROUTE HIT");
    try {
        const { topic, count, difficulty } = req.body;

        // Basic validation
        if (!topic || !count || !difficulty) {
            return res.status(400).json({
                error: "Topic, count and difficulty are required"
            });
        }

        const prompt = `
Generate ${count} multiple-choice questions about "${topic}".

Difficulty: ${difficulty}

Return ONLY valid JSON.
Do not include markdown or any explanation.

The JSON must have this exact structure:

{
    "questions": [
        {
            "question_text": "Question here",
            "option_a": "Option A",
            "option_b": "Option B",
            "option_c": "Option C",
            "option_d": "Option D",
            "correct_option": "A"
        }
    ]
}

Rules:
- correct_option must be only A, B, C, or D.
- Generate exactly ${count} questions.
- Every question must have four different options.
`;

        // Ask Gemini to generate the questions
        console.log("Sending request to Gemini...");

let response;

for (let attempt = 1; attempt <= 3; attempt++) {

    try {

        console.log(`Gemini attempt ${attempt}/3...`);

        response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        break;

    } catch (error) {

        if (error.status === 503 && attempt < 3) {

            console.log("Gemini is busy. Retrying in 5 seconds...");

            await new Promise(resolve =>
                setTimeout(resolve, 5000)
            );

        } else {

            throw error;
        }
    }
}

console.log("Gemini response received!");
console.log(response.text);

        // Convert Gemini response to JavaScript object
        const result = JSON.parse(response.text);

        if (!result.questions || !Array.isArray(result.questions)) {
            return res.status(500).json({
                error: "AI returned an invalid format"
            });
        }

        // Save every generated question into MySQL
        const sql = `
            INSERT INTO Questions
            (question_text, option_a, option_b, option_c, option_d, correct_option)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        let inserted = 0;

        for (const q of result.questions) {

            if (
                !q.question_text ||
                !q.option_a ||
                !q.option_b ||
                !q.option_c ||
                !q.option_d ||
                !["A", "B", "C", "D"].includes(q.correct_option)
            ) {
                continue;
            }

            await new Promise((resolve, reject) => {

                db.query(
                    sql,
                    [
                        q.question_text,
                        q.option_a,
                        q.option_b,
                        q.option_c,
                        q.option_d,
                        q.correct_option
                    ],
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            inserted++;
                            resolve();
                        }
                    }
                );

            });
        }

        res.json({
            message: "Quiz generated successfully",
            inserted: inserted
        });

    } catch (error) {

        console.error("AI Quiz Error:", error);

        res.status(500).json({
            error: "Failed to generate quiz"
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
;
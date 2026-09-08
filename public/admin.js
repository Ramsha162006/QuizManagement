const form = document.querySelector("#question-form");
const message = document.querySelector("#message");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const question = {
        question_text: document.querySelector("#question-text").value,
        option_a: document.querySelector("#option-a").value,
        option_b: document.querySelector("#option-b").value,
        option_c: document.querySelector("#option-c").value,
        option_d: document.querySelector("#option-d").value,
        correct_option: document.querySelector("#correct-option").value
    };

    fetch("/questions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(question)
    })
    .then(response => response.text())
    .then(data => {

        message.textContent = data;

        form.reset();
        loadQuestions();

    })
    .catch(error => {

        console.log(error);
        message.textContent = "Error adding question";

    });

});
function loadQuestions() {

    fetch("/questions")
        .then(response => response.json())
        .then(data => {

            const questionsList = document.querySelector("#questions-list");

            questionsList.innerHTML = "";

            data.forEach((q, index) => {

                const questionDiv = document.createElement("div");

                questionDiv.innerHTML = `
                    <h3>${index + 1}. ${q.question_text}</h3>

                    <p>A. ${q.option_a}</p>
                    <p>B. ${q.option_b}</p>
                    <p>C. ${q.option_c}</p>
                    <p>D. ${q.option_d}</p>

                    <p>Correct Answer: ${q.correct_option}</p>

                    <button class="edit-btn" data-id="${q.question_id}">
                        Edit
                    </button>

                    <button class="delete-btn" data-id="${q.question_id}">
                     Delete
                    </button>

                    <hr>
                `;

                questionsList.appendChild(questionDiv);
            });

            // Add click event to Delete buttons
            document.querySelectorAll(".delete-btn").forEach(button => {

                button.addEventListener("click", function() {

                    const id = this.dataset.id;

                    deleteQuestion(id);

                });

            });
            document.querySelectorAll(".edit-btn").forEach(button => {

    button.addEventListener("click", function() {

        const id = this.dataset.id;

        editQuestion(id);

    });

});

        })
        .catch(error => {
            console.log("Error loading questions:", error);
        });
}


function deleteQuestion(id) {

    fetch(`/questions/${id}`, {
        method: "DELETE"
    })
    .then(response => response.text())
    .then(data => {

        alert(data);

        loadQuestions();

    })
    .catch(error => {
        console.log("Error deleting question:", error);
    });
}
function editQuestion(id) {

    console.log("EDIT CLICKED, ID =", id);

    fetch(`/questions/${id}`)
        .then(response => response.json())
        .then(q => {

            console.log("QUESTION RECEIVED =", q);

            const editSection = document.querySelector("#edit-section");

            editSection.style.display = "block";

            document.querySelector("#edit-id").value = q.question_id;
            document.querySelector("#edit-question-text").value = q.question_text;
            document.querySelector("#edit-option-a").value = q.option_a;
            document.querySelector("#edit-option-b").value = q.option_b;
            document.querySelector("#edit-option-c").value = q.option_c;
            document.querySelector("#edit-option-d").value = q.option_d;
            document.querySelector("#edit-correct-option").value = q.correct_option;

        })
        .catch(error => {

            console.log("Error loading question:", error);

        });
}

loadQuestions();

const editForm = document.querySelector("#edit-form");

editForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const id = document.querySelector("#edit-id").value;

    const updatedQuestion = {

        question_text: document.querySelector("#edit-question-text").value,

        option_a: document.querySelector("#edit-option-a").value,

        option_b: document.querySelector("#edit-option-b").value,

        option_c: document.querySelector("#edit-option-c").value,

        option_d: document.querySelector("#edit-option-d").value,

        correct_option: document.querySelector("#edit-correct-option").value

    };

    fetch(`/questions/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(updatedQuestion)

    })
    .then(response => response.text())
    .then(data => {

        alert(data);

        document.querySelector("#edit-section").style.display = "none";

        loadQuestions();

    })
    .catch(error => {

        console.log("Error updating question:", error);

    });

});

const aiQuizForm = document.querySelector("#ai-quiz-form");
const aiMessage = document.querySelector("#ai-message");
const generateAiBtn = document.querySelector("#generate-ai-btn");
const aiGeneratorBtn = document.querySelector("#ai-generator-btn");
const aiGeneratorSection = document.querySelector("#ai-generator-section");
// Show / hide AI generator
aiGeneratorBtn.addEventListener("click", function () {

    if (aiGeneratorSection.style.display === "none") {
        aiGeneratorSection.style.display = "block";
    } else {
        aiGeneratorSection.style.display = "none";
    }

});


// Generate quiz
aiQuizForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const topic = document.querySelector("#ai-topic").value.trim();
    const count = Number(document.querySelector("#ai-count").value);
    const difficulty = document.querySelector("#ai-difficulty").value;

    generateAiBtn.disabled = true;
    generateAiBtn.textContent = "Generating...";
    aiMessage.textContent = "🤖 AI is generating your questions...";

    try {

        const response = await fetch("/generate-quiz", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic: topic,
                count: count,
                difficulty: difficulty
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to generate quiz");
        }

        aiMessage.textContent =
            `✅ ${data.inserted} questions generated and saved!`;

        aiQuizForm.reset();

        // Refresh the question list
        loadQuestions();

    } catch (error) {

        console.error("AI Quiz Error:", error);

        aiMessage.textContent =
            "❌ Failed to generate quiz: " + error.message;

    } finally {

        generateAiBtn.disabled = false;
        generateAiBtn.textContent = "Generate Quiz";

    }

});

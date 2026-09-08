
let questions = [];
let darkmode = false;
let currentQuestion = 0;
let score = 0;
let timeLeft = 10 * 60;
let timer;

const question = document.querySelector("#question");
const optionbtn = document.querySelectorAll(".option");
const nextbutton = document.querySelector("#nxtbtn");
const restartbtn = document.querySelector("#restart-btn");
const questionNumber = document.querySelector("#question-number");
const progressbar = document.querySelector("#progress-bar");
const progressContainer = document.querySelector(".progress-container");
const themebtn = document.querySelector("#theme-btn");
const scoreElement = document.querySelector("#score");
const timerElement = document.querySelector("#timer");
const finishbtn = document.querySelector("#finish-btn");
const resultScreen = document.querySelector("#result-screen");
const finalScore = document.querySelector("#final-score");
const finalPercentage = document.querySelector("#final-percentage");

fetch("/questions")
    .then(response => {
        console.log("Response received:", response);
        return response.json();
    })
    .then(data => {

        console.log("Data from database:", data);

        questions = data.map(q => ({
            question: q.question_text,
            options: [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d
            ],
            answer: q.correct_option.charCodeAt(0) - 65
        }));

        console.log("Questions array:", questions);

        if (questions.length > 0) {
            loadQuestion();
            startTimer();
        } else {
            question.textContent = "No questions found!";
        }
    })
    .catch(error => {
        console.log("Error loading questions:", error);
        question.textContent = "Failed to load questions!";
    });

function startTimer() {

    clearInterval(timer);

    timer = setInterval(function () {

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        seconds = seconds < 10 ? "0" + seconds : seconds;

        timerElement.textContent =
            `⏱️ Time Left: ${minutes}:${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            finishQuiz();
        }

        timeLeft--;

    }, 1000);
}



function loadQuestion(){
    question.textContent = questions[currentQuestion].question;
    for(let i = 0;i<optionbtn.length;i++){
        optionbtn[i].textContent = questions[currentQuestion].options[i];
        optionbtn[i].disabled = false;
        optionbtn[i].classList.remove("correct");
        optionbtn[i].classList.remove("wrong");
    }
    nextbutton.disabled = true;
    questionNumber.textContent = `Question ${currentQuestion+1} of ${questions.length}`;
    let progress = ((currentQuestion+1)/questions.length)*100;
    progressbar.style.width = progress+"%";
}
//loadQuestion();

function finishQuiz() {

    clearInterval(timer);

    for (let k = 0; k < optionbtn.length; k++) {
        optionbtn[k].style.display = "none";
    }

    nextbutton.style.display = "none";
    finishbtn.style.display = "none";
    restartbtn.style.display = "block";
    questionNumber.style.display = "none";
    progressContainer.style.display = "none";

    question.style.display = "none";

    resultScreen.style.display = "block";

    finalScore.textContent =
        `Your Score: ${score} / ${questions.length}`;

    let percentage = Math.round((score / questions.length) * 100);

    finalPercentage.textContent =
        `Percentage: ${percentage}%`;
}

nextbutton.addEventListener("click",function(){
    if(currentQuestion<questions.length-1){
        currentQuestion++;
        loadQuestion();
    }
    else {
    finishQuiz();
    }
   
});
const finishPopup = document.querySelector("#finish-popup");
const cancelFinish = document.querySelector("#cancel-finish");
const confirmFinish = document.querySelector("#confirm-finish");

finishbtn.addEventListener("click", function () {

    finishPopup.style.display = "flex";

});

cancelFinish.addEventListener("click", function () {

    finishPopup.style.display = "none";

});

confirmFinish.addEventListener("click", function () {

    finishPopup.style.display = "none";

    finishQuiz();

});
for(let i = 0;i<optionbtn.length;i++){
    optionbtn[i].addEventListener("click",function(){
        optionbtn[i].disabled = true;
        if(i === questions[currentQuestion].answer){
    score++;
    scoreElement.textContent = `Score: ${score}`;
    optionbtn[i].classList.add("correct");
}
        else{
            optionbtn[i].classList.add("wrong");
        }
        let correctIndex = questions[currentQuestion].answer;
        optionbtn[correctIndex].classList.add("correct");
        for(let j = 0;j<optionbtn.length;j++){
            optionbtn[j].disabled = true;
        }
        nextbutton.disabled = false;
});
}
restartbtn.addEventListener("click", function(){

    currentQuestion = 0;
    score = 0;

    scoreElement.textContent = "Score: 0";

    timeLeft = 10 * 60;
    timerElement.textContent = "⏱️ Time Left: 10:00";

    finishbtn.style.display = "block";

    question.style.display = "block";
    resultScreen.style.display = "none";

    for(let i = 0; i < optionbtn.length; i++){
        optionbtn[i].style.display = "block";
    }

    nextbutton.style.display = "block";
    restartbtn.style.display = "none";
    questionNumber.style.display = "block";
    progressContainer.style.display = "block";

    loadQuestion();
    startTimer();
});
themebtn.addEventListener("click",function(){
    if(darkmode == false){
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    darkmode = true;
    }
    else{
        document.body.style.backgroundColor = "white";
        document.body.style.color = "black";
        darkmode = false;
    }
});

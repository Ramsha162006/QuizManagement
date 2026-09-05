
let questions = [];
let darkmode = false;
let currentQuestion = 0;
let score = 0;
const question = document.querySelector("#question");
const optionbtn = document.querySelectorAll(".option");
const nextbutton = document.querySelector("#nxtbtn");
const restartbtn = document.querySelector("#restart-btn");
const questionNumber = document.querySelector("#question-number");
const progressbar = document.querySelector("#progress-bar");
const progressContainer = document.querySelector(".progress-container");
const themebtn = document.querySelector("#theme-btn");

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
        } else {
            question.textContent = "No questions found!";
        }
    })
    .catch(error => {
        console.log("Error loading questions:", error);
        question.textContent = "Failed to load questions!";
    });
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

nextbutton.addEventListener("click",function(){
    if(currentQuestion<questions.length-1){
        currentQuestion++;
        loadQuestion();
    }
    else{
        for(let k = 0;k<optionbtn.length;k++){
            optionbtn[k].style.display = "none";
            nextbutton.style.display = "none";
        }
        // nextbutton.remove();
        restartbtn.style.display = "block";
        questionNumber.style.display = "none";
        progressContainer.style.display = "none";
        
        if(score == questions.length){
            question.textContent = `Quiz Finished! Your Score: ${score}/${questions.length} Excellent!🎉`;
        }
        else{
            question.textContent = `Quiz Finished! Your Score: ${score}/${questions.length} Keep Practicing!🎀`;
        }
        
    }
   
});
for(let i = 0;i<optionbtn.length;i++){
    optionbtn[i].addEventListener("click",function(){
        optionbtn[i].disabled = true;
        if(i === questions[currentQuestion].answer){
            score++;
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
restartbtn.addEventListener("click",function(){
    currentQuestion = 0;
    score = 0;
    for(let i = 0;i<optionbtn.length;i++){
        optionbtn[i].style.display = "block";
    }
    nextbutton.style.display = "block";
    restartbtn.style.display = "none";
    questionNumber.style.display = "block";
    progressContainer.style.display = "block";
    loadQuestion();
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

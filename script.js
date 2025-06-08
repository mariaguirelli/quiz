// Script do quiz com perguntas da Tryvia API (em português), pular pergunta, pontuação e temporizador

let questions = [];
let currentQuestionIndex = 0;
let userName = "";
let score = 0;
let timer;
let timerLeft = 20;

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");

// Função para embaralhar as opções
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// Função para decodificar entidades HTML
function decodeHTMLEntities(text) {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
}

// Função para buscar o token da Tryvia API
async function fetchToken() {
    const res = await fetch('https://tryvia.ptr.red/api_token.php?command=request');
    const data = await res.json();
    return data.token;
}

// Inicia o quiz ao clicar no botão "Iniciar Quiz"
startBtn.addEventListener("click", async () => {
    const nomeInput = document.getElementById("nome").value.trim();
    if (!nomeInput) {
        alert("Por favor, digite seu nome.");
        return;
    }

    userName = nomeInput;
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz-screen").style.display = "block";

    try {
        const token = await fetchToken();
        const res = await fetch(`https://tryvia.ptr.red/api.php?amount=5&type=multiple&token=${token}`);
        const data = await res.json();

        questions = data.results.map(q => {
            const allOptions = [...q.incorrect_answers, q.correct_answer];
            const shuffled = shuffleArray(allOptions);
            return {
                question: decodeHTMLEntities(q.question),
                options: shuffled.map(opt => decodeHTMLEntities(opt)),
                answer: decodeHTMLEntities(q.correct_answer)
            };
        });

        currentQuestionIndex = 0;
        score = 0;
        nextBtn.style.display = "inline-block"; // garantir que botão apareça no início
        showQuestion(questions[currentQuestionIndex]);
    } catch (error) {
        console.error("Erro na Tryvia API:", error);
        alert("Erro ao carregar perguntas em português. Tente novamente.");
    }
});

function showQuestion(question) {
    clearInterval(timer);
    timerLeft = 20;
    nextBtn.disabled = true;

    // Verifica se é a última pergunta e esconde o botão
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.style.display = "none";
    } else {
        nextBtn.style.display = "inline-block";
    }

    const container = document.getElementById("question-container");
    container.classList.remove("fade-in");
    void container.offsetWidth;
    container.classList.add("fade-in");

    container.innerHTML = `
        <div>
            <h2>${question.question}</h2>
            <div id="options-container">
                ${question.options.map(option => `
                    <button class="option-btn" data-option="${option}">${option}</button>
                `).join('')}
            </div>
            <p id="timer">Tempo restante: ${timerLeft}s</p>
            <p id="score">Pontuação: ${score}</p>
        </div>
    `;

    document.querySelectorAll(".option-btn").forEach(btn => {
        btn.addEventListener("click", () => selectOption(btn));
    });

    startTimer();
}


function selectOption(buttonElement) {
    clearInterval(timer);
    const selectedOption = buttonElement.dataset.option;
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedOption === question.answer;

    if (isCorrect) {
        score++;
        buttonElement.classList.add("correct");
        alert("Resposta correta!");
    } else {
        buttonElement.classList.add("incorrect");
        alert(`Resposta incorreta! A correta é: ${question.answer}`);

        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.dataset.option === question.answer) {
                btn.classList.add("correct");
            }
        });
    }

    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    fetch("salvar.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nome=${encodeURIComponent(userName)}&pergunta=${encodeURIComponent(question.question)}&resposta=${encodeURIComponent(selectedOption)}&correta=${isCorrect}`
    })
    .then(res => res.text())
    .then(msg => console.log("Servidor:", msg));

    nextBtn.disabled = false;
    document.getElementById('score').textContent = `Pontuação: ${score}`;

    // Avança automaticamente após 1 segundo
    setTimeout(() => {
        nextQuestion();
    }, 1000);
}

function nextQuestion() {
    clearInterval(timer);
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove("correct", "incorrect");
    });

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
    } else {
        showFinalScreen();
    }
}

nextBtn.addEventListener("click", () => {
    nextQuestion();
});

function showFinalScreen() {
    clearInterval(timer);
    const container = document.getElementById("question-container");
    container.innerHTML = `
        <div id="final-screen">
            <h2>Quiz completo!</h2>
            <p>Sua pontuação foi: ${score} de ${questions.length}</p>
            <button id="restart-btn">Reiniciar Quiz</button>
        </div>
    `;

    nextBtn.style.display = "inline-block"; 

    document.getElementById("restart-btn").addEventListener("click", () => {
        currentQuestionIndex = 0;
        score = 0;
        nextBtn.style.display = "inline-block"; 
        showQuestion(questions[currentQuestionIndex]);
    });
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    timer = setInterval(() => {
        timerLeft--;
        if (timerElement) timerElement.textContent = `Tempo restante: ${timerLeft}s`;

        if (timerLeft <= 0) {
            clearInterval(timer);
            alert("Tempo esgotado!");
            document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
            nextBtn.disabled = false;
        }
    }, 1000);
}

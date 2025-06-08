// Script atualizado com recursos avançados: pontuação, temporizador, feedback visual e animações com alertas

const questions = [
    {
        question: "Qual é a capital da França?",
        options: ["Londres", "Berlim", "Paris", "Madri"],
        answer: "Paris"
    },
    {
        question: "Qual é o maior planeta do sistema solar?",
        options: ["Terra", "Júpiter", "Saturno", "Marte"],
        answer: "Júpiter"
    },
    {
        question: "Se 10 pães são 8 reais, quantos reais são 3 pães?",
        options: ["5", "10", "2,50", "2,40"],
        answer: "2,40"
    },
    {
        question: "Quando foi a queda do muro de berlim?",
        options: ["1980", "1960", "1989", "2002"],
        answer: "1989"
    },
    {
        question: "Quem foi o primeiro homem a pisar na lua?",
        options: ["Marcos Pontes", "Neil Armstrong", "Yuri Gagarin"],
        answer: "Neil Armstrong"
    }
];

let currentQuestionIndex = 0;
let userName = "";
let score = 0;
let timer;
let timerLeft = 20;

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");

// Inicia o quiz ao clicar no botão "Iniciar Quiz"
startBtn.addEventListener("click", () => {
    const nomeInput = document.getElementById("nome").value.trim();
    if (!nomeInput) {
        alert("Por favor, digite seu nome.");
        return;
    }

    userName = nomeInput;
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("quiz-screen").style.display = "block";
    showQuestion(questions[currentQuestionIndex]);
});

// Exibe a pergunta atual e inicia o temporizador
function showQuestion(question) {
    clearInterval(timer);
    timerLeft = 20;
    document.getElementById('next-btn').disabled = true;

    const container = document.getElementById("question-container");
    container.classList.remove("fade-in");
    void container.offsetWidth; // Reinicia a animação
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

// Avalia a resposta selecionada e aplica feedback visual, envia ao backend e atualiza a pontuação
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

        // Destaca a opção correta
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.dataset.option === question.answer) {
                btn.classList.add("correct");
            }
        });
    }

    // Desabilita os botões após selecionar
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    // Envia para backend
    fetch("salvar.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nome=${encodeURIComponent(userName)}&pergunta=${encodeURIComponent(question.question)}&resposta=${encodeURIComponent(selectedOption)}&correta=${isCorrect}`
    })
    .then(res => res.text())
    .then(msg => console.log("Servidor:", msg));

    document.getElementById('next-btn').disabled = false;
    document.getElementById('score').textContent = `Pontuação: ${score}`;
}

// próxima pergunta ou finalizar o quiz
nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(questions[currentQuestionIndex]);
    } else {
        alert(`Quiz completo! Sua pontuação foi: ${score}/${questions.length}`);
    }
});

// temporizador regressivo
function startTimer() {
    const timerElement = document.getElementById('timer');
    timer = setInterval(() => {
        timerLeft--;
        if (timerElement) timerElement.textContent = `Tempo restante: ${timerLeft}s`;

        if (timerLeft <= 0) {
            clearInterval(timer);
            alert("Tempo esgotado!");
            document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
            document.getElementById('next-btn').disabled = false;
        }
    }, 1000);
}

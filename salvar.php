<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "quiz";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

$nome = $_POST['nome'] ?? '';
$pergunta = $_POST['pergunta'] ?? '';
$resposta = $_POST['resposta'] ?? '';
$correta = $_POST['correta'] == "true" ? 1 : 0;

$nome = $conn->real_escape_string($nome);
$pergunta = $conn->real_escape_string($pergunta);
$resposta = $conn->real_escape_string($resposta);

$sql = "INSERT INTO respostas (nome, pergunta, resposta, correta) VALUES ('$nome', '$pergunta', '$resposta', $correta)";

if ($conn->query($sql)) {
    echo "Resposta salva!";
} else {
    echo "Erro ao salvar: " . $conn->error;
}

$conn->close();
?>

function formatarDinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

async function fazerLogin() {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!usuario || !senha) {
    alert("Digite usuário e senha");
    return;
  }

  const resposta = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usuario, senha })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro || "Erro ao fazer login");
    return;
  }

  localStorage.setItem("apressos_logado", "sim");
  localStorage.setItem("apressos_usuario", JSON.stringify(dados.usuario));

  window.location.href = "dashboard.html";
}

function protegerPagina() {
  const logado = localStorage.getItem("apressos_logado");

  if (logado !== "sim") {
    window.location.href = "login.html";
    return;
  }

  const usuario = JSON.parse(localStorage.getItem("apressos_usuario") || "{}");

  const campoUsuario = document.getElementById("usuarioLogado");

  if (campoUsuario) {
    campoUsuario.innerText = `Bem-vindo, ${usuario.nome || "Usuário"} | Cargo: ${usuario.cargo || "ADMIN"}`;
  }
}

function sair() {
  localStorage.removeItem("apressos_logado");
  localStorage.removeItem("apressos_usuario");
  window.location.href = "login.html";
}

async function carregarDashboard() {
  const resposta = await fetch("/api/dashboard");
  const dados = await resposta.json();

  document.getElementById("vendasHoje").innerText = dados.vendasHoje;
  document.getElementById("totalHoje").innerText = formatarDinheiro(dados.totalHoje);
  document.getElementById("produtos").innerText = dados.produtos;
  document.getElementById("estoqueBaixo").innerText = dados.estoqueBaixo;
}

document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const telaLogin = document.querySelector(".login-page");
    if (telaLogin) {
      fazerLogin();
    }
  }
});
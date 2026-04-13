//Mostrar os dados digitados do formulário
function mostrarDados() {

  // Pegar os dados digitados no formulário
  let nome = document.getElementById("nome").value;
  let idade = document.getElementById("idade").value;
  let sexo = document.getElementById("sexo").value;
  let pressao = document.getElementById("pressao").value;
  let temperatura = document.getElementById("temperatura").value;
  let frequencia = document.getElementById("frequencia").value;
  let saturacao = document.getElementById("saturacao").value;
  let evolucao = document.getElementById("evolucao").value;
  let medicamento = document.getElementById("medicamento").value;
  let dosagem = document.getElementById("dosagem").value;
  let horario = document.getElementById("horario").value;

  // Criar uma estrutura html com os dados digitados
  let resultado = `
    <ul class="list-group text-start">
      <li class="list-group-item"><strong>Nome:</strong> ${nome}</li>
      <li class="list-group-item"><strong>Idade:</strong> ${idade}</li>
      <li class="list-group-item"><strong>Sexo:</strong> ${sexo}</li>
      <li class="list-group-item"><strong>Pressão Arterial:</strong> ${pressao}</li>
      <li class="list-group-item"><strong>Temperatura:</strong> ${temperatura}°C</li>
      <li class="list-group-item"><strong>Frequência Cardíaca:</strong> ${frequencia}</li>
      <li class="list-group-item"><strong>Saturação:</strong> ${saturacao}%</li>
      <li class="list-group-item"><strong>Evolução:</strong> ${evolucao}</li>
      <li class="list-group-item"><strong>Medicamento:</strong> ${medicamento}</li>
      <li class="list-group-item"><strong>Dosagem:</strong> ${dosagem}</li>
      <li class="list-group-item"><strong>Horário:</strong> ${horario}</li>
    </ul>
`;
  let caixa = document.getElementById("resultado");

  // Mostrar a estrutura html criada na tela
  caixa.querySelector(".card-body").innerHTML = resultado;
  caixa.classList.remove("d-none");
}

// Validação do Prontuário
(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')
  // Instância do Toast do Bootstrap para exibir a mensagem de sucesso
  const toast = new bootstrap.Toast(document.getElementById('toastSucesso'));

  // Loop para validar os campos do formulário
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {

        // Impedir o envio do formulário
        event.preventDefault();

        // Impedir a propagação do evento para outros elementos
        event.stopPropagation();

      } else {
        event.preventDefault();

        //Mensagem de salvo com sucesso 
        toast.show();

        mostrarDados();
      }
      form.classList.add('was-validated');

    }, false);

  });

})();

// Modo Escuro
const btnModoEscuro = document.getElementById('modoEscuro');
const html = document.documentElement;

btnModoEscuro.addEventListener('click', () => {
  if (html.getAttribute('data-bs-theme') === 'light') {
    html.setAttribute('data-bs-theme', 'dark');
    btnModoEscuro.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    html.setAttribute('data-bs-theme', 'light');
    btnModoEscuro.innerHTML = '<i class="bi bi-moon-fill"></i>';
  }
});








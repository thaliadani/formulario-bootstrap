//Mostrar os dados digitados do prontuário
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

  // Criar no html os dados digitados
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

  // Mostrar os dados no html
  let caixa = document.getElementById("resultado");
  caixa.querySelector(".card-body").innerHTML = resultado;
  caixa.classList.remove("d-none");
}

// Validação do Prontuário
(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')
  const toast = new bootstrap.Toast(document.getElementById('toastSucesso'));

  // Loop para validar os campos do formulário
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {

        // Impedir o envio do formulário
        event.preventDefault();

        // Impedir a propagação padrão do evento
        event.stopPropagation();

      } else {
        event.preventDefault();

        //Mensagem de sucesso 
        toast.show();

        mostrarDados();
      }
      form.classList.add('was-validated');

    }, false);

  });

})();








//Mostrar Dados do Prontuário
function mostrarDados() {
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

  let resultado = `
    <h5>Prontuário do Paciente<h5>
    Nome: ${nome} <br>
    Idade: ${idade} <br>
    Sexo: ${sexo} <br>
    Pressão Arterial: ${pressao} <br>
    Temperatura: ${temperatura}°C <br>
    Frequência Cardíaca: ${frequencia} <br>
    Saturação: ${saturacao}% <br>
    Evolução: ${evolucao} <br>
    Medicamento: ${medicamento} <br>
    Dosagem: ${dosagem} <br>
    Horário: ${horario}
`;

  let caixa = document.getElementById("resultado");
  caixa.innerHTML = resultado;
  caixa.classList.remove("d-none");
}

// Validação do Prontário
(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')
  const toast = new bootstrap.Toast(document.getElementById('toastSucesso'));
  const inputs = document.querySelectorAll('input');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();

      } else {
        event.preventDefault();
        inputs.res
        //Mensagem de sucesso
        toast.show();
        mostrarDados();
      }
      form.classList.add('was-validated');

    }, false);

  });

})();








# Prontuário Eletrônico

Este é um sistema de prontuário eletrônico simples e funcional, desenvolvido com tecnologias web modernas. O objetivo é permitir o registro rápido e organizado de informações clínicas de pacientes.

## 🚀 Funcionalidades

- **Dados do Paciente:** Coleta de nome, idade e sexo.
- **Sinais Vitais:** Registro de pressão arterial, temperatura, frequência cardíaca e saturação de oxigênio.
- **Evolução do Paciente:** Campo de texto detalhado para descrever o estado clínico.
- **Gestão de Medicação:** Registro de medicamentos administrados, dosagem e horários.
- **Modo Escuro (Dark Mode):** Alternância entre temas claro e escuro para melhor conforto visual.
- **Validação de Formulários:** Feedback em tempo real para campos obrigatórios utilizando recursos nativos do Bootstrap.
- **Notificações:** Exibição de um "Toast" de confirmação ao salvar o prontuário.

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica da aplicação.
- **[Bootstrap 5.3](https://getbootstrap.com/):** Framework CSS para layout responsivo e componentes de interface.
- **[Bootstrap Icons](https://icons.getbootstrap.com/):** Biblioteca de ícones vetoriais.
- **JavaScript:** Lógica para validação, persistência (simulada) e manipulação do tema (DOM).

## 📂 Estrutura de Arquivos

- `index.html`: Arquivo principal contendo a estrutura do formulário e referências aos frameworks.
- `script.js`: Arquivo contendo a lógica de negócio, manipulação do modo escuro e eventos de envio.

## 🔧 Como Executar

1. Certifique-se de ter todos os arquivos do projeto na mesma pasta.
2. Abra o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, etc.).
3. Preencha os campos obrigatórios e clique em "Salvar Prontuário".

## 🌓 Alternando o Tema

O sistema conta com um botão localizado no canto superior direito da tela que permite alternar entre o modo claro e o modo escuro, ajustando automaticamente as cores da interface para garantir a acessibilidade em diferentes ambientes de luz.

## 📝 Validação

O formulário utiliza a classe `.needs-validation` do Bootstrap. Caso algum campo obrigatório não seja preenchido, o sistema impedirá o envio e exibirá mensagens de erro amigáveis ao usuário.

---
*Projeto desenvolvido para fins de demonstração de interfaces hospitalares.*

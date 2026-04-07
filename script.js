(() => {
  'use strict'

  // Busca os elementos que podem existir nas paginas do projeto.
  const form = document.querySelector('.needs-validation')
  const prontuariosTableBody = document.getElementById('prontuarios-tabela-corpo')
  const prontuariosStatus = document.getElementById('prontuarios-status')
  const selectFolderButton = document.getElementById('selecionar-pasta-prontuarios')
  const prontuarioDetailContent = document.getElementById('visualizar-prontuario-conteudo')
  const prontuarioDetailEmpty = document.getElementById('visualizar-prontuario-vazio')
  const prontuarioDetailStatus = document.getElementById('visualizar-prontuario-status')

  // Chaves usadas para guardar no navegador a pasta escolhida pelo usuario.
  const DB_NAME = 'prontuario-eletronico-db'
  const STORE_NAME = 'handles'
  const HANDLE_KEY = 'prontuarios-root'

  // Se a pagina nao tiver formulario, tabela nem detalhes, o script nao precisa fazer nada.
  if (!form && !prontuariosTableBody && !prontuarioDetailContent && !prontuarioDetailEmpty) {
    return
  }

  // Le o valor de um campo pelo id e remove espacos extras.
  const getValue = id => document.getElementById(id)?.value.trim() ?? ''

  // Converte o nome do paciente em um nome de arquivo seguro.
  const sanitizeFileName = value => {
    const normalized = (value || 'paciente')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()

    return normalized || 'paciente'
  }

  // Monta data e hora no formato usado no nome do arquivo JSON.
  const formatDateTimeForFileName = date => {
    const pad = value => String(value).padStart(2, '0')

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
  }

  // Exibe erros de forma simples para o usuario.
  const showSaveError = message => window.alert(message)

  // Monta a URL absoluta de redirecionamento para evitar falhas em paginas relativas.
  const buildPageUrl = relativePath => new URL(relativePath, window.location.href).href

  // Redireciona para outra pagina usando a URL resolvida pelo proprio formulario.
  const redirectToPage = target => {
    const resolvedTarget = (target || '').trim()

    if (!resolvedTarget) {
      return
    }

    window.setTimeout(() => {
      window.location.href = resolvedTarget
    }, 50)
  }

  // Abre o IndexedDB, que vai guardar a referencia da pasta escolhida.
  const openDatabase = () => new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onupgradeneeded = () => {
      const database = request.result

      // Cria o local onde vamos guardar a pasta escolhida.
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
  })

  // Salva a pasta escolhida para reutilizar depois sem perguntar novamente.
  const saveHandle = async directoryHandle => {
    const database = await openDatabase()

    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      store.put(directoryHandle, HANDLE_KEY)
    })

    database.close()
  }

  // Tenta recuperar do navegador a pasta escolhida anteriormente.
  const loadHandle = async () => {
    const database = await openDatabase()

    const result = await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(HANDLE_KEY)

      request.onsuccess = () => resolve(request.result ?? null)
      request.onerror = () => reject(request.error)
    })

    database.close()
    return result
  }

  // Confere se o navegador ainda permite usar a pasta salva.
  const hasDirectoryPermission = async (directoryHandle, mode = 'readwrite') => {
    if (!directoryHandle) {
      return false
    }

    if (typeof directoryHandle.queryPermission !== 'function') {
      return true
    }

    const permission = await directoryHandle.queryPermission({ mode })
    return permission === 'granted'
  }

  // Usa a pasta salva quando possivel.
  // Se nao houver permissao e a chamada permitir, pede ao usuario para escolher uma pasta.
  const getRootDirectoryHandle = async ({
    mode = 'readwrite',
    promptIfMissing = false
  } = {}) => {
    const savedHandle = await loadHandle()

    if (await hasDirectoryPermission(savedHandle, mode)) {
      return savedHandle
    }

    if (!promptIfMissing) {
      return null
    }

    if (typeof window.showDirectoryPicker !== 'function') {
      throw new Error('API de pasta local nao suportada neste navegador.')
    }

    const selectedHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    await saveHandle(selectedHandle)

    return selectedHandle
  }

  // Garante que o prontuario seja salvo dentro da pasta "prontuarios".
  // Se o usuario escolher a pasta do projeto, a subpasta e criada automaticamente.
  const getProntuariosDirectoryHandle = async ({
    mode = 'readwrite',
    promptIfMissing = false,
    create = false
  } = {}) => {
    const selectedHandle = await getRootDirectoryHandle({ mode, promptIfMissing })

    if (!selectedHandle) {
      return null
    }

    if (selectedHandle.name.toLowerCase() === 'prontuarios') {
      return selectedHandle
    }

    try {
      return await selectedHandle.getDirectoryHandle('prontuarios', { create })
    } catch (error) {
      if (error?.name === 'NotFoundError') {
        return null
      }

      throw error
    }
  }

  // Cria o nome do arquivo e escreve o JSON dentro da pasta "prontuarios".
  const saveProntuarioLocally = async prontuario => {
    const now = new Date()
    const patientName = prontuario?.paciente?.nome
    const fileName = `${sanitizeFileName(patientName)}-${formatDateTimeForFileName(now)}.json`
    const prontuariosDirectory = await getProntuariosDirectoryHandle({
      mode: 'readwrite',
      promptIfMissing: true,
      create: true
    })
    const fileHandle = await prontuariosDirectory.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()

    await writable.write(JSON.stringify(prontuario, null, 2))
    await writable.close()
  }

  // Atualiza a mensagem acima da tabela para informar o estado atual da listagem.
  const updateProntuariosStatus = message => {
    if (prontuariosStatus) {
      prontuariosStatus.textContent = message
    }
  }

  // Mostra uma linha unica na tabela quando nao ha dados para exibir.
  const renderEmptyProntuariosMessage = message => {
    if (!prontuariosTableBody) {
      return
    }

    prontuariosTableBody.innerHTML = `
      <tr>
        <td colspan="4">${message}</td>
      </tr>
    `
  }

  // Abre a pagina de visualizacao usando o nome do arquivo do prontuario.
  const openProntuarioDetails = fileName => {
    if (!fileName) {
      return
    }

    const targetUrl = buildPageUrl(`./visualizar-prontuario.html?arquivo=${encodeURIComponent(fileName)}`)
    window.location.assign(targetUrl)
  }

  // Cria uma linha da tabela com nome, idade, sexo e botao de visualizacao.
  const createProntuarioRow = prontuarioItem => {
    const prontuario = prontuarioItem?.data ?? {}
    const row = document.createElement('tr')
    const nomeCell = document.createElement('td')
    const idadeCell = document.createElement('td')
    const sexoCell = document.createElement('td')
    const actionCell = document.createElement('td')
    const viewButton = document.createElement('button')

    nomeCell.textContent = prontuario?.paciente?.nome || '-'
    idadeCell.textContent = prontuario?.paciente?.idade || '-'
    sexoCell.textContent = prontuario?.paciente?.sexo || '-'
    viewButton.type = 'button'
    viewButton.className = 'btn btn-info btn-sm'
    viewButton.textContent = 'Visualizar'
    viewButton.addEventListener('click', () => {
      openProntuarioDetails(prontuarioItem.fileName)
    })

    actionCell.appendChild(viewButton)

    row.append(nomeCell, idadeCell, sexoCell, actionCell)
    return row
  }

  // Le um arquivo JSON especifico da pasta "prontuarios".
  const readProntuarioFile = async fileName => {
    const prontuariosDirectory = await getProntuariosDirectoryHandle({
      mode: 'read',
      promptIfMissing: false,
      create: false
    })

    if (!prontuariosDirectory || !fileName) {
      return null
    }

    try {
      const fileHandle = await prontuariosDirectory.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      const content = await file.text()
      return JSON.parse(content)
    } catch (error) {
      if (error?.name === 'NotFoundError') {
        return null
      }

      throw error
    }
  }

  // Le todos os arquivos JSON da pasta "prontuarios" e transforma em objetos.
  const readProntuariosFromDirectory = async () => {
    const prontuariosDirectory = await getProntuariosDirectoryHandle({
      mode: 'read',
      promptIfMissing: false,
      create: false
    })

    if (!prontuariosDirectory) {
      return null
    }

    const prontuarios = []

    for await (const entry of prontuariosDirectory.values()) {
      if (entry.kind !== 'file' || !entry.name.toLowerCase().endsWith('.json')) {
        continue
      }

      try {
        const file = await entry.getFile()
        const content = await file.text()
        const prontuario = JSON.parse(content)

        prontuarios.push({
          fileName: entry.name,
          data: prontuario
        })
      } catch (error) {
        console.error(`Nao foi possivel ler o arquivo ${entry.name}.`, error)
      }
    }

    prontuarios.sort((first, second) => {
      const firstDate = new Date(first?.data?.salvoEm || 0).getTime()
      const secondDate = new Date(second?.data?.salvoEm || 0).getTime()
      return secondDate - firstDate
    })

    return prontuarios
  }

  // Atualiza a mensagem da pagina de visualizacao.
  const updateProntuarioDetailStatus = message => {
    if (prontuarioDetailStatus) {
      prontuarioDetailStatus.textContent = message
    }
  }

  // Mostra ou esconde a area principal do prontuario detalhado.
  const toggleProntuarioDetail = ({ showContent, showEmpty }) => {
    if (prontuarioDetailContent) {
      prontuarioDetailContent.classList.toggle('d-none', !showContent)
    }

    if (prontuarioDetailEmpty) {
      prontuarioDetailEmpty.classList.toggle('d-none', !showEmpty)
    }
  }

  // Preenche a pagina de visualizacao com todos os dados do paciente.
  const renderProntuarioDetail = prontuario => {
    const setText = (id, value) => {
      const element = document.getElementById(id)

      if (element) {
        element.textContent = value || '-'
      }
    }

    setText('detalhe-nome', prontuario?.paciente?.nome)
    setText('detalhe-idade', prontuario?.paciente?.idade)
    setText('detalhe-sexo', prontuario?.paciente?.sexo)
    setText('detalhe-pressao', prontuario?.sinaisVitais?.pressaoArterial)
    setText('detalhe-temperatura', prontuario?.sinaisVitais?.temperatura)
    setText('detalhe-frequencia', prontuario?.sinaisVitais?.frequenciaCardiaca)
    setText('detalhe-saturacao', prontuario?.sinaisVitais?.saturacao)
    setText('detalhe-evolucao', prontuario?.evolucaoPaciente)
    setText('detalhe-medicamento', prontuario?.medicacao?.medicamento)
    setText('detalhe-dose', prontuario?.medicacao?.dose)
    setText('detalhe-horario', prontuario?.medicacao?.horario)
    setText('detalhe-salvo-em', prontuario?.salvoEm)
  }

  // Carrega o prontuario selecionado na pagina de visualizacao.
  const loadProntuarioDetail = async () => {
    if (!prontuarioDetailContent && !prontuarioDetailEmpty) {
      return
    }

    updateProntuarioDetailStatus('Carregando prontuario...')

    try {
      const params = new URLSearchParams(window.location.search)
      const fileName = params.get('arquivo')

      if (!fileName) {
        updateProntuarioDetailStatus('Nenhum prontuario foi informado.')
        toggleProntuarioDetail({ showContent: false, showEmpty: true })
        return
      }

      const prontuario = await readProntuarioFile(fileName)

      if (!prontuario) {
        updateProntuarioDetailStatus('Nao foi possivel localizar o prontuario selecionado.')
        toggleProntuarioDetail({ showContent: false, showEmpty: true })
        return
      }

      renderProntuarioDetail(prontuario)
      updateProntuarioDetailStatus('Prontuario carregado com sucesso.')
      toggleProntuarioDetail({ showContent: true, showEmpty: false })
    } catch (error) {
      updateProntuarioDetailStatus('Nao foi possivel carregar os dados do prontuario.')
      toggleProntuarioDetail({ showContent: false, showEmpty: true })
      console.error(error)
    }
  }

  // Preenche a tabela da pagina inicial com os prontuarios encontrados.
  const loadProntuariosTable = async () => {
    if (!prontuariosTableBody) {
      return
    }

    updateProntuariosStatus('Carregando prontuarios salvos...')

    try {
      const prontuarios = await readProntuariosFromDirectory()

      if (prontuarios === null) {
        updateProntuariosStatus('Selecione a pasta do projeto ou a pasta "prontuarios" para listar os prontuarios salvos.')
        renderEmptyProntuariosMessage('Nenhum acesso a pasta de prontuarios.')
        return
      }

      if (prontuarios.length === 0) {
        updateProntuariosStatus('Nenhum prontuario salvo foi encontrado na pasta "prontuarios".')
        renderEmptyProntuariosMessage('Nenhum prontuario salvo.')
        return
      }

      prontuariosTableBody.innerHTML = ''
      prontuarios.forEach(prontuario => {
        prontuariosTableBody.appendChild(createProntuarioRow(prontuario))
      })

      updateProntuariosStatus(`${prontuarios.length} prontuario(s) carregado(s) da pasta "prontuarios".`)
    } catch (error) {
      updateProntuariosStatus('Nao foi possivel carregar os prontuarios salvos.')
      renderEmptyProntuariosMessage('Erro ao ler os prontuarios.')
      console.error(error)
    }
  }

  // Intercepta o clique no botao salvar para controlar validacao, gravacao e redirecionamento.
  if (form) {
    form.addEventListener('submit', async event => {
      event.preventDefault()

      // Se houver campo invalido, impede o envio e mostra o feedback do Bootstrap.
      if (!form.checkValidity()) {
        event.stopPropagation()
        form.classList.add('was-validated')
        return
      }

      // Monta o objeto final do prontuario com todos os dados do formulario.
      const prontuario = {
        salvoEm: new Date().toISOString(),
        paciente: {
          nome: getValue('nome'),
          idade: getValue('idade'),
          sexo: getValue('sexo')
        },
        sinaisVitais: {
          pressaoArterial: getValue('pressao'),
          temperatura: getValue('temperatura'),
          frequenciaCardiaca: getValue('frequencia'),
          saturacao: getValue('saturacao')
        },
        evolucaoPaciente: getValue('evolucao'),
        medicacao: {
          medicamento: getValue('medicacao'),
          dose: getValue('dose'),
          horario: getValue('horario')
        }
      }

      try {
        // Salva o arquivo JSON localmente na pasta "prontuarios".
        await saveProntuarioLocally(prontuario)

        // Mantem o estilo de validacao visual do Bootstrap.
        form.classList.add('was-validated')

        // Depois de salvar com sucesso, leva o usuario para a pagina de confirmacao.
        const redirectTarget = form.action || buildPageUrl('./prontuario-salvo-mensagem.html')
        redirectToPage(redirectTarget)
      } catch (error) {
        // Se o usuario cancelar a escolha da pasta, nao mostra alerta.
        if (error?.name === 'AbortError') {
          return
        }

        // Mostra uma mensagem amigavel quando o navegador nao consegue salvar.
        showSaveError('Nao foi possivel salvar o prontuario localmente. No primeiro uso, selecione a pasta do projeto ou a pasta "prontuarios" em um navegador compativel.')
        console.error(error)
      }
    }, false)
  }

  // Permite conectar novamente a pasta para carregar os prontuarios na pagina inicial.
  if (selectFolderButton) {
    selectFolderButton.addEventListener('click', async () => {
      try {
        await getRootDirectoryHandle({ mode: 'readwrite', promptIfMissing: true })
        await loadProntuariosTable()
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }

        updateProntuariosStatus('Nao foi possivel acessar a pasta selecionada.')
        console.error(error)
      }
    })
  }

  loadProntuariosTable()
  loadProntuarioDetail()
})()

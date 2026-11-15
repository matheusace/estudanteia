/* =========================================================
   EstudoIA — Scripts da Plataforma
   Personalização, Raio-X, Gerador + 16 Prompts, Simulador,
   Bloco de Foco, Folha Feynman, Caça-Erros e Autoavaliação
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initCustomizer();
  initMobileMenu();
  initHeroXray();
  initPromptGenerator();
  initPromptLibrary();
  initSocraticSimulator();
  initPomodoroTimer();
  initFeynmanNotebook();
  initChecklist();
  initHallucinationQuiz();
  initHabitChecker();
  initSuggestionBox();
});

/* ---------- Aviso Flutuante ---------- */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2700);
}

/* ---------- Cópia Segura para Área de Transferência ---------- */
async function copyText(text, successMsg = "Copiado!") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    showToast(successMsg);
  } catch (err) {
    showToast("Não foi possível copiar automaticamente. Selecione o texto manualmente.");
  }
}

/* ---------- Personalização Visual ---------- */
function initCustomizer() {
  const root = document.documentElement;
  const drawer = document.getElementById("customizerDrawer");
  const backdrop = document.getElementById("customizerBackdrop");
  const openBtn = document.getElementById("openCustomizerBtn");
  const closeBtn = document.getElementById("closeCustomizerBtn");
  const themeToggle = document.getElementById("themeToggle");
  const iconSun = document.getElementById("iconSun");
  const iconMoon = document.getElementById("iconMoon");
  const resetBtn = document.getElementById("resetCustomBtn");

  const defaultPrefs = {
    theme: "light",
    palette: "caderno",
    texture: "paper",
    fontSize: "100",
    radius: "rounded"
  };

  let prefs = { ...defaultPrefs };
  try {
    const saved = JSON.parse(localStorage.getItem("estudoia_prefs_v3") || "null");
    if (saved) prefs = { ...defaultPrefs, ...saved };
  } catch (e) {
    prefs = { ...defaultPrefs };
  }

  function applyPrefs() {
    root.setAttribute("data-theme", prefs.theme);
    root.setAttribute("data-palette", prefs.palette);
    root.setAttribute("data-texture", prefs.texture);
    root.setAttribute("data-radius", prefs.radius);
    root.style.fontSize = `${prefs.fontSize}%`;

    const isDark = prefs.theme === "dark";
    iconSun.style.display = isDark ? "none" : "block";
    iconMoon.style.display = isDark ? "block" : "none";

    document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeChoice === prefs.theme);
    });
    document.querySelectorAll("[data-palette-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.paletteChoice === prefs.palette);
    });
    document.querySelectorAll("[data-texture-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.textureChoice === prefs.texture);
    });
    document.querySelectorAll("[data-font-size]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.fontSize === String(prefs.fontSize));
    });
    document.querySelectorAll("[data-radius-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.radiusChoice === prefs.radius);
    });

    localStorage.setItem("estudoia_prefs_v3", JSON.stringify(prefs));
  }

  function openDrawer() {
    backdrop.hidden = false;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
  }

  openBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) {
      closeDrawer();
    }
  });

  themeToggle.addEventListener("click", () => {
    prefs.theme = prefs.theme === "dark" ? "light" : "dark";
    applyPrefs();
  });

  document.querySelectorAll("[data-theme-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      prefs.theme = btn.dataset.themeChoice;
      applyPrefs();
    });
  });

  document.querySelectorAll("[data-palette-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      prefs.palette = btn.dataset.paletteChoice;
      applyPrefs();
    });
  });

  document.querySelectorAll("[data-texture-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      prefs.texture = btn.dataset.textureChoice;
      applyPrefs();
    });
  });

  document.querySelectorAll("[data-font-size]").forEach((btn) => {
    btn.addEventListener("click", () => {
      prefs.fontSize = btn.dataset.fontSize;
      applyPrefs();
    });
  });

  document.querySelectorAll("[data-radius-choice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      prefs.radius = btn.dataset.radiusChoice;
      applyPrefs();
    });
  });

  resetBtn.addEventListener("click", () => {
    prefs = { ...defaultPrefs };
    applyPrefs();
    showToast("Visual restaurado para o padrão!");
  });

  applyPrefs();
}

/* ---------- Menu Mobile ---------- */
function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("navLinks");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Raio-X Interativo no Hero ---------- */
function initHeroXray() {
  const tabs = document.querySelectorAll(".xray-tab");
  const container = document.getElementById("xrayContent");
  if (!tabs.length || !container) return;

  const views = {
    socratico: `
      <div class="xray-prompt">
        <span class="xray-label">O que você manda para a IA:</span>
        <p>"Estou estudando Revolução Industrial e confundo as fases. Não me dê um resumo pronto: me explique a 1ª fase em 3 linhas e me faça 2 perguntas rápidas para ver se eu peguei a ideia antes de seguir."</p>
      </div>
      <div class="xray-effect good">
        <span class="xray-label">O que acontece no seu cérebro:</span>
        <ul>
          <li>Você lê pouco texto de cada vez e realmente processa a informação.</li>
          <li>Precisa formular uma resposta com suas palavras antes de avançar.</li>
          <li>Se errar, descobre a dúvida na hora — não no dia da prova.</li>
        </ul>
      </div>
    `,
    passivo: `
      <div class="xray-prompt">
        <span class="xray-label">O pedido comum que sabota o estudo:</span>
        <p>"Me dê um resumo completo da Revolução Industrial e responda essas 5 questões da minha lista de exercícios."</p>
      </div>
      <div class="xray-effect bad">
        <span class="xray-label">O que acontece na prática:</span>
        <ul>
          <li>Você passa o olho no texto pronto em 15 segundos sem esforço mental.</li>
          <li>Copia as letras das questões sem entender o motivo dos distratores.</li>
          <li>Na prova escrita, sem internet, o assunto parece totalmente novo.</li>
        </ul>
      </div>
    `
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      container.innerHTML = views[tab.dataset.xray];
    });
  });
}

/* ---------- Montador de Prompt Socrático ---------- */
function initPromptGenerator() {
  const subjectEl = document.getElementById("genSubject");
  const levelEl = document.getElementById("genLevel");
  const goalEl = document.getElementById("genGoal");
  const topicEl = document.getElementById("genTopic");
  const toneEl = document.getElementById("genTone");
  const previewEl = document.getElementById("generatedPromptText");
  const copyBtn = document.getElementById("copyGeneratedBtn");

  const toneInstructions = {
    paciente: "Use uma linguagem clara, paciente e com exemplos do cotidiano.",
    direto: "Seja direto ao ponto, sem rodeios e focado no que mais cai em prova.",
    banca: "Adote uma postura exigente de banca avaliadora, cobrando precisão nos termos."
  };

  function buildPrompt() {
    const subject = subjectEl.value;
    const level = levelEl.value;
    const goal = goalEl.value;
    const topic = topicEl.value.trim() || "[ESCREVA AQUI O TEMA OU ENUNCIADO]";
    const tone = toneInstructions[toneEl.value];

    const templates = {
      socratico: `Quero estudar "${topic}" em ${subject} (nível ${level}) usando o Método Socrático. ${tone} Por favor, não me entregue um resumo completo nem a resposta final de uma vez. Comece perguntando o que eu já sei sobre o assunto ou explique apenas a base inicial em até 4 linhas e me faça 1 pergunta curta para testar meu raciocínio. Só avance para o próximo passo depois que eu responder.`,
      calculo: `Preciso resolver esta questão de ${subject} (nível ${level}): "${topic}". ${tone} Não faça a conta nem me dê o resultado final. Primeiro, me ajude a separar os dados que o enunciado deu e me pergunte qual fórmula ou relação lógica devemos aplicar no primeiro passo.`,
      erro_conta: `Tentei resolver esta questão de ${subject} (${level}): "${topic}". Minha resolução foi: [COLE AQUI O QUE VOCÊ FEZ]. ${tone} Não me entregue a conta pronta ainda: apenas me diga em qual linha meu raciocínio ou sinal desviou e me dê uma pista para eu mesmo corrigir.`,
      questoes: `Aja como elaborador de questões de ${subject} (nível ${level}). Crie 4 questões inéditas sobre "${topic}", indo da mais fácil para a mais difícil. ${tone} Importante: não mostre o gabarito agora. Mande só a Questão 1, espere minha resposta, comente meu raciocínio e só depois envie a Questão 2.`,
      feynman: `Vou aplicar a Técnica Feynman sobre "${topic}" em ${subject} (${level}). Escrevi com minhas próprias palavras o que entendi: [COLE SUA EXPLICAÇÃO AQUI]. ${tone} Avalie o que está certo, aponte o que ficou incompleto ou confuso e me faça 2 perguntas para aprofundar o que falta.`,
      redacao: `Aja como corretor de redação (nível ${level}). Vou colar abaixo meu parágrafo sobre "${topic}". ${tone} Regra principal: não reescreva nenhuma frase no meu lugar. Aponte apenas problemas de tese, coesão ou argumentação e faça perguntas que me ajudem a melhorar o texto por conta própria.`,
      revisao: `Estou revisando ${subject} (${level}) e preciso fixar "${topic}". ${tone} Monte uma revisão ativa em 3 blocos curtos: (1) os 3 pontos essenciais que não posso confundir, (2) as pegadinhas mais comuns em provas e (3) 2 perguntas rápidas para eu responder agora sem consultar o caderno.`
    };

    previewEl.textContent = templates[goal];
  }

  [subjectEl, levelEl, goalEl, toneEl].forEach((el) => el.addEventListener("change", buildPrompt));
  topicEl.addEventListener("input", buildPrompt);

  copyBtn.addEventListener("click", () => {
    copyText(previewEl.textContent, "Comando copiado! Agora é só colar na IA.");
  });

  buildPrompt();
}

/* ---------- Biblioteca de 16 Prompts Prontos + Favoritos ---------- */
const DEFAULT_PROMPTS = [
  {
    id: "p1",
    category: "socratico",
    categoryLabel: "Entender Matéria",
    title: "Destravar um assunto difícil degrau por degrau",
    why: "Evita aqueles textões enormes que dão preguiça de ler e garante que você entendeu a base antes de complicar.",
    tip: "Responda com suas palavras, mesmo que ache que está incompleto.",
    text: "Estou estudando [MATÉRIA / ASSUNTO] e travei em [PARTE ESPECÍFICA]. Aja como um tutor usando o Método Socrático: não me dê tudo pronto. Explique apenas a ideia inicial em 3 ou 4 linhas, dê um exemplo simples do dia a dia e me faça uma pergunta curta antes de avançar."
  },
  {
    id: "p2",
    category: "socratico",
    categoryLabel: "Entender Matéria",
    title: "Diferenciar dois conceitos que sempre se misturam",
    why: "Ideal para aquelas duplas clássicas de prova (mitose e meiose, adjunto e complemento, Estado e Governo).",
    tip: "Depois da explicação, tente criar um exemplo próprio para cada conceito.",
    text: "Sempre confundo [CONCEITO A] e [CONCEITO B] em [MATÉRIA]. Me ajude a separar os dois usando o Método Socrático: apresente apenas a diferença principal entre eles em poucas linhas e me dê 2 situações rápidas para eu classificar antes de seguirmos."
  },
  {
    id: "p3",
    category: "socratico",
    categoryLabel: "Entender Matéria",
    title: "Conectar causa e consequência em Humanas",
    why: "Em História e Geografia, decorar data não basta — as bancas cobram o motivo de um fato levar ao outro.",
    tip: "Peça para a IA cobrar a relação com o contexto do Brasil ou do mundo na época.",
    text: "Quero entender as causas e consequências de [TEMA DE HISTÓRIA / GEOGRAFIA] sem decorar uma lista pronta. Me faça uma primeira pergunta sobre o contexto anterior a esse evento para construirmos a linha do tempo juntos, um passo por vez."
  },
  {
    id: "p4",
    category: "exatas",
    categoryLabel: "Exatas & Cálculos",
    title: "Resolver exercício sem receber a conta pronta",
    why: "Treina a parte mais difícil das exatas: interpretar o enunciado e descobrir qual fórmula usar.",
    tip: "Faça as contas no rascunho de papel e digite só o passo que você tentou.",
    text: "Preciso resolver esta questão de [MATÉRIA]: [COLE O ENUNCIADO]. Não faça a conta para mim nem mostre o resultado final. Primeiro, me ajude a listar os dados que o problema forneceu e me pergunte qual fórmula ou relação devemos usar no primeiro passo."
  },
  {
    id: "p5",
    category: "exatas",
    categoryLabel: "Exatas & Cálculos",
    title: "Caça-erro na minha resolução",
    why: "Quando o resultado não bate com o gabarito, esse comando mostra exatamente onde você escorregou.",
    tip: "Escreva cada linha da sua conta para a IA localizar o desvio exato.",
    text: "Tentei resolver esta questão: [ENUNCIADO]. Meu passo a passo foi: [COLE SUA RESOLUÇÃO]. Não me dê a conta final pronta: apenas aponte em qual linha meu raciocínio ou sinal desviou e me dê uma pista para eu corrigir sozinho."
  },
  {
    id: "p6",
    category: "exatas",
    categoryLabel: "Exatas & Cálculos",
    title: "Entender de onde vem uma fórmula (sem decorar no escuro)",
    why: "Quando você entende a lógica da fórmula, consegue deduzir até se esquecer na hora da prova.",
    tip: "Ótimo para Cinemática, Geometria Plana, Porcentagem e Juros.",
    text: "Não quero apenas decorar a fórmula [FÓRMULA] em [MATÉRIA]. Me conduza com 2 ou 3 perguntas simples usando um exemplo numérico pequeno para eu deduzir por que essa fórmula funciona desse jeito."
  },
  {
    id: "p7",
    category: "questoes",
    categoryLabel: "Questões & Simulados",
    title: "Mini-simulado com gabarito escondido",
    why: "Transforma o chat em uma bateria de treino ativo, liberando o comentário só depois do seu chute consciente.",
    tip: "Justifique em 1 linha por que você escolheu a alternativa.",
    text: "Crie 5 questões inéditas de múltipla escolha no estilo [ENEM / FUVEST / VESTIBULAR] sobre [TEMA]. Envie apenas a Questão 1 sem mostrar o gabarito. Depois que eu responder, comente minha escolha e envie a Questão 2."
  },
  {
    id: "p8",
    category: "questoes",
    categoryLabel: "Questões & Simulados",
    title: "Autópsia de uma questão que eu errei",
    why: "Analisa por que a alternativa errada parecia tão atraente e qual palavra do enunciado entregava a certa.",
    tip: "Anote o padrão da pegadinha no seu caderno de erros.",
    text: "Errei esta questão: [COLE A QUESTÃO E AS ALTERNATIVAS]. Marquei a letra [SUA LETRA], mas o gabarito oficial é [GABARITO]. Explique por que a alternativa que marquei é uma pegadinha e qual trecho do enunciado aponta para a resposta certa."
  },
  {
    id: "p9",
    category: "questoes",
    categoryLabel: "Questões & Simulados",
    title: "Interpretar gráficos e tabelas de prova",
    why: "Treina leitura de eixos, unidades de medida e tendências — clássico em Natureza, Matemática e Geografia.",
    tip: "Descreva os dados do gráfico ou cole a tabela do exercício.",
    text: "Vou te passar os dados de um gráfico/tabela de uma questão de [MATÉRIA]: [DESCREVA OS EIXOS E VALORES]. Não resolva a questão ainda: me faça 2 perguntas sobre o comportamento desses dados para treinar minha leitura antes de olhar as alternativas."
  },
  {
    id: "p10",
    category: "redacao",
    categoryLabel: "Redação",
    title: "Checar se minha tese e meus argumentos fazem sentido",
    why: "Funciona como um orientador de estrutura sem escrever uma única linha no seu lugar.",
    tip: "Cole apenas o rascunho que você mesmo escreveu.",
    text: "Vou colar minha introdução de redação sobre o tema [TEMA]. Não reescreva nenhuma frase por mim. Diga apenas se a minha tese está clara, se os dois argumentos estão bem definidos e me faça 2 perguntas para eu fortalecer meu parágrafo."
  },
  {
    id: "p11",
    category: "redacao",
    categoryLabel: "Redação",
    title: "Revisar coesão e palavras repetidas",
    why: "Ajuda a limpar vícios de linguagem e períodos longos antes de passar o texto a limpo.",
    tip: "Use depois de terminar seu rascunho completo.",
    text: "Analise este parágrafo que eu escrevi e liste apenas: (1) palavras repetidas muito próximas, (2) frases que ficaram confusas ou longas demais e (3) sugestões de conectivos adequados, sem reescrever o meu texto: [COLE SEU PARÁGRAFO]."
  },
  {
    id: "p12",
    category: "redacao",
    categoryLabel: "Redação",
    title: "Testar se meu repertório está bem conectado ao tema",
    why: "Evita o famoso 'repertório de bolso' solto que perde pontos na Competência 2 e 3 do ENEM.",
    tip: "Explique qual livro, filme, fato histórico ou conceito você quer usar.",
    text: "Quero usar [REPERTÓRIO] no meu desenvolvimento sobre o tema [TEMA]. Não escreva o parágrafo para mim: apenas avalie se a conexão faz sentido e me faça 2 perguntas para garantir que o repertório fique produtivo e ligado à minha tese."
  },
  {
    id: "p13",
    category: "revisao",
    categoryLabel: "Revisão & Memória",
    title: "Avaliação pela Técnica Feynman",
    why: "Você escreve o que lembra do assunto e a IA aponta as lacunas que passaram batido.",
    tip: "Combine com a Folha de Consolidação aqui do EstudoIA.",
    text: "Vou te explicar com minhas próprias palavras o que entendi sobre [TEMA]: [COLE SUA EXPLICAÇÃO]. Avalie o que está bem explicado, aponte o que ficou faltando ou impreciso e me faça 1 pergunta final para fechar a revisão."
  },
  {
    id: "p14",
    category: "revisao",
    categoryLabel: "Revisão & Memória",
    title: "Roteiro de revisão enxuto antes da prova",
    why: "Organiza vários tópicos acumulados em blocos curtos de estudo ativo para os dias anteriores ao exame.",
    tip: "Seja realista com o tempo que você tem por dia.",
    text: "Tenho prova de [MATÉRIA] daqui a [NÚMERO] dias e preciso revisar: [LISTA DE ASSUNTOS]. Monte um plano prático de 35 minutos por dia misturando revisão ativa e resolução de exercícios, sem textões teóricos."
  },
  {
    id: "p15",
    category: "idiomas",
    categoryLabel: "Idiomas & Leitura",
    title: "Treino de conversa em Inglês ou Espanhol",
    why: "Pratica escrita real com correção leve a cada mensagem, sem precisar ter vergonha de errar.",
    tip: "Tente responder sem usar tradutor primeiro.",
    text: "Aja como um tutor de [INGLÊS / ESPANHOL] no nível [INICIANTE / INTERMEDIÁRIO]. Vamos conversar sobre [ASSUNTO DO COTIDIANO]. Faça uma pergunta curta no idioma, espere minha resposta, corrija eventuais erros de forma simples e continue o papo."
  },
  {
    id: "p16",
    category: "idiomas",
    categoryLabel: "Idiomas & Leitura",
    title: "Leitura crítica sem resumo mastigado",
    why: "Excelente para textos de vestibular e artigos em português ou inglês: treina inferência e ideia central.",
    tip: "Cole um texto curto ou um parágrafo de artigo.",
    text: "Vou colar um texto abaixo. Não faça o resumo dele para mim. Em vez disso, me faça 3 perguntas de interpretação (uma sobre a tese do autor, uma de inferência e uma sobre o sentido de uma expressão) e corrija minhas respostas uma por uma: [COLE O TEXTO]."
  }
];

function initPromptLibrary() {
  const grid = document.getElementById("promptsGrid");
  const filterButtons = document.querySelectorAll("#categoryFilters .pill");
  const searchInput = document.getElementById("promptSearch");
  const favCountEl = document.getElementById("favCount");
  const saveCustomBtn = document.getElementById("saveCustomPromptBtn");

  let activeFilter = "todos";
  let searchQuery = "";

  let favorites = [];
  let customPrompts = [];
  try {
    favorites = JSON.parse(localStorage.getItem("estudoia_favs_v3") || "[]");
    customPrompts = JSON.parse(localStorage.getItem("estudoia_custom_v3") || "[]");
  } catch (e) {
    favorites = [];
    customPrompts = [];
  }

  function saveState() {
    localStorage.setItem("estudoia_favs_v3", JSON.stringify(favorites));
    localStorage.setItem("estudoia_custom_v3", JSON.stringify(customPrompts));
    favCountEl.textContent = String(favorites.length);
  }

  function getAllPrompts() {
    return [...customPrompts, ...DEFAULT_PROMPTS];
  }

  saveCustomBtn.addEventListener("click", () => {
    const text = document.getElementById("generatedPromptText").textContent.trim();
    const subject = document.getElementById("genSubject").value;
    const topic = document.getElementById("genTopic").value.trim() || "Comando personalizado";
    const id = "custom_" + Date.now();

    customPrompts.unshift({
      id,
      category: "socratico",
      categoryLabel: `Meu Comando • ${subject}`,
      title: topic,
      why: "Montado por você no laboratório do EstudoIA.",
      tip: "Cole no chat e responda cada pergunta com calma.",
      text
    });
    favorites.unshift(id);
    saveState();
    render();
    showToast("Salvo na sua aba Meus Favoritos!");
  });

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter((item) => item !== id);
      showToast("Removido dos favoritos.");
    } else {
      favorites.push(id);
      showToast("Salvo nos seus favoritos!");
    }
    saveState();
    render();
  }

  function render() {
    favCountEl.textContent = String(favorites.length);
    const all = getAllPrompts();

    const filtered = all.filter((item) => {
      const isFav = favorites.includes(item.id);
      const matchesCat =
        activeFilter === "todos" ||
        (activeFilter === "favoritos" && isFav) ||
        item.category === activeFilter;

      const q = searchQuery.toLowerCase();
      const matchesText =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.why.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);

      return matchesCat && matchesText;
    });

    if (filtered.length === 0) {
      const emptyMsg =
        activeFilter === "favoritos"
          ? "Você ainda não favoritou nenhum comando. Clique em 'Favoritar' em qualquer cartão ou salve um comando do montador acima."
          : `Nenhum comando encontrado para "${searchQuery}". Tente buscar outra palavra.`;
      grid.innerHTML = `<div class="prompt-card"><p>${emptyMsg}</p></div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((item) => {
        const isFav = favorites.includes(item.id);
        return `
          <article class="prompt-card">
            <div>
              <div class="prompt-card-top">
                <span class="cat-badge">${item.categoryLabel}</span>
                <button type="button" class="fav-toggle-btn ${isFav ? "is-fav" : ""}" data-fav-id="${item.id}" aria-label="Favoritar comando">
                  ${isFav ? "★ Favorito" : "☆ Favoritar"}
                </button>
              </div>
              <h3>${item.title}</h3>
              <p class="prompt-why">${item.why}</p>
              <div class="prompt-code">${item.text}</div>
              <div class="prompt-tip-line"><strong>Dica de uso:</strong> ${item.tip}</div>
            </div>
            <div class="prompt-card-actions">
              <button type="button" class="btn btn-primary btn-sm copy-card-btn" data-id="${item.id}">Copiar comando</button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".copy-card-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const found = getAllPrompts().find((p) => p.id === btn.dataset.id);
        if (found) copyText(found.text, "Comando copiado! Cole na sua IA preferida.");
      });
    });

    grid.querySelectorAll(".fav-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        toggleFavorite(btn.dataset.favId);
      });
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    render();
  });

  render();
}

/* ---------- Simulador de Diálogo Socrático (5 Disciplinas) ---------- */
const SIM_SCENARIOS = {
  fisica: {
    title: "Física — Velocidade Média",
    turns: [
      {
        role: "student",
        label: "Estudante",
        text: "Preciso resolver: 'Um carro percorre 120 km em 2 horas. Qual sua velocidade média?' Não me dê a conta pronta, me guie passo a passo."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: segurou a resposta final e pediu para identificar os dados.",
        text: "Fechado! A velocidade média compara a distância percorrida com o tempo gasto. Olhando para o enunciado, quais são esses dois números?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "A distância é 120 km e o tempo é 2 horas."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: transformou a fórmula em intuição cotidiana.",
        text: "Isso mesmo. Agora pense sem fórmula: se ele andou 120 km em 2 horas seguidas, quantos quilômetros ele fez em apenas 1 hora? Qual conta você faz?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "120 dividido por 2, que dá 60 km/h."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: conectou a intuição do aluno à fórmula oficial.",
        text: "Perfeito: 60 km/h! Você acabou de aplicar Vm = ΔS / Δt entendendo exatamente o que cada letra significa."
      }
    ]
  },
  matematica: {
    title: "Matemática — Equação do 2º Grau",
    turns: [
      {
        role: "student",
        label: "Estudante",
        text: "Me ajude a resolver x² - 5x + 6 = 0 usando o Método Socrático, um passo por vez."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: evita erro clássico de sinal ao pedir os coeficientes primeiro.",
        text: "Vamos por partes. Toda equação do 2º grau completa segue o modelo ax² + bx + c = 0. Olhando para a sua equação, quanto valem a, b e c?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "a = 1, b = -5 e c = 6."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: validou o sinal negativo e pediu só o cálculo do Delta.",
        text: "Boa, não esqueceu do sinal negativo no b! Agora substitua esses três valores na fórmula Δ = b² - 4·a·c. Quanto dá o Δ?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "(-5)² - 4·1·6 = 25 - 24 = 1."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: libera a etapa final para o aluno concluir sozinho.",
        text: "Exato, Δ = 1! Como o resultado é positivo, existem duas raízes reais diferentes. Agora jogue na fórmula x = (-b ± √Δ) / 2a para achar x' e x''."
      }
    ]
  },
  historia: {
    title: "História — Revolução Industrial",
    turns: [
      {
        role: "student",
        label: "Estudante",
        text: "Me explique por que a Revolução Industrial começou na Inglaterra, mas sem textão — vai me perguntando."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: puxa o conhecimento prévio sobre matriz energética.",
        text: "Combinado. Para movimentar as primeiras máquinas a vapor no século XVIII, as fábricas inglesas precisavam de muita energia. Você lembra qual recurso mineral abundante no subsolo da Inglaterra alimentava essas caldeiras?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Acho que era petróleo?"
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: aproveita o erro sem dar a resposta de bandeja.",
        text: "Quase! O petróleo só virou estrela bem depois, na Segunda Revolução Industrial. Na primeira fase (século XVIII), queimava-se uma rocha preta em fornalhas para ferver água. Qual é esse mineral?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Carvão mineral! E também tinha ferro para fazer as máquinas."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: amarra o acerto com o próximo fator histórico.",
        text: "Exato: carvão mineral e minério de ferro! Agora já dá para ligar isso ao capital acumulado com o comércio marítimo e à mão de obra disponível nas cidades."
      }
    ]
  },
  quimica: {
    title: "Química — Balanceamento de Equações",
    turns: [
      {
        role: "student",
        label: "Estudante",
        text: "Travei no balanceamento de H₂ + O₂ → H₂O. Me guia sem fazer por mim?"
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: ensina a contar átomos antes de mexer nos coeficientes.",
        text: "Vamos contar os átomos de cada lado da seta. Do lado esquerdo (reagentes), quantos átomos de Hidrogênio (H) e de Oxigênio (O) você vê?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "2 de Hidrogênio e 2 de Oxigênio."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: compara reagentes e produtos para o aluno enxergar o desequilíbrio.",
        text: "Certo! Agora olhe para o lado direito (H₂O): temos 2 de Hidrogênio, mas só 1 de Oxigênio. Como a gente não pode mudar o índice pequeno da fórmula da água, qual número colocamos na frente do H₂O para ter 2 Oxigênios?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Coloco 2 na frente: 2 H₂O! Só que aí fico com 4 Hidrogênios na direita."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: deixa o ajuste final na mão do estudante.",
        text: "Percebeu certinho! Agora só falta ajustar o H₂ do lado esquerdo para também ter 4 Hidrogênios. Qual coeficiente você coloca na frente dele?"
      }
    ]
  },
  redacao: {
    title: "Redação ENEM — Tese e Argumentação",
    turns: [
      {
        role: "student",
        label: "Estudante",
        text: "Avalia minha frase sem reescrever por mim: 'Hoje em dia a internet atrapalha os jovens na escola porque todo mundo usa muito.'"
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: aponta generalização sem roubar a autoria do aluno.",
        text: "Você já apontou um problema, mas 'todo mundo' é generalização e 'atrapalha' ficou vago para uma tese de vestibular. Em qual ponto específico dos estudos o uso sem orientação prejudica o aluno?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Na perda de foco durante as aulas e no costume de copiar respostas prontas sem aprender."
      },
      {
        role: "ai",
        label: "Tutor IA",
        note: "Bastidores: devolve a escrita para o estudante lapidar.",
        text: "Agora sim você tem dois argumentos concretos! Tente reescrever sua frase trocando 'hoje em dia' por uma expressão mais formal e incluindo essas duas consequências que você mesmo levantou."
      }
    ]
  }
};

function initSocraticSimulator() {
  const scenarioBtns = document.querySelectorAll(".scenario-btn");
  const titleEl = document.getElementById("simTitle");
  const stepEl = document.getElementById("simStepIndicator");
  const messagesEl = document.getElementById("simMessages");
  const nextBtn = document.getElementById("simNextBtn");
  const resetBtn = document.getElementById("simResetBtn");

  let currentKey = "fisica";
  let visibleCount = 2;

  function renderSim() {
    const scenario = SIM_SCENARIOS[currentKey];
    const total = scenario.turns.length;
    titleEl.textContent = scenario.title;
    stepEl.textContent = `Turno ${visibleCount} de ${total}`;

    messagesEl.innerHTML = scenario.turns
      .slice(0, visibleCount)
      .map(
        (t) => `
        <div class="msg ${t.role}">
          <span class="msg-role">${t.label}</span>
          <div>${t.text}</div>
          ${t.note ? `<span class="msg-note">${t.note}</span>` : ""}
        </div>
      `
      )
      .join("");

    messagesEl.scrollTop = messagesEl.scrollHeight;

    if (visibleCount >= total) {
      nextBtn.disabled = true;
      nextBtn.textContent = "Conversa concluída";
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = "Próxima mensagem →";
    }
  }

  scenarioBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      scenarioBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentKey = btn.dataset.scenario;
      visibleCount = 2;
      renderSim();
    });
  });

  nextBtn.addEventListener("click", () => {
    const total = SIM_SCENARIOS[currentKey].turns.length;
    if (visibleCount < total) {
      visibleCount += 1;
      renderSim();
    }
  });

  resetBtn.addEventListener("click", () => {
    visibleCount = 2;
    renderSim();
  });

  renderSim();
}

/* ---------- Bloco de Foco (Pomodoro) ---------- */
function initPomodoroTimer() {
  const modeBtns = document.querySelectorAll(".tmode-btn");
  const labelEl = document.getElementById("timerModeLabel");
  const displayEl = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("timerStartBtn");
  const pauseBtn = document.getElementById("timerPauseBtn");
  const resetBtn = document.getElementById("timerResetBtn");
  const cyclesEl = document.getElementById("pomodoroCycles");
  const taskInput = document.getElementById("focusTaskInput");

  let selectedMinutes = 25;
  let secondsLeft = 25 * 60;
  let intervalId = null;
  let cycles = parseInt(localStorage.getItem("estudoia_pomodoro_v3") || "0", 10);

  if (taskInput) {
    taskInput.value = localStorage.getItem("estudoia_focus_task_v3") || "";
    taskInput.addEventListener("input", () => {
      localStorage.setItem("estudoia_focus_task_v3", taskInput.value);
    });
  }

  function updateCyclesUI() {
    cyclesEl.textContent = cycles === 1 ? "1 bloco feito hoje" : `${cycles} blocos feitos hoje`;
  }

  function formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function renderTime() {
    displayEl.textContent = formatTime(secondsLeft);
  }

  function playGentleTone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } catch (e) {
      // Silencioso caso bloqueado pelo navegador
    }
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  startBtn.addEventListener("click", () => {
    if (intervalId) return;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    intervalId = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft -= 1;
        renderTime();
      } else {
        stopTimer();
        playGentleTone();
        if (selectedMinutes === 25) {
          cycles += 1;
          localStorage.setItem("estudoia_pomodoro_v3", String(cycles));
          updateCyclesUI();
          showToast("Bloco de 25 min concluído! Agora anote o que você lembra na folha ao lado.");
        } else {
          showToast("Pausa encerrada! Bora para o próximo bloco.");
        }
        secondsLeft = selectedMinutes * 60;
        renderTime();
      }
    }, 1000);
  });

  pauseBtn.addEventListener("click", () => {
    stopTimer();
    showToast("Cronômetro pausado.");
  });

  resetBtn.addEventListener("click", () => {
    stopTimer();
    secondsLeft = selectedMinutes * 60;
    renderTime();
  });

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      stopTimer();
      modeBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedMinutes = parseInt(btn.dataset.minutes, 10);
      labelEl.textContent = btn.dataset.label;
      secondsLeft = selectedMinutes * 60;
      renderTime();
    });
  });

  updateCyclesUI();
  renderTime();
}

/* ---------- Folha Feynman (Salvamento Local + .TXT) ---------- */
function initFeynmanNotebook() {
  const titleInput = document.getElementById("noteTopicInput");
  const contentInput = document.getElementById("noteContentInput");
  const statusEl = document.getElementById("noteSaveStatus");
  const countEl = document.getElementById("noteWordCount");
  const clearBtn = document.getElementById("clearNoteBtn");
  const copyBtn = document.getElementById("copyNoteBtn");
  const downloadBtn = document.getElementById("downloadNoteBtn");

  try {
    const saved = JSON.parse(localStorage.getItem("estudoia_feynman_v3") || "null");
    if (saved) {
      titleInput.value = saved.title || "";
      contentInput.value = saved.content || "";
    }
  } catch (e) {
    // Fallback silencioso
  }

  function updateStatsAndSave() {
    const text = contentInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    countEl.textContent = words === 1 ? "1 palavra" : `${words} palavras`;

    localStorage.setItem(
      "estudoia_feynman_v3",
      JSON.stringify({
        title: titleInput.value,
        content: contentInput.value
      })
    );
    statusEl.textContent = "Salvo no navegador";
  }

  titleInput.addEventListener("input", updateStatsAndSave);
  contentInput.addEventListener("input", updateStatsAndSave);

  clearBtn.addEventListener("click", () => {
    if (!titleInput.value && !contentInput.value) return;
    titleInput.value = "";
    contentInput.value = "";
    updateStatsAndSave();
    showToast("Folha limpa para um novo assunto.");
  });

  copyBtn.addEventListener("click", () => {
    const title = titleInput.value.trim() || "Resumo EstudoIA";
    const body = contentInput.value.trim();
    if (!body) {
      showToast("Escreva seu resumo antes de copiar.");
      contentInput.focus();
      return;
    }
    copyText(`${title}\n\n${body}`, "Resumo copiado!");
  });

  downloadBtn.addEventListener("click", () => {
    const title = titleInput.value.trim() || "Resumo_EstudoIA";
    const body = contentInput.value.trim();
    if (!body) {
      showToast("Escreva algo na folha antes de baixar.");
      contentInput.focus();
      return;
    }

    const fileContent = `ESTUDOIA — FOLHA DE CONSOLIDAÇÃO (TÉCNICA FEYNMAN)\nAssunto: ${title}\nData: ${new Date().toLocaleDateString("pt-BR")}\n------------------------------------------------------------\n\n${body}\n`;
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = title.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_|_$/g, "") || "resumo_estudoia";
    a.href = url;
    a.download = `${safeName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Arquivo .TXT salvo no seu dispositivo!");
  });

  updateStatsAndSave();
}

/* ---------- Checklist Anti-Erro ---------- */
function initChecklist() {
  const checks = document.querySelectorAll(".verify-check");
  const statusEl = document.getElementById("checklistStatus");

  function update() {
    const checked = Array.from(checks).filter((c) => c.checked).length;
    if (checked === checks.length) {
      statusEl.textContent = "4 de 4 checagens feitas! Conteúdo conferido com segurança.";
    } else {
      statusEl.textContent = `${checked} de ${checks.length} checagens marcadas agora.`;
    }
  }

  checks.forEach((c) => c.addEventListener("change", update));
}

/* ---------- Desafio Caça-Erros (10 Rodadas Reais) ---------- */
const QUIZ_QUESTIONS = [
  {
    subject: "História do Brasil",
    statement: "\"A Independência do Brasil foi proclamada por Dom Pedro I às margens do rio Ipiranga em 7 de setembro de 1822.\"",
    isTrue: true,
    explanation: "Tudo certo! Data, local e personagem histórico estão exatos."
  },
  {
    subject: "Matemática",
    statement: "\"Para resolver 2x + 6 = 14, subtraímos 6 dos dois lados (2x = 8) e dividimos por 2, chegando em x = 6.\"",
    isTrue: false,
    explanation: "Pegadinha clássica de IA! O passo a passo foi certo até 2x = 8, mas 8 dividido por 2 é 4, não 6."
  },
  {
    subject: "Literatura Brasileira",
    statement: "\"O romance Dom Casmurro, publicado em 1899, foi escrito por José de Alencar e narra a história de Bentinho e Capitu.\"",
    isTrue: false,
    explanation: "Invenção! O ano (1899) e os personagens estão certos, mas o autor de Dom Casmurro é Machado de Assis."
  },
  {
    subject: "Biologia",
    statement: "\"Na fotossíntese, as plantas usam gás carbônico (CO₂), água e luz para produzir glicose e liberar oxigênio (O₂).\"",
    isTrue: true,
    explanation: "Correto! Os reagentes e os produtos da fotossíntese foram descritos certinho."
  },
  {
    subject: "Repertório de Redação",
    statement: "\"Como escreveu Sócrates em seu famoso livro 'A República Moderna': 'A tecnologia exige sabedoria de quem a consulta'.\"",
    isTrue: false,
    explanation: "Alucinação total! Sócrates não deixou livros escritos, muito menos sobre tecnologia. Nunca use citações geradas pelo chat sem conferir."
  },
  {
    subject: "Química",
    statement: "\"A molécula da água (H₂O) é formada por dois átomos de hidrogênio ligados covalentemente a um átomo de oxigênio.\"",
    isTrue: true,
    explanation: "Correto! Fórmula molecular e tipo de ligação estão certos."
  },
  {
    subject: "Geografia do Brasil",
    statement: "\"O bioma Caatinga é exclusivamente brasileiro e predomina na região Sul do país, com clima subtropical úmido.\"",
    isTrue: false,
    explanation: "Erro geográfico! A Caatinga é de fato exclusivamente brasileira, mas fica no Nordeste (clima semiárido), e não no Sul."
  },
  {
    subject: "Física",
    statement: "\"Pela Primeira Lei de Newton (Inércia), um corpo em repouso tende a continuar em repouso se a força resultante sobre ele for zero.\"",
    isTrue: true,
    explanation: "Correto! Definição fiel do princípio da inércia."
  },
  {
    subject: "Álgebra (Sinais)",
    statement: "\"Calculando (-3)² - 4·(1)·(-2), temos 9 - 8 = 1.\"",
    isTrue: false,
    explanation: "Erro de sinal! Na multiplicação -4 · 1 · (-2), menos com menos dá mais (+8). Então 9 + 8 = 17, e não 1."
  },
  {
    subject: "História Geral",
    statement: "\"A Queda do Muro de Berlim aconteceu em novembro de 1989, marcando simbolicamente o fim da Guerra Fria.\"",
    isTrue: true,
    explanation: "Correto! Aconteceu em 9 de novembro de 1989."
  }
];

function initHallucinationQuiz() {
  const scoreEl = document.getElementById("quizScore");
  const subjectEl = document.getElementById("quizSubject");
  const statementEl = document.getElementById("quizStatement");
  const choiceBtns = document.querySelectorAll(".quiz-choice");
  const feedbackEl = document.getElementById("quizFeedback");
  const progressEl = document.getElementById("quizProgress");
  const nextBtn = document.getElementById("quizNextBtn");

  let index = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    const q = QUIZ_QUESTIONS[index];
    answered = false;
    subjectEl.textContent = q.subject;
    statementEl.textContent = q.statement;
    progressEl.textContent = `Rodada ${index + 1} de ${QUIZ_QUESTIONS.length}`;
    feedbackEl.style.display = "none";
    nextBtn.style.display = "none";
    choiceBtns.forEach((b) => {
      b.disabled = false;
    });
  }

  choiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const userChoice = btn.dataset.answer === "true";
      const q = QUIZ_QUESTIONS[index];
      const isRight = userChoice === q.isTrue;

      if (isRight) {
        score += 1;
        scoreEl.textContent = `Acertos: ${score} / ${QUIZ_QUESTIONS.length}`;
      }

      feedbackEl.className = `quiz-feedback ${isRight ? "correct" : "wrong"}`;
      feedbackEl.innerHTML = `<strong>${isRight ? "Boa! Você pegou." : "Ops, passou batido!"}</strong> ${q.explanation}`;
      feedbackEl.style.display = "block";

      choiceBtns.forEach((b) => {
        b.disabled = true;
      });

      nextBtn.textContent = index < QUIZ_QUESTIONS.length - 1 ? "Próxima rodada →" : "Jogar de novo ↻";
      nextBtn.style.display = "inline-flex";
    });
  });

  nextBtn.addEventListener("click", () => {
    if (index < QUIZ_QUESTIONS.length - 1) {
      index += 1;
    } else {
      index = 0;
      score = 0;
      scoreEl.textContent = `Acertos: 0 / ${QUIZ_QUESTIONS.length}`;
    }
    renderQuestion();
  });

  renderQuestion();
}

/* ---------- Termômetro Interativo de Hábitos ---------- */
function initHabitChecker() {
  const checks = document.querySelectorAll(".habit-check");
  const titleEl = document.getElementById("habitScoreTitle");
  const badgeEl = document.getElementById("habitScoreBadge");
  const adviceEl = document.getElementById("habitScoreAdvice");
  if (!checks.length) return;

  function updateDiagnosis() {
    let total = 0;
    checks.forEach((c) => {
      if (c.checked) total += parseInt(c.dataset.points || "2", 10);
    });

    badgeEl.textContent = `${total} / 10 pts`;

    if (total === 0) {
      titleEl.textContent = "Marque os hábitos acima para ver seu diagnóstico";
      adviceEl.textContent = "Cada hábito marcado mostra que você está no controle da ferramenta, e não o contrário.";
    } else if (total <= 4) {
      titleEl.textContent = "Atenção: risco alto de estudo passivo";
      adviceEl.textContent = "Você pode estar deixando o chat fazer a parte pesada do raciocínio. Experimente usar os prompts socráticos da Seção 02 na próxima lista de exercícios.";
    } else if (total <= 8) {
      titleEl.textContent = "Bom caminho! Falta só fechar o ciclo";
      adviceEl.textContent = "Você já usa a IA com critério, mas tente incluir a etapa de fechar a tela e resumir no papel para fixar ainda mais.";
    } else {
      titleEl.textContent = "Estudo ativo no máximo!";
      adviceEl.textContent = "Você usa a IA exatamente como um tutor particular — mantendo senso crítico, autoria própria e memória de longo prazo.";
    }
  }

  checks.forEach((c) => c.addEventListener("change", updateDiagnosis));
}

/* ---------- Caixa de Sugestão ---------- */
function initSuggestionBox() {
  const input = document.getElementById("suggestInput");
  const btn = document.getElementById("copySuggestionBtn");
  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const val = input.value.trim();
    if (!val) {
      showToast("Escreva sua ideia de prompt primeiro.");
      input.focus();
      return;
    }
    const formatted = `[Ideia de Prompt — EstudoIA]: ${val}`;
    copyText(formatted, "Sugestão copiada! Agora é só colar e compartilhar.");
    input.value = "";
  });
}

/* =========================================================
   EstudoIA — Lógica Completa da Plataforma
   Personalização Visual, Gerador Socrático, Simulador,
   Timer Pomodoro, Caderno Feynman e Quiz Caça-Alucinações
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initCustomizer();
  initMobileMenu();
  initPromptGenerator();
  initPromptLibrary();
  initSocraticSimulator();
  initPomodoroTimer();
  initFeynmanNotebook();
  initChecklist();
  initHallucinationQuiz();
  initImpactSwitcher();
  initSuggestionBox();
});

/* ---------- Notificação Toast ---------- */
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

/* ---------- Copiar Texto com Fallback ---------- */
async function copyText(text, successMsg = "Copiado para a área de transferência!") {
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
    showToast("Não foi possível copiar automaticamente. Selecione e copie o texto.");
  }
}

/* ---------- Personalização Visual (Temas, Paletas, Fonte, Bordas) ---------- */
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
    palette: "indigo",
    fontSize: "100",
    radius: "rounded"
  };

  let prefs = { ...defaultPrefs };
  try {
    const saved = JSON.parse(localStorage.getItem("estudoia_prefs") || "null");
    if (saved) prefs = { ...defaultPrefs, ...saved };
  } catch (e) {
    prefs = { ...defaultPrefs };
  }

  function applyPrefs() {
    root.setAttribute("data-theme", prefs.theme);
    root.setAttribute("data-palette", prefs.palette);
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
    document.querySelectorAll("[data-font-size]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.fontSize === String(prefs.fontSize));
    });
    document.querySelectorAll("[data-radius-choice]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.radiusChoice === prefs.radius);
    });

    localStorage.setItem("estudoia_prefs", JSON.stringify(prefs));
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
    showToast("Visual restaurado para o padrão original!");
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

/* ---------- Gerador Avançado de Prompts Socráticos ---------- */
function initPromptGenerator() {
  const subjectEl = document.getElementById("genSubject");
  const levelEl = document.getElementById("genLevel");
  const goalEl = document.getElementById("genGoal");
  const topicEl = document.getElementById("genTopic");
  const toneEl = document.getElementById("genTone");
  const previewEl = document.getElementById("generatedPromptText");
  const copyBtn = document.getElementById("copyGeneratedBtn");

  const toneInstructions = {
    paciente: "Use linguagem clara, paciente e dê exemplos simples do cotidiano.",
    direto: "Seja objetivo, sem rodeios e foque nos pontos essenciais de prova.",
    banca: "Adote postura rigorosa de banca avaliadora, cobrando precisão conceitual."
  };

  function buildPrompt() {
    const subject = subjectEl.value;
    const level = levelEl.value;
    const goal = goalEl.value;
    const topic = topicEl.value.trim() || "[ESCREVA AQUI O ASSUNTO OU ENUNCIADO]";
    const tone = toneInstructions[toneEl.value];

    const templates = {
      socratico: `Aja como um tutor especialista em ${subject} (nível ${level}) usando o Método Socrático. Quero aprender "${topic}". ${tone} REGRA ANTI-COLA: NÃO me dê a explicação completa nem a resposta pronta de uma vez. Primeiro, pergunte o que eu já sei sobre o assunto ou explique apenas o conceito inicial em 3 linhas e me faça 1 pergunta curta para guiar meu raciocínio. Só avance depois que eu responder.`,
      calculo: `Preciso resolver esta questão de ${subject} (nível ${level}): "${topic}". ${tone} NÃO resolva a conta nem entregue o resultado final para mim. Primeiro, me ajude a identificar os dados fornecidos no problema e me pergunte qual fórmula ou relação lógica devemos aplicar no primeiro passo.`,
      questoes: `Aja como elaborador de provas de ${subject} (nível ${level}). Crie 4 questões inéditas sobre "${topic}" em ordem crescente de dificuldade. ${tone} IMPORTANTE: NÃO mostre o gabarito agora. Envie apenas a Questão 1, aguarde minha resposta, corrija meu raciocínio com dicas e só então libere a próxima.`,
      feynman: `Vou aplicar a Técnica Feynman sobre "${topic}" na disciplina de ${subject} (${level}). Vou escrever abaixo o que entendi com minhas próprias palavras: [COLE SUA EXPLICAÇÃO AQUI]. ${tone} Avalie o que está correto, aponte o que ficou incompleto ou confuso e me faça 2 perguntas para aprofundar meu domínio.`,
      redacao: `Aja como corretor de redação (nível ${level}). Vou colar abaixo meu texto/parágrafo sobre "${topic}". ${tone} REGRA PRINCIPAL: NÃO reescreva nenhuma frase por mim. Aponte apenas falhas de tese, coesão ou argumentação e faça perguntas que me ajudem a melhorar meu próprio texto.`,
      revisao: `Estou revisando ${subject} (${level}) e preciso dominar "${topic}". ${tone} Monte um roteiro ativo dividido em 3 etapas rápidas: (1) conceitos-chave que não posso confundir, (2) pegadinhas mais comuns em provas sobre esse tema e (3) 2 perguntas rápidas para eu responder agora sem consultar o caderno.`
    };

    previewEl.textContent = templates[goal];
  }

  [subjectEl, levelEl, goalEl, toneEl].forEach((el) => el.addEventListener("change", buildPrompt));
  topicEl.addEventListener("input", buildPrompt);

  copyBtn.addEventListener("click", () => {
    copyText(previewEl.textContent, "Prompt personalizado copiado!");
  });

  buildPrompt();
}

/* ---------- Biblioteca de Prompts Prontos + Favoritos ---------- */
const DEFAULT_PROMPTS = [
  {
    id: "p1",
    category: "socratico",
    categoryLabel: "Tutor Socrático",
    title: "Destravar Qualquer Matéria Passo a Passo",
    why: "Impede que a IA entregue um textão passivo e obriga você a confirmar cada conceito antes de avançar.",
    text: "Aja como um tutor paciente usando o Método Socrático. Estou estudando [MATÉRIA/TEMA] e travei em [PARTE ESPECÍFICA]. Não me dê tudo pronto: explique apenas o conceito inicial em 3 linhas, dê um exemplo simples e me faça uma pergunta curta para verificar se entendi."
  },
  {
    id: "p2",
    category: "socratico",
    categoryLabel: "Tutor Socrático",
    title: "Comparar Dois Conceitos Parecidos",
    why: "Ótimo para evitar confusões clássicas em provas (ex: mitose vs. meiose, oração coordenada vs. subordinada).",
    text: "Sempre confundo [CONCEITO A] e [CONCEITO B] em [MATÉRIA]. Use o Método Socrático para me ajudar a diferenciá-los: apresente apenas a diferença principal entre os dois e me dê 2 exemplos rápidos para eu classificar antes de continuarmos."
  },
  {
    id: "p3",
    category: "exatas",
    categoryLabel: "Exatas & Cálculos",
    title: "Resolver Cálculo sem Receber a Resposta",
    why: "Guia a interpretação do enunciado e a escolha da fórmula sem fazer a conta no seu lugar.",
    text: "Preciso resolver esta questão de [MATÉRIA]: [COLE O ENUNCIADO]. Não faça a conta para mim. Apenas me ajude a listar os dados do enunciado e me pergunte qual fórmula ou operação matemática devemos usar primeiro."
  },
  {
    id: "p4",
    category: "exatas",
    categoryLabel: "Exatas & Cálculos",
    title: "Descobrir Onde Errei na Minha Conta",
    why: "Você envia sua resolução e a IA aponta exatamente a linha em que o cálculo desviou.",
    text: "Tentei resolver esta questão: [ENUNCIADO]. Meu passo a passo foi: [COLE SUA RESOLUÇÃO]. Não me dê a resposta final ainda: apenas aponte em qual linha meu raciocínio ou cálculo desviou e me dê uma pista para corrigir."
  },
  {
    id: "p5",
    category: "questoes",
    categoryLabel: "Questões & Simulados",
    title: "Simulado Interativo com Gabarito Oculto",
    why: "Treina a recordação ativa antes da prova, liberando o comentário somente após sua tentativa.",
    text: "Crie um simulado com 5 questões de múltipla escolha (nível ENEM/Vestibular) sobre [TEMA]. Envie apenas a Questão 1 sem o gabarito. Depois que eu responder, comente minha escolha e envie a Questão 2."
  },
  {
    id: "p6",
    category: "questoes",
    categoryLabel: "Questões & Simulados",
    title: "Autópsia de Erro em Questão de Prova",
    why: "Ajuda a entender por que você caiu no distrator da banca em vez de apenas decorar a letra certa.",
    text: "Errei esta questão: [COLE A QUESTÃO]. Marquei a alternativa [SUA LETRA], mas o gabarito é [GABARITO]. Explique qual pegadinha me levou ao erro e qual palavra-chave do enunciado aponta para a alternativa correta."
  },
  {
    id: "p7",
    category: "redacao",
    categoryLabel: "Redação",
    title: "Diagnóstico de Tese e Argumentos (Sem Plágio)",
    why: "Mantém a autoria 100% sua e funciona como um orientador de estrutura textual.",
    text: "Vou colar minha introdução de redação sobre o tema [TEMA]. Não escreva nenhuma frase nova por mim. Diga apenas se minha tese está clara, se os dois argumentos estão bem definidos e faça 2 perguntas para eu fortalecer meu texto."
  },
  {
    id: "p8",
    category: "redacao",
    categoryLabel: "Redação",
    title: "Lapidar Coesão e Evitar Repetições",
    why: "Ajuda a revisar o parágrafo antes de passar a limpo na folha de redação.",
    text: "Analise o parágrafo abaixo que eu escrevi e liste apenas: (1) palavras repetidas muito próximas, (2) períodos longos que ficaram confusos e (3) opções de conectivos para melhorar a fluidez, sem reescrever meu parágrafo: [COLE SEU TEXTO]."
  },
  {
    id: "p9",
    category: "revisao",
    categoryLabel: "Revisão & Memória",
    title: "Teste Rápido: Técnica Feynman",
    why: "Você explica a matéria com suas palavras e a IA avalia o que ficou faltando.",
    text: "Vou te explicar com minhas próprias palavras o que entendi sobre [TEMA]. Depois que eu enviar minha explicação, avalie o que acertei, o que ficou incompleto e me faça 1 pergunta de aprofundamento."
  },
  {
    id: "p10",
    category: "revisao",
    categoryLabel: "Revisão & Memória",
    title: "Plano de Revisão até o Dia da Prova",
    why: "Organiza conteúdos acumulados em metas curtas e realistas para cada dia.",
    text: "Tenho prova de [MATÉRIA] daqui a [NÚMERO] dias e preciso revisar: [LISTA DE ASSUNTOS]. Monte um cronograma prático de 35 minutos por dia combinando revisão ativa e resolução de exercícios."
  },
  {
    id: "p11",
    category: "idiomas",
    categoryLabel: "Idiomas & Leitura",
    title: "Conversação Guiada em Inglês ou Espanhol",
    why: "Pratica vocabulário real com correção gentil a cada mensagem enviada.",
    text: "Aja como um tutor de [IDIOMA] no nível [BÁSICO/INTERMEDIÁRIO]. Vamos conversar sobre [TEMA DO COTIDIANO]. Faça uma pergunta curta no idioma escolhido, espere minha resposta, corrija eventuais erros gramaticais de forma simples e continue o diálogo."
  },
  {
    id: "p12",
    category: "idiomas",
    categoryLabel: "Idiomas & Leitura",
    title: "Interpretação de Texto sem Resumo Pronto",
    why: "Treina leitura crítica fazendo perguntas sobre tese, ironia e argumentos do autor.",
    text: "Vou colar um texto abaixo. Não faça o resumo dele para mim. Em vez disso, me faça 3 perguntas de interpretação (uma de ideia central, uma de inferência e uma de vocabulário) e corrija minhas respostas uma por uma: [COLE O TEXTO]."
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
    favorites = JSON.parse(localStorage.getItem("estudoia_favs") || "[]");
    customPrompts = JSON.parse(localStorage.getItem("estudoia_custom_prompts") || "[]");
  } catch (e) {
    favorites = [];
    customPrompts = [];
  }

  function saveState() {
    localStorage.setItem("estudoia_favs", JSON.stringify(favorites));
    localStorage.setItem("estudoia_custom_prompts", JSON.stringify(customPrompts));
    favCountEl.textContent = String(favorites.length);
  }

  function getAllPrompts() {
    return [...customPrompts, ...DEFAULT_PROMPTS];
  }

  saveCustomBtn.addEventListener("click", () => {
    const text = document.getElementById("generatedPromptText").textContent.trim();
    const subject = document.getElementById("genSubject").value;
    const topic = document.getElementById("genTopic").value.trim() || "Personalizado";
    const id = "custom_" + Date.now();

    customPrompts.unshift({
      id,
      category: "socratico",
      categoryLabel: `Personalizado • ${subject}`,
      title: `Prompt Socrático: ${topic}`,
      why: "Comando criado por você no Gerador Personalizado do EstudoIA.",
      text
    });
    favorites.unshift(id);
    saveState();
    render();
    showToast("Prompt salvo na sua aba de Favoritos ⭐!");
  });

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter((item) => item !== id);
      showToast("Removido dos favoritos.");
    } else {
      favorites.push(id);
      showToast("Adicionado aos favoritos ⭐!");
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
          ? "Você ainda não favoritou nenhum prompt. Clique na estrela ⭐ de qualquer card ou salve um prompt do gerador!"
          : `Nenhum prompt encontrado para "${searchQuery}". Tente outro termo ou limpe o filtro.`;
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
                <button type="button" class="fav-toggle-btn ${isFav ? "is-fav" : ""}" data-fav-id="${item.id}" aria-label="Favoritar prompt">
                  ${isFav ? "★ Favorito" : "☆ Favoritar"}
                </button>
              </div>
              <h3>${item.title}</h3>
              <p class="prompt-why">${item.why}</p>
              <div class="prompt-code">${item.text}</div>
            </div>
            <div class="prompt-card-actions">
              <button type="button" class="btn btn-primary btn-sm copy-card-btn" data-id="${item.id}">📋 Copiar Prompt</button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".copy-card-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const found = getAllPrompts().find((p) => p.id === btn.dataset.id);
        if (found) copyText(found.text, "Prompt copiado! Cole na sua IA preferida.");
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

/* ---------- Simulador Interativo do Método Socrático ---------- */
const SIM_SCENARIOS = {
  fisica: {
    title: "Sessão Socrática: Física (Velocidade Média)",
    turns: [
      {
        role: "student",
        label: "Estudante (Prompt EstudoIA)",
        text: "Aja como tutor usando o Método Socrático. Preciso resolver: 'Um carro percorre 120 km em 2 horas. Qual sua velocidade média?' Não me dê a resposta final."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 1 e 2: Trava anti-cola + Diagnóstico",
        text: "Combinado! Para encontrar a velocidade média, relacionamos duas grandezas: a distância percorrida e o tempo gasto. Olhando para o enunciado, quais são esses dois valores?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "A distância é 120 km e o tempo é 2 horas."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 3: Passo fracionado + Pergunta",
        text: "Perfeito. Agora pense: se ele percorreu 120 km em 2 horas, quantos quilômetros ele fez em apenas 1 hora? Qual operação você faria?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Dividir 120 por 2, que dá 60 km/h!"
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Consolidação do conceito",
        text: "Exato: 60 km/h! Você acabou de deduzir na prática a fórmula Vm = ΔS / Δt sem precisar decorar no escuro."
      }
    ]
  },
  matematica: {
    title: "Sessão Socrática: Matemática (Equação do 2º Grau)",
    turns: [
      {
        role: "student",
        label: "Estudante (Prompt EstudoIA)",
        text: "Me ajude a resolver x² - 5x + 6 = 0 usando o Método Socrático, um passo por vez."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 2: Diagnóstico inicial",
        text: "Vamos juntos! Antes de calcular, precisamos identificar os coeficientes a, b e c da equação ax² + bx + c = 0. Quais são os valores de a, b e c na sua equação?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "a = 1, b = -5 e c = 6."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 3: Passo fracionado",
        text: "Isso mesmo, atenção excelente ao sinal negativo do b! Agora, aplicando Δ = b² - 4·a·c com esses valores, quanto dá o valor de Δ?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "(-5)² - 4·1·6 = 25 - 24 = 1!"
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Próximo passo guiado",
        text: "Perfeito! Como Δ = 1 é positivo, teremos duas raízes reais diferentes. Agora substitua na fórmula x = (-b ± √Δ) / 2a para encontrar x' e x''."
      }
    ]
  },
  historia: {
    title: "Sessão Socrática: História (Revolução Industrial)",
    turns: [
      {
        role: "student",
        label: "Estudante (Prompt EstudoIA)",
        text: "Me explique por que a Revolução Industrial começou na Inglaterra usando o Método Socrático."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 2: Diagnóstico de conhecimento prévio",
        text: "Vamos por partes! Para mover as primeiras máquinas a vapor no século XVIII, a Inglaterra precisava de fonte de energia. Você lembra qual recurso mineral abundante no solo inglês alimentava essas máquinas?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Acho que era petróleo?"
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 4: Aproveitamento construtivo do erro",
        text: "Boa tentativa, mas o petróleo ganhou força só na Segunda Revolução Industrial! Na primeira fase (século XVIII), queimava-se uma rocha escura em fornalhas para ferver água. Qual é esse mineral?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Carvão mineral! E também tinha minério de ferro."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Conexão histórica",
        text: "Exato: carvão mineral e minério de ferro! Agora já podemos conectar isso ao acúmulo de capitais e à mão de obra disponível nas cidades."
      }
    ]
  },
  redacao: {
    title: "Sessão Socrática: Redação ENEM (Tese e Argumentação)",
    turns: [
      {
        role: "student",
        label: "Estudante (Prompt EstudoIA)",
        text: "Analise minha frase sem reescrever por mim: 'Hoje em dia a internet atrapalha os jovens na escola porque todo mundo usa muito.'"
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Regra 1: Proibição de reescrita / plágio",
        text: "Você já tem uma direção, mas 'todo mundo' é generalização e 'atrapalha' está vago. Em qual aspecto específico da aprendizagem o uso sem orientação prejudica o estudante?"
      },
      {
        role: "student",
        label: "Estudante",
        text: "Na falta de atenção e no hábito de copiar respostas prontas sem estudar."
      },
      {
        role: "ai",
        label: "IA (Tutor Socrático)",
        tag: "Estímulo à autoria própria",
        text: "Excelente! Agora tente reescrever sua frase trocando 'hoje em dia' por 'na contemporaneidade' e incluindo esses dois argumentos que você mesmo levantou."
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
    stepEl.textContent = `Mostrando ${visibleCount} de ${total} mensagens`;

    messagesEl.innerHTML = scenario.turns
      .slice(0, visibleCount)
      .map(
        (t) => `
        <div class="msg ${t.role}">
          <span class="msg-role">${t.label}</span>
          <div>${t.text}</div>
          ${t.tag ? `<span class="msg-tag">${t.tag}</span>` : ""}
        </div>
      `
      )
      .join("");

    messagesEl.scrollTop = messagesEl.scrollHeight;

    if (visibleCount >= total) {
      nextBtn.disabled = true;
      nextBtn.textContent = "Diálogo concluído ✓";
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = "Avançar diálogo socrático →";
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

/* ---------- Timer Pomodoro de Foco ---------- */
function initPomodoroTimer() {
  const modeBtns = document.querySelectorAll(".tmode-btn");
  const labelEl = document.getElementById("timerModeLabel");
  const displayEl = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("timerStartBtn");
  const pauseBtn = document.getElementById("timerPauseBtn");
  const resetBtn = document.getElementById("timerResetBtn");
  const cyclesEl = document.getElementById("pomodoroCycles");

  let selectedMinutes = 25;
  let secondsLeft = 25 * 60;
  let intervalId = null;
  let cycles = parseInt(localStorage.getItem("estudoia_pomodoro_cycles") || "0", 10);

  function updateCyclesUI() {
    cyclesEl.textContent = cycles === 1 ? "1 ciclo concluído" : `${cycles} ciclos concluídos`;
  }

  function formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function renderTime() {
    displayEl.textContent = formatTime(secondsLeft);
  }

  function playGentleChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignora caso o navegador bloqueie áudio automático
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
        playGentleChime();
        if (selectedMinutes === 25) {
          cycles += 1;
          localStorage.setItem("estudoia_pomodoro_cycles", String(cycles));
          updateCyclesUI();
          showToast("Ciclo de foco concluído! Hora de consolidar ou fazer uma pausa.");
        } else {
          showToast("Pausa concluída! Pronto para o próximo bloco de estudo.");
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

/* ---------- Caderno Rápido Feynman (Salvo no Navegador + Exportação .TXT) ---------- */
function initFeynmanNotebook() {
  const titleInput = document.getElementById("noteTopicInput");
  const contentInput = document.getElementById("noteContentInput");
  const statusEl = document.getElementById("noteSaveStatus");
  const countEl = document.getElementById("noteWordCount");
  const copyBtn = document.getElementById("copyNoteBtn");
  const downloadBtn = document.getElementById("downloadNoteBtn");

  try {
    const savedNote = JSON.parse(localStorage.getItem("estudoia_feynman_note") || "null");
    if (savedNote) {
      titleInput.value = savedNote.title || "";
      contentInput.value = savedNote.content || "";
    }
  } catch (e) {
    // Fallback silencioso
  }

  function updateStatsAndSave() {
    const text = contentInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    countEl.textContent = words === 1 ? "1 palavra" : `${words} palavras`;

    localStorage.setItem(
      "estudoia_feynman_note",
      JSON.stringify({
        title: titleInput.value,
        content: contentInput.value
      })
    );
    statusEl.textContent = "Salvo localmente ✓";
  }

  titleInput.addEventListener("input", updateStatsAndSave);
  contentInput.addEventListener("input", updateStatsAndSave);

  copyBtn.addEventListener("click", () => {
    const title = titleInput.value.trim() || "Resumo EstudoIA";
    const body = contentInput.value.trim();
    if (!body) {
      showToast("Escreva seu resumo antes de copiar.");
      contentInput.focus();
      return;
    }
    copyText(`${title}\n\n${body}`, "Resumo copiado para a área de transferência!");
  });

  downloadBtn.addEventListener("click", () => {
    const title = titleInput.value.trim() || "Resumo_EstudoIA";
    const body = contentInput.value.trim();
    if (!body) {
      showToast("Escreva seu resumo antes de baixar o arquivo.");
      contentInput.focus();
      return;
    }

    const fileContent = `ESTUDOIA — CADERNO DE CONSOLIDAÇÃO (TÉCNICA FEYNMAN)\nTítulo: ${title}\nData: ${new Date().toLocaleDateString("pt-BR")}\n------------------------------------------------------------\n\n${body}\n`;
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
    showToast("Arquivo .TXT baixado com sucesso!");
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
      statusEl.textContent = "4 de 4 etapas concluídas! Conteúdo verificado com segurança ✓";
    } else {
      statusEl.textContent = `${checked} de ${checks.length} etapas verificadas nesta sessão.`;
    }
  }

  checks.forEach((c) => c.addEventListener("change", update));
}

/* ---------- Quiz Caça-Alucinações (8 Questões) ---------- */
const QUIZ_QUESTIONS = [
  {
    subject: "História do Brasil",
    statement: "\"A Independência do Brasil foi proclamada por Dom Pedro I às margens do rio Ipiranga em 7 de setembro de 1822.\"",
    isTrue: true,
    explanation: "Correto! A data, o local e o personagem histórico estão exatos e batem com os registros oficiais."
  },
  {
    subject: "Matemática",
    statement: "\"Para resolver 2x + 6 = 14, subtraímos 6 dos dois lados (2x = 8) e dividimos por 2, encontrando x = 6.\"",
    isTrue: false,
    explanation: "Erro oculto! A explicação estava certa até 2x = 8, mas 8 dividido por 2 é 4, e não 6. Sempre confira a aritmética da IA!"
  },
  {
    subject: "Literatura Brasileira",
    statement: "\"O romance Dom Casmurro, publicado em 1899, foi escrito por José de Alencar e narra a história de Bentinho e Capitu.\"",
    isTrue: false,
    explanation: "Alucinação! O ano (1899) e os personagens estão certos, mas o autor de Dom Casmurro é Machado de Assis, e não José de Alencar."
  },
  {
    subject: "Biologia",
    statement: "\"Na fotossíntese, as plantas utilizam gás carbônico (CO₂), água e energia luminosa para produzir glicose e liberar oxigênio (O₂).\"",
    isTrue: true,
    explanation: "Correto! Os reagentes e produtos da fotossíntese estão descritos com precisão."
  },
  {
    subject: "Citação para Redação",
    statement: "\"Segundo o filósofo Sócrates, em sua famosa obra escrita República Moderna: 'A internet exige sabedoria de quem a consulta'.\"",
    isTrue: false,
    explanation: "Alucinação clássica! Sócrates não deixou obras escritas, muito menos sobre internet. IAs costumam inventar citações quando pressionadas por repertório."
  },
  {
    subject: "Química",
    statement: "\"A molécula da água (H₂O) é formada por dois átomos de hidrogênio ligados covalentemente a um átomo de oxigênio.\"",
    isTrue: true,
    explanation: "Correto! A composição atômica e o tipo de ligação química da água estão certos."
  },
  {
    subject: "Geografia do Brasil",
    statement: "\"O bioma Caatinga é exclusivamente brasileiro e predomina na região Sul do país, caracterizado por clima subtropical úmido.\"",
    isTrue: false,
    explanation: "Erro geográfico! A Caatinga é de fato exclusivamente brasileira, mas predomina no Nordeste (clima semiárido), e não no Sul."
  },
  {
    subject: "Física",
    statement: "\"De acordo com a Primeira Lei de Newton (Inércia), um corpo em repouso tende a permanecer em repouso se a força resultante sobre ele for nula.\"",
    isTrue: true,
    explanation: "Correto! O enunciado descreve fielmente o princípio da inércia."
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
    progressEl.textContent = `Questão ${index + 1} de ${QUIZ_QUESTIONS.length}`;
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
        scoreEl.textContent = `Pontos: ${score} / ${QUIZ_QUESTIONS.length}`;
      }

      feedbackEl.className = `quiz-feedback ${isRight ? "correct" : "wrong"}`;
      feedbackEl.innerHTML = `<strong>${isRight ? "Você acertou!" : "Atenção ao detalhe!"}</strong> ${q.explanation}`;
      feedbackEl.style.display = "block";

      choiceBtns.forEach((b) => {
        b.disabled = true;
      });

      nextBtn.textContent = index < QUIZ_QUESTIONS.length - 1 ? "Próxima questão →" : "Refazer desafio ↻";
      nextBtn.style.display = "inline-flex";
    });
  });

  nextBtn.addEventListener("click", () => {
    if (index < QUIZ_QUESTIONS.length - 1) {
      index += 1;
    } else {
      index = 0;
      score = 0;
      scoreEl.textContent = `Pontos: 0 / ${QUIZ_QUESTIONS.length}`;
    }
    renderQuestion();
  });

  renderQuestion();
}

/* ---------- Painel Comparativo de Impacto ---------- */
function initImpactSwitcher() {
  const buttons = document.querySelectorAll(".switch-btn");
  const m1Val = document.getElementById("m1Val");
  const m2Val = document.getElementById("m2Val");
  const m3Val = document.getElementById("m3Val");
  const m4Val = document.getElementById("m4Val");
  const m1Bar = document.getElementById("m1Bar");
  const m2Bar = document.getElementById("m2Bar");
  const m3Bar = document.getElementById("m3Bar");
  const m4Bar = document.getElementById("m4Bar");
  const summary = document.getElementById("impactSummary");

  const modes = {
    ativo: {
      m1: { val: "84%", width: "84%", cls: "good" },
      m2: { val: "87%", width: "87%", cls: "good" },
      m3: { val: "92%", width: "92%", cls: "good" },
      m4: { val: "10%", width: "10%", cls: "warn" },
      text: 'No <strong>Uso Ativo (Método EstudoIA)</strong>, a IA atua como tutora: você raciocina antes de ver a resposta, corrige erros com pistas e valida os fatos no seu material.'
    },
    passivo: {
      m1: { val: "16%", width: "16%", cls: "bad" },
      m2: { val: "20%", width: "20%", cls: "bad" },
      m3: { val: "44%", width: "44%", cls: "bad" },
      m4: { val: "90%", width: "90%", cls: "bad" },
      text: 'No <strong>Uso Passivo ("Copia e Cola")</strong>, a tarefa fica pronta rápido, mas o aprendizado real é mínimo e há alto risco de estudar informações inventadas pela IA.'
    }
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const data = modes[btn.dataset.mode];
      m1Val.textContent = data.m1.val;
      m1Bar.style.width = data.m1.width;
      m1Bar.className = `progress-fill ${data.m1.cls}`;

      m2Val.textContent = data.m2.val;
      m2Bar.style.width = data.m2.width;
      m2Bar.className = `progress-fill ${data.m2.cls}`;

      m3Val.textContent = data.m3.val;
      m3Bar.style.width = data.m3.width;
      m3Bar.className = `progress-fill ${data.m3.cls}`;

      m4Val.textContent = data.m4.val;
      m4Bar.style.width = data.m4.width;
      m4Bar.className = `progress-fill ${data.m4.cls}`;

      summary.innerHTML = data.text;
    });
  });
}

/* ---------- Sugestão de Prompt ---------- */
function initSuggestionBox() {
  const input = document.getElementById("suggestInput");
  const btn = document.getElementById("copySuggestionBtn");
  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const val = input.value.trim();
    if (!val) {
      showToast("Escreva uma sugestão de prompt primeiro.");
      input.focus();
      return;
    }
    const formatted = `[Sugestão de Prompt — EstudoIA]: ${val}`;
    copyText(formatted, "Sugestão copiada para compartilhar!");
    input.value = "";
  });
}

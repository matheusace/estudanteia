/* =========================================================
   EstudoIA — Lógica Minimalista & Navegação Limpa
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initAppearance();
  initCleanNavigation();
  initPromptGenerator();
  initPromptLibrary();
  initSimulator();
  initPomodoro();
  initFeynmanNote();
  initChecklist();
  initQuiz();
  initExtras();
});

/* ---------- Utilidades ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollToId = (id) => {
  const t = document.getElementById(id);
  if (t) t.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
};

/* ---------- Toast ---------- */
function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastId);
  window.__toastId = setTimeout(() => el.classList.remove("show"), 2500);
}

/* ---------- Copiar Texto ---------- */
async function copyText(text, feedback = "Copiado!") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast(feedback);
  } catch (e) {
    showToast("Selecione o texto e copie manualmente.");
  }
}

/* ---------- Tema Claro/Escuro & 3 Cores de Destaque ---------- */
function initAppearance() {
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");
  const accentBtns = document.querySelectorAll(".accent-dot");

  let prefs = { theme: root.getAttribute("data-theme") || "light", accent: "azul" };
  try {
    const saved = JSON.parse(store.get("estudoia_ui_v4") || "null");
    if (saved) prefs = { ...prefs, ...saved };
  } catch (e) {}

  function apply() {
    root.setAttribute("data-theme", prefs.theme);
    root.setAttribute("data-accent", prefs.accent);
    const dark = prefs.theme === "dark";
    sunIcon.style.display = dark ? "none" : "block";
    moonIcon.style.display = dark ? "block" : "none";

    accentBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.accent === prefs.accent);
    });
    store.set("estudoia_ui_v4", JSON.stringify(prefs));
  }

  themeBtn.addEventListener("click", () => {
    prefs.theme = prefs.theme === "dark" ? "light" : "dark";
    apply();
  });

  accentBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      prefs.accent = btn.dataset.accent;
      apply();
    });
  });

  apply();
}

/* ---------- Navegação e Links Limpos ---------- */
function initCleanNavigation() {
  const mobileBtn = document.getElementById("mobileMenuBtn");
  const nav = document.getElementById("mainNav");
  const navLinks = document.querySelectorAll("[data-nav]");

  mobileBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    mobileBtn.setAttribute("aria-expanded", String(open));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId && targetId.startsWith("#")) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
          const cleanHash = targetId === "#inicio" ? window.location.pathname + window.location.search : targetId;
          history.replaceState(null, "", cleanHash);
        }
      }
      nav.classList.remove("open");
      mobileBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Gerador de Prompt Socrático (qualquer tema) ---------- */
function initPromptGenerator() {
  const $ = (id) => document.getElementById(id);
  const subjectEl = $("genSubject");
  const levelEl = $("genLevel");
  const goalEl = $("genGoal");
  const topicEl = $("genTopic");
  const toneEl = $("genTone");
  const outputEl = $("generatedPromptText");
  const hintEl = $("promptHint");
  const copyBtn = $("copyGeneratedBtn");
  const KEY = "estudoia_gen_v5";

  const tones = {
    paciente: "Explique de forma clara, calma e com exemplos simples.",
    direto: "Seja curto, direto ao ponto e sem enrolação.",
    banca: "Cobre precisão nos conceitos, como em uma prova."
  };

  function build() {
    const subject = subjectEl.value.trim();
    const level = levelEl.value;
    const goal = goalEl.value;
    const topic = topicEl.value.trim() || "[ESCREVA AQUI O ASSUNTO OU A QUESTÃO]";
    const tone = tones[toneEl.value];
    const em = subject ? ` em ${subject}` : "";
    const de = subject ? ` de ${subject}` : "";
    const ctx = subject ? `${subject}, ${level}` : level;

    const prompts = {
      socratico: `Quero estudar "${topic}"${em} (${level}) pelo Método Socrático. ${tone} Não me dê um resumo pronto nem a resposta final de uma vez. Explique apenas a ideia inicial em até 4 linhas e me faça 1 pergunta curta para ver se entendi antes de seguir.`,
      plano: `Quero aprender "${topic}"${em} (${level}) do zero. ${tone} Monte um mapa com 5 etapas, da base até o avanço, em uma linha cada. Depois explique só a etapa 1 em até 4 linhas e me faça 1 pergunta antes de liberar a etapa 2.`,
      calculo: `Preciso resolver esta questão${de} (${level}): "${topic}". ${tone} Não entregue o resultado final nem a resolução completa. Primeiro me ajude a separar os dados do enunciado e me pergunte qual conceito ou método usar no primeiro passo.`,
      erro_conta: `Tentei resolver esta questão${de} (${level}): "${topic}". Minha resolução foi: [COLE AQUI SUA RESOLUÇÃO]. ${tone} Não entregue a resposta pronta: aponte apenas em qual passo meu raciocínio desviou e me dê uma pista para corrigir.`,
      questoes: `Crie 4 questões inéditas${de} (${level}) sobre "${topic}", da mais fácil para a mais difícil. ${tone} Não mostre o gabarito agora: envie só a Questão 1, espere minha resposta, comente meu raciocínio e só depois mande a próxima.`,
      feynman: `Vou testar o que aprendi sobre "${topic}"${em} (${level}) pela Técnica Feynman. Escrevi com minhas palavras: [COLE SEU RESUMO AQUI]. ${tone} Diga o que está certo, aponte o que ficou faltando e me faça 2 perguntas para completar meu entendimento.`,
      redacao: `Avalie meu texto (${ctx}) sobre "${topic}": [COLE SEU TEXTO AQUI]. ${tone} Regra principal: não reescreva nenhuma frase no meu lugar. Aponte apenas o que pode melhorar na tese, coesão ou argumentação e me faça perguntas para eu ajustar sozinho.`,
      revisao: `Estou revisando${em} (${level}) e preciso fixar "${topic}". ${tone} Monte uma revisão rápida em 3 partes curtas: (1) 3 pontos essenciais para não confundir, (2) erros comuns de quem estuda isso e (3) 2 perguntas para eu responder agora sem consultar o caderno.`
    };
    return prompts[goal];
  }

  function update() {
    const text = build();
    outputEl.innerHTML = esc(text).replace(/\[[^\]]+\]/g, (m) => `<mark>${m}</mark>`);
    const open = (text.match(/\[[^\]]+\]/g) || []).length;
    hintEl.textContent = open ? "Complete os trechos destacados antes de enviar." : "Pronto para copiar.";
    store.set(KEY, JSON.stringify({ s: subjectEl.value, l: levelEl.value, g: goalEl.value, t: topicEl.value, o: toneEl.value }));
  }

  try {
    const saved = JSON.parse(store.get(KEY) || "null");
    if (saved) {
      subjectEl.value = saved.s || "";
      topicEl.value = saved.t || "";
      if ([...levelEl.options].some((o) => o.value === saved.l)) levelEl.value = saved.l;
      if ([...goalEl.options].some((o) => o.value === saved.g)) goalEl.value = saved.g;
      if ([...toneEl.options].some((o) => o.value === saved.o)) toneEl.value = saved.o;
    }
  } catch (e) {}

  [levelEl, goalEl, toneEl].forEach((el) => el.addEventListener("change", update));
  [subjectEl, topicEl].forEach((el) => el.addEventListener("input", update));
  copyBtn.addEventListener("click", () => copyText(outputEl.textContent, "Comando copiado!"));
  document.querySelectorAll("[data-copy-open]").forEach((a) => {
    a.addEventListener("click", () => copyText(outputEl.textContent, "Comando copiado. Cole no chat."));
  });

  /* Usado pelo topo da página e pelo globo 3D */
  window.EstudoIA = {
    start(topic, subject) {
      if (typeof subject === "string") subjectEl.value = subject;
      if (typeof topic === "string" && topic.trim()) topicEl.value = topic.trim();
      update();
      scrollToId("gerador");
      if (!topicEl.value.trim()) {
        setTimeout(() => topicEl.focus({ preventScroll: true }), 500);
        showToast(subject ? `${subject}: agora escreva o assunto.` : "Escreva o assunto.");
      } else {
        showToast("Comando montado. Ajuste e copie.");
      }
    }
  };

  update();
}

/* ---------- Biblioteca Enxuta de 12 Modelos ---------- */
const MODELS = [
  {
    id: "m1",
    cat: "socratico",
    catName: "Entender Matéria",
    title: "Aprender um tema do zero por etapas",
    desc: "Evita textões longos e testa sua compreensão a cada passo.",
    text: "Quero entender [ASSUNTO] em [MATÉRIA] pelo Método Socrático. Explique apenas a base inicial em 3 linhas, dê um exemplo simples e me faça 1 pergunta curta antes de continuar."
  },
  {
    id: "m2",
    cat: "socratico",
    catName: "Entender Matéria",
    title: "Diferenciar dois conceitos parecidos",
    desc: "Ótimo para duplas que sempre caem em pegadinhas de prova.",
    text: "Sempre confundo [CONCEITO A] e [CONCEITO B] em [MATÉRIA]. Mostre só a diferença principal entre eles em poucas linhas e me dê 2 exemplos rápidos para eu classificar."
  },
  {
    id: "m3",
    cat: "exatas",
    catName: "Exatas",
    title: "Destravar exercício sem receber a conta",
    desc: "Ajuda você a interpretar o enunciado e montar o cálculo.",
    text: "Preciso resolver esta questão de [MATÉRIA]: [ENUNCIADO]. Não faça a conta nem dê o resultado. Me ajude a listar os dados e pergunte qual fórmula devemos usar primeiro."
  },
  {
    id: "m4",
    cat: "exatas",
    catName: "Exatas",
    title: "Descobrir onde errei na resolução",
    desc: "Localiza erros de sinal ou montagem sem entregar tudo.",
    text: "Tentei resolver: [ENUNCIADO]. Fiz assim: [SUA RESOLUÇÃO]. Não me dê a conta pronta: diga apenas em qual passo meu raciocínio desviou e me dê uma pista."
  },
  {
    id: "m5",
    cat: "exatas",
    catName: "Exatas",
    title: "Entender a lógica por trás de uma fórmula",
    desc: "Para não depender só de decoreba na hora da prova.",
    text: "Não quero só decorar a fórmula [FÓRMULA] em [MATÉRIA]. Me guie com 2 perguntas usando números pequenos para eu entender por que ela funciona assim."
  },
  {
    id: "m6",
    cat: "questoes",
    catName: "Questões",
    title: "Simulado rápido com gabarito oculto",
    desc: "Envia uma questão por vez e comenta sua escolha.",
    text: "Crie 4 questões inéditas no estilo [ENEM / VESTIBULAR] sobre [TEMA]. Mande só a Questão 1 sem gabarito. Depois que eu responder, comente e envie a Questão 2."
  },
  {
    id: "m7",
    cat: "questoes",
    catName: "Questões",
    title: "Entender por que errei uma alternativa",
    desc: "Mostra o distrator da questão que você marcou.",
    text: "Errei esta questão: [QUESTÃO E ALTERNATIVAS]. Marquei [SUA LETRA], mas o gabarito é [GABARITO]. Explique por que minha escolha está errada e qual pista do texto leva à certa."
  },
  {
    id: "m8",
    cat: "redacao",
    catName: "Redação",
    title: "Avaliar tese e argumentos sem plágio",
    desc: "Aponta melhorias estruturais sem escrever frases por você.",
    text: "Vou colar minha introdução sobre [TEMA]. Não reescreva nenhuma frase por mim. Diga apenas se a tese está clara e me faça 2 perguntas para fortalecer meus argumentos: [TEXTO]."
  },
  {
    id: "m9",
    cat: "redacao",
    catName: "Redação",
    title: "Checar coesão e repetições no parágrafo",
    desc: "Limpa vícios de linguagem mantendo sua própria escrita.",
    text: "Analise este parágrafo que escrevi e liste apenas palavras repetidas e trechos confusos, sem reescrever meu texto: [PARÁGRAFO]."
  },
  {
    id: "m10",
    cat: "revisao",
    catName: "Revisão",
    title: "Revisão pela Técnica Feynman",
    desc: "Você escreve o que lembra e a IA aponta as lacunas.",
    text: "Vou explicar com minhas palavras o que entendi sobre [TEMA]: [SUA EXPLICAÇÃO]. Aponte o que ficou certo, o que faltou e me faça 1 pergunta final."
  },
  {
    id: "m11",
    cat: "revisao",
    catName: "Revisão",
    title: "Plano enxuto antes da prova",
    desc: "Organiza tópicos acumulados em sessões curtas.",
    text: "Tenho prova de [MATÉRIA] em [N] dias sobre: [TÓPICOS]. Monte um roteiro prático de 30 minutos por dia misturando revisão ativa e exercícios."
  },
  {
    id: "m12",
    cat: "idiomas",
    catName: "Idiomas",
    title: "Conversa guiada em Inglês ou Espanhol",
    desc: "Pratica escrita com correção leve a cada resposta.",
    text: "Aja como tutor de [INGLÊS / ESPANHOL] nível [BÁSICO / INTERMEDIÁRIO]. Vamos conversar sobre [TEMA]. Faça 1 pergunta curta, corrija meus erros de forma simples e siga o papo."
  }
];

function initPromptLibrary() {
  const grid = document.getElementById("promptsGrid");
  const pills = document.querySelectorAll("#categoryFilters .tab-chip");
  const searchEl = document.getElementById("promptSearch");
  const favCountEl = document.getElementById("favCount");
  const saveCustomBtn = document.getElementById("saveCustomPromptBtn");

  let filter = "todos";
  let query = "";
  let savedIds = [];
  let customModels = [];

  try {
    savedIds = JSON.parse(store.get("estudoia_saved_v4") || "[]");
    customModels = JSON.parse(store.get("estudoia_custom_v4") || "[]");
  } catch (e) {}

  function persist() {
    store.set("estudoia_saved_v4", JSON.stringify(savedIds));
    store.set("estudoia_custom_v4", JSON.stringify(customModels));
    favCountEl.textContent = String(savedIds.length);
  }

  function allItems() {
    return [...customModels, ...MODELS];
  }

  saveCustomBtn.addEventListener("click", () => {
    const text = document.getElementById("generatedPromptText").textContent.trim();
    const subj = document.getElementById("genSubject").value;
    const topic = document.getElementById("genTopic").value.trim() || "Comando personalizado";
    if (customModels.some((c) => c.text === text)) { showToast("Esse comando já está salvo."); return; }
    const id = "c_" + Date.now();

    customModels.unshift({
      id,
      custom: true,
      cat: "socratico",
      catName: subj ? `Meu comando · ${subj}` : "Meu comando",
      title: topic,
      desc: "Criado no gerador acima.",
      text
    });
    savedIds.unshift(id);
    persist();
    render();
    showToast("Salvo na aba Salvos!");
  });

  function render() {
    favCountEl.textContent = String(savedIds.length);
    const allChip = document.querySelector('#categoryFilters [data-filter="todos"]');
    if (allChip) allChip.textContent = `Todos (${allItems().length})`;
    const list = allItems().filter((m) => {
      const isSaved = savedIds.includes(m.id);
      const matchCat = filter === "todos" || (filter === "favoritos" && isSaved) || m.cat === filter;
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.text.toLowerCase().includes(q) ||
        m.catName.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    if (!list.length) {
      grid.innerHTML = `<div class="model-card"><p class="model-desc">${
        filter === "favoritos"
          ? "Nada salvo ainda. Use Salvar em qualquer modelo ou no gerador acima."
          : "Nenhum modelo encontrado com essa palavra."
      }</p></div>`;
      return;
    }

    grid.innerHTML = list
      .map((m) => {
        const isSaved = savedIds.includes(m.id);
        return `
          <article class="model-card">
            <div>
              <div class="model-top">
                <span class="model-cat">${esc(m.catName)}</span>
                ${
                  m.custom
                    ? `<button type="button" class="star-btn" data-del-id="${m.id}">Excluir</button>`
                    : `<button type="button" class="star-btn ${isSaved ? "saved" : ""}" data-save-id="${m.id}">${isSaved ? "★ Salvo" : "☆ Salvar"}</button>`
                }
              </div>
              <h4>${esc(m.title)}</h4>
              <p class="model-desc">${esc(m.desc)}</p>
              <pre class="model-snippet">${esc(m.text)}</pre>
            </div>
            <div class="model-foot">
              <button type="button" class="btn btn-ghost btn-xs copy-model-btn" data-copy-id="${m.id}">Copiar</button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll(".copy-model-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = allItems().find((x) => x.id === btn.dataset.copyId);
        if (item) copyText(item.text, "Prompt copiado!");
      });
    });

    grid.querySelectorAll("[data-del-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delId;
        customModels = customModels.filter((x) => x.id !== id);
        savedIds = savedIds.filter((x) => x !== id);
        persist();
        render();
        showToast("Comando excluído.");
      });
    });

    grid.querySelectorAll("[data-save-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.saveId;
        if (savedIds.includes(id)) {
          savedIds = savedIds.filter((x) => x !== id);
          showToast("Removido dos salvos.");
        } else {
          savedIds.push(id);
          showToast("Prompt salvo!");
        }
        persist();
        render();
      });
    });
  }

  pills.forEach((p) => {
    p.addEventListener("click", () => {
      pills.forEach((x) => x.classList.remove("active"));
      p.classList.add("active");
      filter = p.dataset.filter;
      render();
    });
  });

  searchEl.addEventListener("input", (e) => {
    query = e.target.value.trim();
    render();
  });

  render();
}

/* ---------- Demonstração na Prática (EstudoIA vs. Pedido Comum) ---------- */
const DEMOS = {
  fisica: {
    title: "Física — Velocidade Média",
    comum: [
      {
        role: "student",
        who: "Pedido comum",
        text: "Um carro percorre 120 km em 2 horas. Qual sua velocidade média?"
      },
      {
        role: "ai",
        who: "Resposta direta da IA",
        bad: true,
        why: "O aluno só lê o número pronto (60 km/h) sem treinar a interpretação do enunciado.",
        text: "A velocidade média é calculada por Vm = ΔS / Δt = 120 / 2 = 60 km/h."
      }
    ],
    socratico: [
      {
        role: "student",
        who: "Estudante (com prompt EstudoIA)",
        text: "Preciso resolver: 'Um carro percorre 120 km em 2 horas. Qual sua velocidade média?' Não me dê a conta pronta, me guie."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Primeiro pede para identificar os dados no texto.",
        text: "Combinado! A velocidade média compara distância com tempo. Olhando o enunciado, quais são esses dois valores?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "120 km de distância e 2 horas de tempo."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Transforma a fórmula em raciocínio lógico antes de calcular.",
        text: "Isso. Se ele andou 120 km em 2 horas, quantos quilômetros percorreu em 1 hora? Qual conta você faz?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "120 dividido por 2 = 60 km/h."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Conecta a resposta do aluno à fórmula oficial.",
        text: "Exato: 60 km/h! Você acabou de deduzir e aplicar Vm = ΔS / Δt."
      }
    ]
  },
  matematica: {
    title: "Matemática — Equação do 2º Grau",
    comum: [
      {
        role: "student",
        who: "Pedido comum",
        text: "Resolva x² - 5x + 6 = 0 para mim."
      },
      {
        role: "ai",
        who: "Resposta direta da IA",
        bad: true,
        why: "Entrega Bhaskara pronta; na prova o aluno costuma errar o sinal de b = -5.",
        text: "Δ = (-5)² - 4·1·6 = 1. x = (5 ± 1) / 2 → x' = 3 e x'' = 2."
      }
    ],
    socratico: [
      {
        role: "student",
        who: "Estudante (com prompt EstudoIA)",
        text: "Me ajude a resolver x² - 5x + 6 = 0 passo a passo, sem fazer a conta por mim."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Garante a leitura correta dos sinais antes da fórmula.",
        text: "No modelo ax² + bx + c = 0, quanto valem a, b e c nessa equação?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "a = 1, b = -5 e c = 6."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Avança um degrau por vez (primeiro o Delta).",
        text: "Boa, manteve o sinal negativo do b! Agora calcule Δ = b² - 4·a·c. Quanto dá?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "25 - 24 = 1."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Deixa a etapa final na mão do estudante.",
        text: "Certinho, Δ = 1! Agora substitua na fórmula x = (-b ± √Δ) / 2a para achar as duas raízes."
      }
    ]
  },
  historia: {
    title: "História — Revolução Industrial",
    comum: [
      {
        role: "student",
        who: "Pedido comum",
        text: "Faça um resumo da Primeira Revolução Industrial."
      },
      {
        role: "ai",
        who: "Resposta direta da IA",
        bad: true,
        why: "Gera vários parágrafos passivos que o aluno apenas passa o olho.",
        text: "A Primeira Revolução Industrial iniciou-se na Inglaterra no século XVIII, marcada pela máquina a vapor, uso do carvão mineral, cercamentos e urbanização acelerada..."
      }
    ],
    socratico: [
      {
        role: "student",
        who: "Estudante (com prompt EstudoIA)",
        text: "Quero entender por que a Revolução Industrial começou na Inglaterra sem ler textão. Me pergunte aos poucos."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Ativa o que o estudante já sabe.",
        text: "Para mover as máquinas a vapor no século XVIII, as fábricas precisavam de combustível. Lembra qual recurso mineral abundante na Inglaterra alimentava as caldeiras?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "Petróleo?"
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Corrige o erro com uma pista em vez de dar a resposta.",
        text: "Quase! O petróleo entra forte só na 2ª fase. No século XVIII queimava-se uma rocha preta nas fornalhas. Qual mineral é esse?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "Carvão mineral! E tinha ferro também."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Consolida o conceito.",
        text: "Exato: carvão mineral e ferro! É por isso que a localização das jazidas pesou tanto."
      }
    ]
  },
  quimica: {
    title: "Química — Balanceamento",
    comum: [
      {
        role: "student",
        who: "Pedido comum",
        text: "Balanceie H₂ + O₂ → H₂O."
      },
      {
        role: "ai",
        who: "Resposta direta da IA",
        bad: true,
        why: "Entrega os coeficientes sem ensinar a contar átomos.",
        text: "A equação balanceada é: 2 H₂ + O₂ → 2 H₂O."
      }
    ],
    socratico: [
      {
        role: "student",
        who: "Estudante (com prompt EstudoIA)",
        text: "Me ajude a balancear H₂ + O₂ → H₂O sem dar a resposta."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Ensina a contar reagentes primeiro.",
        text: "Vamos contar os átomos antes da seta: quantos de Hidrogênio (H) e de Oxigênio (O) existem nos reagentes?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "2 de H e 2 de O."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Mostra o desequilíbrio nos produtos.",
        text: "No produto (H₂O) temos 2 H, mas só 1 O. Qual número colocamos na frente do H₂O para igualar os 2 Oxigênios?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "2 H₂O! Mas aí ficam 4 Hidrogênios na direita."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Deixa o ajuste final para o estudante.",
        text: "Perfeito! Agora qual coeficiente você coloca na frente do H₂ na esquerda para também ter 4 Hidrogênios?"
      }
    ]
  },
  redacao: {
    title: "Redação — Melhorando a Tese",
    comum: [
      {
        role: "student",
        who: "Pedido comum",
        text: "Reescreva melhor minha frase: 'Hoje em dia a internet atrapalha os jovens na escola.'"
      },
      {
        role: "ai",
        who: "Resposta direta da IA",
        bad: true,
        why: "A IA escreve no lugar do aluno, tirando sua prática de autoria.",
        text: "Na contemporaneidade, o uso exacerbado das redes digitais compromete o rendimento acadêmico..."
      }
    ],
    socratico: [
      {
        role: "student",
        who: "Estudante (com prompt EstudoIA)",
        text: "Avalie minha frase sem reescrever por mim: 'Hoje em dia a internet atrapalha os jovens na escola.'"
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Aponta o problema sem roubar o texto.",
        text: "'Hoje em dia' é informal e 'atrapalha' ficou genérico. De que forma concreta o uso sem orientação prejudica o estudo?"
      },
      {
        role: "student",
        who: "Estudante",
        text: "Tira a concentração na aula e acostuma o aluno a copiar respostas prontas."
      },
      {
        role: "ai",
        who: "Tutor IA",
        why: "Devolve a escrita para o próprio estudante.",
        text: "Ótimo! Agora tente reescrever você mesmo sua frase incluindo essas duas causas que você levantou."
      }
    ]
  }
};

function initSimulator() {
  const subjBtns = document.querySelectorAll("#simSubjectPills .tab-chip");
  const modeBtns = document.querySelectorAll(".switch-btn");
  const titleEl = document.getElementById("simTitle");
  const stepEl = document.getElementById("simStepIndicator");
  const feedEl = document.getElementById("simMessages");
  const nextBtn = document.getElementById("simNextBtn");
  const showAllBtn = document.getElementById("simShowAllBtn");
  const resetBtn = document.getElementById("simResetBtn");
  const bottomBar = document.getElementById("simBottomBar");

  let subj = "fisica";
  let mode = "socratico";
  let shown = 2;

  function render() {
    const data = DEMOS[subj];
    const turns = data[mode];
    const total = turns.length;
    if (shown > total) shown = total;

    titleEl.textContent = data.title;
    stepEl.textContent = mode === "comum" ? "Comparação direta" : `Passo ${shown} de ${total}`;

    feedEl.innerHTML = turns
      .slice(0, shown)
      .map(
        (t) => `
        <div class="bubble ${t.role} ${t.bad ? "bad-example" : ""}">
          <span class="bubble-who">${t.who}</span>
          <div>${t.text}</div>
          ${t.why ? `<span class="bubble-why">${t.why}</span>` : ""}
        </div>
      `
      )
      .join("");

    bottomBar.style.display = mode === "comum" ? "none" : "flex";
    showAllBtn.style.display = mode === "comum" ? "none" : "inline-flex";

    if (shown >= total) {
      nextBtn.disabled = true;
      nextBtn.textContent = "Fim do exemplo";
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = "Próximo passo →";
    }
  }

  subjBtns.forEach((b) => {
    b.addEventListener("click", () => {
      subjBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      subj = b.dataset.scenario;
      shown = 2;
      render();
    });
  });

  modeBtns.forEach((b) => {
    b.addEventListener("click", () => {
      modeBtns.forEach((x) => {
        x.classList.remove("active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("active");
      b.setAttribute("aria-selected", "true");
      mode = b.dataset.demoMode;
      shown = mode === "comum" ? DEMOS[subj].comum.length : 2;
      render();
    });
  });

  nextBtn.addEventListener("click", () => {
    const total = DEMOS[subj][mode].length;
    if (shown < total) {
      shown += 1;
      render();
    }
  });

  showAllBtn.addEventListener("click", () => {
    shown = DEMOS[subj][mode].length;
    render();
  });

  resetBtn.addEventListener("click", () => {
    shown = mode === "comum" ? DEMOS[subj].comum.length : 2;
    render();
  });

  render();
}

/* ---------- Pomodoro (por horário real, não perde tempo em aba oculta) ---------- */
function initPomodoro() {
  const modeBtns = document.querySelectorAll(".tmode-btn");
  const labelEl = document.getElementById("timerModeLabel");
  const displayEl = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("timerStartBtn");
  const pauseBtn = document.getElementById("timerPauseBtn");
  const resetBtn = document.getElementById("timerResetBtn");
  const cyclesEl = document.getElementById("pomodoroCycles");
  const taskInput = document.getElementById("focusTaskInput");
  const ring = document.getElementById("ringFg");
  const RING = 2 * Math.PI * 54;
  const KEY = "estudoia_cycles_v5";
  const baseTitle = document.title;
  const today = () => new Date().toLocaleDateString("sv-SE");

  let label = "Foco";
  let total = 25 * 60;
  let remaining = total;
  let endAt = 0;
  let timer = null;
  let stat = { day: today(), n: 0 };
  try {
    const saved = JSON.parse(store.get(KEY) || "null");
    if (saved && saved.day === today()) stat = saved;
  } catch (e) {}

  taskInput.value = store.get("estudoia_task_v4") || "";
  taskInput.addEventListener("input", () => store.set("estudoia_task_v4", taskInput.value));

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  function draw() {
    displayEl.textContent = fmt(remaining);
    ring.style.strokeDasharray = RING;
    ring.style.strokeDashoffset = RING * (1 - remaining / total);
    cyclesEl.textContent = `${stat.n} ${stat.n === 1 ? "ciclo" : "ciclos"} hoje`;
    document.title = timer ? `${fmt(remaining)} · ${baseTitle}` : baseTitle;
  }

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const c = new Ctx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.value = 660;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.7);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.75);
    } catch (e) {}
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function tick() {
    remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    if (remaining > 0) return draw();
    stop();
    if (label === "Foco") {
      stat.n += 1;
      store.set(KEY, JSON.stringify(stat));
      showToast("Ciclo concluído. Feche o chat e escreva o que lembra.");
    } else {
      showToast("Pausa encerrada. Hora de voltar.");
    }
    beep();
    remaining = total;
    draw();
  }

  startBtn.addEventListener("click", () => {
    if (timer) return;
    endAt = Date.now() + remaining * 1000;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timer = setInterval(tick, 250);
    draw();
  });

  pauseBtn.addEventListener("click", () => {
    tick();
    stop();
    draw();
    showToast("Pausado.");
  });

  resetBtn.addEventListener("click", () => {
    stop();
    remaining = total;
    draw();
  });

  modeBtns.forEach((b) => {
    b.addEventListener("click", () => {
      stop();
      modeBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      label = b.dataset.label;
      total = parseInt(b.dataset.minutes, 10) * 60;
      remaining = total;
      labelEl.textContent = label;
      draw();
    });
  });

  draw();
}

/* ---------- Folha Feynman ---------- */
function initFeynmanNote() {
  const titleEl = document.getElementById("noteTopicInput");
  const bodyEl = document.getElementById("noteContentInput");
  const countEl = document.getElementById("noteWordCount");
  const clearBtn = document.getElementById("clearNoteBtn");
  const copyBtn = document.getElementById("copyNoteBtn");
  const dlBtn = document.getElementById("downloadNoteBtn");

  try {
    const saved = JSON.parse(store.get("estudoia_note_v4") || "null");
    if (saved) {
      titleEl.value = saved.title || "";
      bodyEl.value = saved.body || "";
    }
  } catch (e) {}

  function save() {
    const txt = bodyEl.value.trim();
    const words = txt ? txt.split(/\s+/).length : 0;
    countEl.textContent = words === 1 ? "1 palavra" : `${words} palavras`;
    store.set("estudoia_note_v4", JSON.stringify({ title: titleEl.value, body: bodyEl.value }));
  }

  const statusEl = document.getElementById("noteSaveStatus");
  const onInput = () => {
    save();
    statusEl.textContent = "Salva às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  titleEl.addEventListener("input", onInput);
  bodyEl.addEventListener("input", onInput);

  clearBtn.addEventListener("click", () => {
    titleEl.value = "";
    bodyEl.value = "";
    save();
    showToast("Folha limpa.");
  });

  copyBtn.addEventListener("click", () => {
    if (!bodyEl.value.trim()) {
      showToast("Escreva algo antes de copiar.");
      return;
    }
    copyText(`${titleEl.value.trim() || "Resumo EstudoIA"}\n\n${bodyEl.value.trim()}`, "Resumo copiado!");
  });

  dlBtn.addEventListener("click", () => {
    if (!bodyEl.value.trim()) {
      showToast("Escreva algo antes de baixar.");
      return;
    }
    const title = titleEl.value.trim() || "Resumo EstudoIA";
    const content = `ESTUDOIA — RESUMO (TÉCNICA FEYNMAN)\nAssunto: ${title}\nData: ${new Date().toLocaleDateString("pt-BR")}\n----------------------------------------\n\n${bodyEl.value.trim()}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "resumo"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Arquivo .txt baixado!");
  });

  save();
}

/* ---------- Checklist ---------- */
function initChecklist() {
  const boxes = document.querySelectorAll(".verify-check");
  const statusEl = document.getElementById("checklistStatus");

  boxes.forEach((box) => {
    box.addEventListener("change", () => {
      const count = Array.from(boxes).filter((b) => b.checked).length;
      statusEl.textContent = count === boxes.length ? "Tudo checado. Agora sim dá para usar o material." : `${count} de ${boxes.length} itens verificados.`;
    });
  });
}

/* ---------- Quiz Caça-Erros (8 por rodada, ordem embaralhada) ---------- */
const QUIZ = [
  {
    subject: "História do Brasil",
    statement: "\"A Independência do Brasil foi proclamada em 7 de setembro de 1822, às margens do rio Ipiranga.\"",
    ok: true,
    info: "Correto. Data e local exatos."
  },
  {
    subject: "Matemática",
    statement: "\"Resolvendo 2x + 6 = 14: temos 2x = 8 e, dividindo por 2, chegamos em x = 6.\"",
    ok: false,
    info: "Erro de cálculo: 8 dividido por 2 é 4, não 6. Sempre refaça as contas."
  },
  {
    subject: "Literatura",
    statement: "\"O livro Dom Casmurro (1899) foi escrito por José de Alencar.\"",
    ok: false,
    info: "Invenção: o autor de Dom Casmurro é Machado de Assis."
  },
  {
    subject: "Biologia",
    statement: "\"Na fotossíntese, a planta usa CO₂, água e energia luminosa para produzir glicose e liberar O₂.\"",
    ok: true,
    info: "Correto. Processo descrito sem erros."
  },
  {
    subject: "Redação",
    statement: "\"Como escreveu Sócrates em seu livro 'A República Moderna': 'A internet exige sabedoria'.\"",
    ok: false,
    info: "Alucinação: Sócrates não deixou livros escritos e nunca falou de internet."
  },
  {
    subject: "Geografia",
    statement: "\"O bioma Caatinga é exclusivamente brasileiro e fica na região Sul do Brasil.\"",
    ok: false,
    info: "Erro: a Caatinga fica no Nordeste brasileiro (clima semiárido)."
  },
  {
    subject: "Álgebra",
    statement: "\"Calculando (-3)² - 4·(1)·(-2), obtemos 9 - 8 = 1.\"",
    ok: false,
    info: "Erro de sinal: -4 · 1 · (-2) = +8. Portanto, 9 + 8 = 17."
  },
  {
    subject: "Química",
    statement: "\"A molécula de água (H₂O) possui dois átomos de hidrogênio e um de oxigênio.\"",
    ok: true,
    info: "Correto. Fórmula e composição certas."
  },
  {
    subject: "História",
    statement: "\"A Revolução Francesa começou em 1789 com a Tomada da Bastilha, em Paris.\"",
    ok: true,
    info: "Correto. 14 de julho de 1789 é a data simbólica do início."
  },
  {
    subject: "Geografia",
    statement: "\"A capital da Austrália é Sydney, a maior cidade do país.\"",
    ok: false,
    info: "Erro clássico: a capital é Canberra. Sydney é a cidade mais populosa."
  },
  {
    subject: "Geometria",
    statement: "\"A área de um círculo de raio r é calculada por 2πr.\"",
    ok: false,
    info: "Confusão de fórmulas: 2πr é o comprimento da circunferência. A área é πr²."
  },
  {
    subject: "Programação",
    statement: "\"Em Python, len('casa') retorna 4.\"",
    ok: true,
    info: "Correto. A palavra tem 4 caracteres."
  }
];

const ROUND_SIZE = 8;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initQuiz() {
  const scoreEl = document.getElementById("quizScore");
  const subjEl = document.getElementById("quizSubject");
  const stmtEl = document.getElementById("quizStatement");
  const btns = document.querySelectorAll(".quiz-choice");
  const fbEl = document.getElementById("quizFeedback");
  const progEl = document.getElementById("quizProgress");
  const nextBtn = document.getElementById("quizNextBtn");

  let round = shuffle(QUIZ).slice(0, ROUND_SIZE);
  let idx = 0;
  let score = 0;
  let locked = false;

  function draw() {
    const q = round[idx];
    locked = false;
    subjEl.textContent = q.subject;
    stmtEl.textContent = q.statement;
    progEl.textContent = `${idx + 1} de ${round.length}`;
    scoreEl.textContent = `${score} / ${round.length} acertos`;
    fbEl.hidden = true;
    nextBtn.hidden = true;
    btns.forEach((b) => (b.disabled = false));
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (locked) return;
      locked = true;
      const q = round[idx];
      const right = (btn.dataset.answer === "true") === q.ok;
      if (right) score += 1;
      scoreEl.textContent = `${score} / ${round.length} acertos`;

      const last = idx === round.length - 1;
      fbEl.className = `quiz-result ${right ? "ok" : "err"}`;
      fbEl.innerHTML = `<strong>${right ? "Acertou." : "Pegadinha."}</strong> ${q.info}${last ? ` <br><strong>Rodada final: ${score} de ${round.length}.</strong>` : ""}`;
      fbEl.hidden = false;

      btns.forEach((b) => (b.disabled = true));
      nextBtn.textContent = last ? "Nova rodada" : "Próxima";
      nextBtn.hidden = false;
      nextBtn.focus();
    });
  });

  nextBtn.addEventListener("click", () => {
    if (idx < round.length - 1) {
      idx += 1;
    } else {
      round = shuffle(QUIZ).slice(0, ROUND_SIZE);
      idx = 0;
      score = 0;
    }
    draw();
  });

  draw();
}

/* ---------- Topo, navegação ativa e atalhos ---------- */
function initExtras() {
  const form = document.getElementById("heroForm");
  const input = document.getElementById("heroTopic");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) {
      input.focus();
      showToast("Escreva um assunto para começar.");
      return;
    }
    window.EstudoIA.start(t);
  });

  document.querySelectorAll("[data-suggest]").forEach((b) => {
    b.addEventListener("click", () => {
      input.value = b.dataset.suggest;
      window.EstudoIA.start(b.dataset.suggest, b.dataset.subject);
    });
  });

  const links = [...document.querySelectorAll(".main-nav a")];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  links.forEach((l) => {
    const sec = document.querySelector(l.getAttribute("href"));
    if (sec) io.observe(sec);
  });

  const nav = document.getElementById("mainNav");
  const btn = document.getElementById("mobileMenuBtn");
  const closeMenu = () => {
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  };
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });
}

# EstudoIA

Plataforma web de estudo ativo com Inteligência Artificial, baseada no **Método Socrático** e na **Técnica Feynman**. Funciona para qualquer assunto: você escreve o tema e o site monta um comando que faz a IA ensinar por perguntas, sem entregar a resposta pronta.

**Autor:** Matheus Godoy

## Como funciona

1. **Gerador de comando:** assunto livre, matéria livre (com sugestões), nível, objetivo e estilo de tutoria. Inclui plano de estudo do zero, resolução guiada, correção de erros, treino de questões, Feynman, redação e revisão. O topo da página e o globo 3D já preenchem o gerador.
2. **Na prática:** simulador que compara um pedido comum (cola pronta) com uma tutoria socrática passo a passo.
3. **Mesa de estudo:** cronômetro Pomodoro (conta pelo relógio, mesmo com a aba em segundo plano) e folha de resumo salva no aparelho, exportável em `.txt`.
4. **Senso crítico:** checklist de verificação e teste com 8 afirmações sorteadas entre 12 para pegar erros e invenções da IA.

## Arquivos

- `index.html`, `styles.css`, `script.js`, `globe.js`: site estático completo, sem bibliotecas. O globo 3D usa Canvas 2D com projeção em perspectiva (respeita "reduzir movimento").
- `vercel.json` e `netlify.toml`: publicação com URLs limpas.

Dados (resumo, comandos salvos, preferências) ficam só no navegador, via `localStorage`.

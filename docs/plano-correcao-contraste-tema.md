# Plano de correção — tokens de tema e contraste (claro/escuro)

> Documento autossuficiente. Não depende de contexto externo. Objetivo: eliminar
> falhas de contraste (WCAG AA) e usos de cor que furam o sistema de tokens, sem
> reescrever o sistema de temas (que está correto).

## 1. Contexto: como o tema funciona neste projeto

O app tem **dois temas**, "claro" e "escuro", alternáveis pelo drawer de Preferências
(toque no avatar no cabeçalho → seção "Tema").

Há **duas fontes de verdade** que precisam ficar em sincronia:

1. **`src/index.css`**, bloco `@theme { … }` — define os tokens `--color-*` e é o que
   o Tailwind v4 usa para **gerar as utilities** (`text-perigo`, `bg-superficie`, etc.).
   Os valores aqui são também o **tema claro** padrão (fallback antes do JS rodar).
2. **`src/application/state/tema.state.ts`** — exporta `TEMA_CLARO` e `TEMA_ESCURO`,
   cada um com o **mesmo conjunto de tokens**. Em runtime, `TemaManager.aplicarTema()`
   escreve essas variáveis **inline** em `document.documentElement` e seta
   `data-tema="claro|escuro"`.

Consequências importantes para este plano:

- Uma utility só existe se o token estiver no `@theme`. **`text-perigo` / `bg-perigo` /
  `border-perigo` existem** (há `--color-perigo`). **`text-error` / `bg-error` /
  `border-error` NÃO existem** (não há `--color-error`) → essas classes são **no-op
  silencioso**: não aplicam cor nenhuma.
- Para mudar um valor do **tema claro**, é preciso editar **os dois lugares**
  (`index.css @theme` **e** `TEMA_CLARO`). Para o **tema escuro**, só `TEMA_ESCURO`.

## 2. Problemas a corrigir (com contraste medido)

Razões WCAG medidas convertendo OKLCH→sRGB→luminância. Limite AA: **4.5** para texto
normal (inclui `text-xs`/12px), **3.0** para componentes de UI.

| Tema | Par (frente / fundo) | Razão atual | Limite | Causa |
|------|----------------------|:-----------:|:------:|-------|
| Escuro | `#fff` / acento (pill "ATIVO") | **1.39** ❌ | 4.5 | `text-white` hardcoded; no escuro o acento vira creme |
| Escuro | perigo / superfície (texto "Excluir") | **3.55** ❌ | 4.5 | `--color-perigo` do escuro escuro demais |
| Escuro | perigo / fundo | **4.02** ❌ | 4.5 | idem |
| Claro | texto-sutil / fundo | **4.43** ❌ | 4.5 | `--color-texto-sutil` do claro claro demais |
| Claro | texto-sutil / acento-suave | **4.04** ❌ | 4.5 | idem |

Além disso: **toda** ação destrutiva (`Excluir`, ícone lixeira) e **toda** mensagem de
erro de formulário usam `text-error`/`bg-error`/`border-error` → estão **sem cor**
(saem na cor herdada), em ambos os temas.

**Fora de escopo / deixar como está:** borda/superfície tem razão baixa (1.32 claro /
2.20 escuro), mas bordas de card são **decorativas** (não são "objeto requerido para
entender"), então não contam como falha de usabilidade. Não alterar.

## 3. Mudanças

### Tier 1 — Componentes que furam os tokens

**1.1 — Substituir o token fantasma `error` por `perigo` (find/replace global em `src/`):**

- `text-error` → `text-perigo`
- `bg-error/10` → `bg-perigo/10`
- `border-error` → `border-perigo`

(Como `hover:text-error` contém `text-error`, o replace de substring cobre os prefixos
`hover:`.) Arquivos esperados (verificar que nenhum `error` sobrou):

- `src/interface/page/area-logada/gerenciar/GerenciarPage.tsx` (3 ocorrências: botões "Excluir" e ícone lixeira)
- `src/interface/widget/formulario/Input.tsx` (3: `border-error` da borda de erro + 2 `text-error` das mensagens)
- `src/interface/page/area-logada/gerenciar/EditorFichaPage.tsx` (4: `hover:text-error`)

**1.2 — Branco puro sobre acento → token `texto-invertido`** (corrige o pill: 1.39 → ~13.6):

- `GerenciarPage.tsx`, pill "ATIVO": no `<span>` com `bg-acento text-white text-xs font-semibold rounded-full`, trocar `text-white` → `text-texto-invertido`.
- `EditorFichaPage.tsx`, chip selecionado: no trecho `"bg-acento text-white scale-110 shadow-sm"`, trocar `text-white` → `text-texto-invertido`.

**1.3 — Knob do toggle `bg-white` → `bg-superficie`** (no escuro a trilha é creme e o knob branco somia):

- `GerenciarPage.tsx`: `<div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white …">` → `bg-superficie`.
- `EditorProgramaPage.tsx`: `<div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white …">` → `bg-superficie`.

> Não fazer replace cego de `text-white`/`bg-white`: o `Toast.tsx` usa `hover:bg-white/10`
> de propósito (toast sempre escuro). Mexer só nos pontos listados acima.

### Tier 2 — Ajuste de valor de token (medido)

**2.1 — `--color-perigo` no TEMA ESCURO:** `oklch(0.565 0.105 35)` → **`oklch(0.640 0.105 35)`**
(em `tema.state.ts`, dentro de `TEMA_ESCURO`).
Resultado medido: perigo/superfície **3.55 → 4.87** ✓, perigo/fundo **4.02 → 5.50** ✓,
texto-invertido sobre perigo (texto de botão destrutivo) **5.39** ✓.

Ajustar também, no mesmo `TEMA_ESCURO`:
- `--color-perigo-hover`: `oklch(0.625 0.110 35)` → **`oklch(0.700 0.105 35)`** (no escuro o hover deve ser **mais claro** que a base).

> Importante: botão destrutivo deve usar `text-texto-invertido` sobre `bg-perigo`
> (dá 5.39). **Não** usar `text-white` sobre perigo (cai para ~3.5). Conferir o
> `ModalConfirmacao` (variante "perigo") e qualquer botão com `bg-perigo`.

**2.2 — `--color-texto-sutil` no TEMA CLARO:** `oklch(0.550 0.015 55)` → **`oklch(0.510 0.015 55)`**.
Resultado medido: texto-sutil/fundo **4.43 → 5.23** ✓, texto-sutil/acento-suave **4.04 → 4.77** ✓
(continua distinto do `texto-secundario` que é 0.450).
Editar **nos dois lugares**:
- `src/index.css`, bloco `@theme`: linha `--color-texto-sutil: oklch(0.550 0.015 55);`
- `src/application/state/tema.state.ts`, `TEMA_CLARO`: `"--color-texto-sutil": "oklch(0.550 0.015 55)"`

> Não alterar `texto-sutil` no escuro (lá já passa com 7.2:1).

### Tier 3 — Consistência (opcional, não bloqueia)

- **`color-scheme` por tema**: em `TemaManager.aplicarTema()` (`tema.state.ts`), após setar
  `data-tema`, adicionar `root.style.colorScheme = tema.id === "escuro" ? "dark" : "light";`
  (alinha scrollbars, inputs nativos e autofill ao tema).
- **Tokenizar âmbar hardcoded** da chama/streak (`StripSemanal.tsx`, `DetalheSequenciaPage.tsx`,
  `StreakCounter.tsx`) — hoje usam `oklch(...)` literais que não adaptam ao tema. Criar
  `--color-chama` / `--color-chama-suave` nos 3 lugares (@theme + TEMA_CLARO + TEMA_ESCURO).
- **Toast** (`Toast.tsx`) usa hex fixos (#4ade80, #1a472a…) — "toast sempre escuro"
  proposital, mas foge dos tokens. Baixa prioridade.

## 4. Verificação

### 4.1 Script de contraste (rodar no console do preview, em cada tema)

Lê os tokens **realmente aplicados** no `:root` e checa os pares críticos. Deve
imprimir tudo "OK" depois das mudanças.

```js
(() => {
  const root = getComputedStyle(document.documentElement);
  const v = n => root.getPropertyValue(n).trim();
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const ctx = cv.getContext('2d');
  const toRGB = c => { ctx.fillStyle='#000'; ctx.fillStyle=c; ctx.fillRect(0,0,1,1); const d=ctx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2]]; };
  const lin = x => { x/=255; return x<=0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055,2.4); };
  const lum = r => 0.2126*lin(r[0])+0.7152*lin(r[1])+0.0722*lin(r[2]);
  const ratio = (a,b)=>{ const x=lum(toRGB(a)),y=lum(toRGB(b)); const h=Math.max(x,y),l=Math.min(x,y); return +((h+0.05)/(l+0.05)).toFixed(2); };
  const pairs = [
    ['--color-texto-primario','--color-fundo',4.5],
    ['--color-texto-primario','--color-superficie',4.5],
    ['--color-texto-secundario','--color-superficie',4.5],
    ['--color-texto-sutil','--color-superficie',4.5],
    ['--color-texto-sutil','--color-fundo',4.5],
    ['--color-texto-sutil','--color-acento-suave',4.5],
    ['--color-texto-invertido','--color-acento',4.5],   // texto de botão/pill primário
    ['--color-texto-invertido','--color-perigo',4.5],   // texto de botão destrutivo
    ['--color-perigo','--color-superficie',4.5],         // texto "Excluir" em card
    ['--color-perigo','--color-fundo',4.5],
  ];
  const tema = document.documentElement.getAttribute('data-tema');
  console.table(pairs.map(([fg,bg,thr]) => {
    const r = ratio(v(fg), v(bg));
    return { tema, par: `${fg} / ${bg}`, ratio: r, limite: thr, status: r >= thr ? 'OK' : 'FALHA' };
  }));
})();
```

Alternar tema para testar os dois: no console, `localStorage.setItem('trainify_tema','escuro')`
(ou `'claro'`) e recarregar; ou usar o drawer de Preferências (avatar → Tema). A chave
de storage é `trainify_tema`.

**Critério:** todos os pares com `status: OK` nos dois temas.

### 4.2 Verificação visual

Para ver a tela Gerenciar com um programa ativo (mostra o pill "ATIVO" e os botões
Editar/Excluir), semear dados no console e ir para `#/gerenciar`:

```js
localStorage.setItem("trainify_dados_treino", JSON.stringify({
  programas:[{id:"p1",nome:"Treino semanal",descricao:"Exemplo",fichaIds:["f1"],ativo:true}],
  fichas:[{id:"f1",nome:"Treino A",descricao:"",icone:"halter",emoji:"💪",exercicios:[{exercicioId:"ex-01",series:3,repeticoes:10,usaCarga:true,descansoSegundos:60}],cardio:[]}],
  historico:[],exerciciosCustom:[],atualizadoEm:new Date().toISOString()
})); location.hash="#/gerenciar"; location.reload();
```

Conferir nos **dois temas**:
- Pill "ATIVO" — texto legível (não branco-sobre-creme no escuro).
- Botão "Excluir" e ícone de lixeira — claramente em vermelho/perigo, distinto de "Editar".
- Mensagem de erro de formulário (ex.: criar exercício sem nome) — texto vermelho visível.

> Limpar os dados de teste ao final: `localStorage.removeItem('trainify_dados_treino'); location.reload();`

## 5. Critérios de aceite

- [ ] Nenhuma ocorrência de `text-error` / `bg-error` / `border-error` em `src/`.
- [ ] Pill "ATIVO" e chip selecionado usam `text-texto-invertido` (não `text-white`).
- [ ] Knobs de toggle usam `bg-superficie` (não `bg-white`).
- [ ] `TEMA_ESCURO`: `--color-perigo` = `oklch(0.640 0.105 35)`, `--color-perigo-hover` = `oklch(0.700 0.105 35)`.
- [ ] `--color-texto-sutil` (claro) = `oklch(0.510 0.015 55)` em **index.css `@theme`** e em **`TEMA_CLARO`**.
- [ ] Script 4.1 imprime todos os pares "OK" nos temas claro **e** escuro.
- [ ] Verificação visual 4.2 ok nos dois temas.
- [ ] `npm run build` (ou typecheck/lint do projeto) sem novos erros.
```

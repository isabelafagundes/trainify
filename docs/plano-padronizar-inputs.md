# Plano: padronizar e componentizar os inputs

## Diagnóstico: existem duas "receitas" de input no código

O app tem dois estilos de campo que nunca foram unificados, além de vários
`<input>` crus copiados à mão.

**Receita A — "plana", sem contraste** → `Input.tsx`
```
bg-superficie · border-borda · rounded-[10px] · px-4 py-3 · text-base
```
O `bg-superficie` é o mesmo tom do card que envolve o campo → o input "some" no
fundo. É o look da tela de gerenciar programa (Nome / Descrição).

**Receita B — "caixa preenchida", com contraste** → `CLASSES_CAMPO_CAIXA`
(`CampoNumerico.tsx`)
```
bg-superficie-suave · border-borda · rounded-[10px] · h-10 · text-center font-semibold
```
O `bg-superficie-suave` é um tom mais escuro que o card → destaca. É o look da
tela de execução (Duração / Distância / séries).

**Causa raiz:** o `design-system.md §7.12` documenta o input oficial como
`bg-superficie` — ou seja, o padrão escrito é o de baixo contraste. Por isso todo
campo "de formulário" nasceu plano, e só os campos numéricos da execução ganharam
o tom bom.

### Inventário completo dos campos

| Onde | Componente/estilo | Fundo | Contraste |
|---|---|---|---|
| EditorPrograma — Nome, Descrição | `<Input>` | `superficie` | ❌ plano |
| EditorFicha — Nome, Descrição, nota cardio | `<Input>` | `superficie` | ❌ plano |
| ModalCriarExercicio — Nome, grupo custom | `<Input>` | `superficie` | ❌ plano |
| FormularioPerfil — nome | `<Input>` | `superficie` | ❌ plano |
| Execução — séries/reps/descanso, cardio | `CampoNumerico`/`CLASSES_CAMPO_CAIXA` | `superficie-suave` | ✅ bom |
| Busca — PickerExercicios, GerenciarPage | `<input>` cru | `superficie` | ❌ plano |
| Busca — ModalCopiarPrograma, ModalCopiarFicha | `<input>` cru | `superficie-suave` | ✅ bom |
| NotaExercicio textarea | `<textarea>` cru | `superficie-suave` | ✅ mas `rounded-[8px]`/`text-sm` (diverge) |
| ModalCriarExercicio `<select>` | `<select>` cru | `superficie-suave` | ✅ bom |

As 4 barras de busca discordam entre si (duas `superficie`, duas
`superficie-suave`), e os estilos de foco variam (umas usam `ring-acento/20`,
outras só `border-acento`, o textarea usa `outline`).

---

## Objetivo

Um único componente `Campo` como fonte de verdade. Todas as variantes partilham
**tom de contraste (`superficie-suave`), borda, raio e foco** — mudança de estilo
passa a acontecer em um lugar só. As variantes existem só para formatos
genuinamente diferentes (texto longo, número compacto, busca), não para estilos
divergentes.

**Decisão de escopo:** um componente + variantes (não padronização estrita que
forçaria caixa numérica e texto longo a ficarem idênticos).

### Correção central

`bg-superficie` → `bg-superficie-suave` no campo canônico. É isso que dá o
contraste da tela de execução para todos os formulários.

---

## Etapas

### Etapa 1 — Tokens compartilhados

`src/interface/widget/formulario/campo.tokens.ts`:
```
CAMPO_BASE = bg-superficie-suave · border-borda · rounded-[10px]
           · focus:border-acento focus:ring-2 focus:ring-acento/20
           · placeholder:text-texto-sutil · disabled:opacity-40
```
Toda variante importa daqui.

### Etapa 2 — `Input.tsx` vira o componente canônico com variantes

| Variante | Formato | Específico dela |
|---|---|---|
| `texto` | linha única | `px-4 py-3 text-base`, alinhado à esquerda |
| `textarea` | multilinha | `rows`, `resize-none` |
| `busca` | linha + lupa | slot de ícone à esquerda, botão limpar |
| `select` | dropdown | `appearance-none` + chevron |
| `caixa` | número compacto | `h-10 text-center font-semibold tabular-nums` |

Todas herdam `CAMPO_BASE`. A variante `caixa` reconcilia o atual
`CLASSES_CAMPO_CAIXA` — que passa a importar a base em vez de redefinir
bg/borda/raio/foco.

### Etapa 3 — Migração campo a campo

- **Planos → contraste:** EditorPrograma (`EditorProgramaPage.tsx:160`),
  EditorFicha (`EditorFichaPage.tsx:512`), ModalCriarExercicio
  (`ModalCriarExercicio.tsx:133`), FormularioPerfil (`FormularioPerfil.tsx:44`) —
  ganham contraste automaticamente ao usar o `Input` corrigido.
- **4 buscas → `variante="busca"`:** PickerExercicios
  (`PickerExercicios.tsx:117`), GerenciarPage (`GerenciarPage.tsx:828`),
  ModalCopiarPrograma (`ModalCopiarPrograma.tsx:108`), ModalCopiarFicha
  (`ModalCopiarFicha.tsx:116`) — elimina a divergência
  `superficie`/`superficie-suave`.
- **`<select>` → `variante="select"`:** ModalCriarExercicio
  (`ModalCriarExercicio.tsx:149`).
- **Textarea da nota → alinhar ao padrão:** NotaExercicio
  (`NotaExercicio.tsx:28`) (hoje `rounded-[8px]`/`text-sm`).
- **`CampoNumerico`/`CampoNumeroOpcional`:** mantêm a lógica BR (vírgula, buffer),
  só trocam a string de estilo pela base compartilhada — sem mexer no
  comportamento.

### Etapa 4 — Documentação

Corrigir `design-system.md §7.12`: `bg-superficie` → `bg-superficie-suave`,
documentar as 5 variantes e o porquê (contraste do campo sobre o card).

### Etapa 5 — Verificação

Rodar as telas afetadas no preview (gerenciar programa, editar ficha, execução,
modais de busca/cópia) e comparar contraste + captura antes/depois.

---

## Ordem de execução sugerida (baixo risco → alto)

1. Tokens + refatorar `Input.tsx` (variantes `texto`/`textarea`) e reconciliar
   `caixa`.
2. Migrar formulários planos (correção de contraste visível imediata).
3. Consolidar as 4 buscas.
4. `select` + textarea da nota.
5. Doc + verificação visual.

**Risco baixo:** é quase todo troca de classe CSS; a lógica de estado dos campos
não muda. Ponto de atenção: a variante `busca` (ícone + botão limpar) tem markup
ligeiramente diferente entre os 4 usos — conferir cada um na migração.

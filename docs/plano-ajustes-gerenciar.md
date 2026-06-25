# Planos de ajuste — Tela Gerenciar (Programas · Fichas · Exercícios)

> Três planos independentes, um por issue priorizado, derivados de uma crítica
> `/impeccable:critique`. Cada plano indica o comando impeccable que o orienta.
> **Este documento é só especificação — não implementa nada.**
>
> Pré-requisito já concluído (NÃO refazer): correção de tokens/contraste descrita em
> `docs/plano-correcao-contraste-tema.md`. Os bugs de cor (pill, `text-error`, `perigo`
> escuro, `texto-sutil` claro) já estão resolvidos e o contraste passa AA nos dois temas.

## Contexto compartilhado

- **Tela**: `src/interface/page/area-logada/gerenciar/GerenciarPage.tsx`.
  Três visualizações num só componente, alternadas pelo `BigSwitcher`
  (`src/interface/widget/formulario/BigSwitcher.tsx`): **Programas**, **Fichas**, **Exercícios**.
  - Programas → componente interno `CartaoPrograma`
  - Fichas → componente interno `CartaoFicha`
  - Exercícios → agrupado por grupo muscular + `LinhaExercicioCustom`
- **Design system / contexto**: `.impeccable.md` (princípios) e `docs/design-system.md`.
  Princípios-chave que regem estes planos: *"Ação acima de informação"*, *"Clareza imediata"*,
  *"Personalidade sem distração"*, *"Respeito ao tempo"*. Paleta preto/creme, Notion-like,
  mobile-first (max-width 480px). Sem dark mode "artificial" — há tema claro e escuro reais.
- **Tokens disponíveis** (Tailwind v4 `@theme` em `src/index.css`): `superficie`,
  `superficie-suave`, `texto-primario/secundario/sutil/invertido`, `acento`, `acento-suave`,
  `perigo`, `perigo-suave`, `borda`, `borda-suave`. **Não** existe token `error`.

### Como rodar e ver (qualquer sessão)

Dev server: `npm run dev` (porta padrão do projeto). Para popular as três abas, colar no
console do navegador e recarregar:

```js
localStorage.setItem("trainify_dados_treino", JSON.stringify({
  programas:[{id:"prog-1",nome:"Push / Pull / Legs",descricao:"Hipertrofia 5x por semana",fichaIds:["f-a","f-b","f-c"],ativo:true}],
  fichas:[
    {id:"f-a",nome:"Treino A — Peito & Tríceps",descricao:"Empurrar",icone:"halter",emoji:"💪",exercicios:[{exercicioId:"ex-01",series:3,repeticoes:10,usaCarga:true,descansoSegundos:60}],cardio:[]},
    {id:"f-b",nome:"Treino B — Costas & Bíceps",descricao:"Puxar",icone:"halter",emoji:"🏋️",exercicios:[{exercicioId:"ex-06",series:3,repeticoes:10,usaCarga:true,descansoSegundos:60}],cardio:[{id:"c1",tipo:"Esteira",duracaoMinutos:15,nota:""}]},
    {id:"f-c",nome:"Treino C — Pernas",descricao:"Inferiores",icone:"halter",emoji:"🦵",exercicios:[{exercicioId:"ex-06",series:3,repeticoes:12,usaCarga:true,descansoSegundos:60}],cardio:[]}
  ],
  historico:[],
  exerciciosCustom:[{id:"cx-1",nome:"Agachamento Búlgaro",grupoMuscular:"Pernas"},{id:"cx-2",nome:"Face Pull na Polia",grupoMuscular:"Ombros"}],
  atualizadoEm:new Date().toISOString()
})); location.hash="#/gerenciar"; location.reload();
```

Alternar tema para testar os dois: `localStorage.setItem('trainify_tema','escuro')` (ou `'claro'`) + reload.
Limpar ao final: `localStorage.removeItem('trainify_dados_treino'); location.reload();`

### Verificação compartilhada (vale para os 3 planos)

- Testar **nos dois temas** (claro e escuro) e nas **três abas**.
- `npm run build` (ou typecheck/lint do projeto) sem novos erros.
- Sem regressão funcional: criar/editar/ativar/excluir continuam funcionando.
- Nenhuma classe `text-white`/`bg-white`/`text-error` reintroduzida (usar tokens).

---

## Plano P-1 — `/normalize`: unificar o modelo de ação entre as abas

**Problema**: cada aba ensina uma "gramática" de ação diferente, então o usuário reaprende a
cada troca de aba:
- Programas → *toggle Ativo + Editar + Excluir*
- Fichas → *Editar + Excluir*
- Exercícios → *Excluir* (ícone lixeira, sem editar)
- Rótulo de criação: "Novo Programa", "Nova Ficha", mas só **"Novo"** em Exercícios.

**Objetivo (estado final)**: um padrão único e previsível de ações por item nas três abas.

### Mudanças

1. **Rótulo de criação consistente** — em `GerenciarPage.tsx`, o botão de header da aba
   Exercícios diz apenas `Novo`; mudar para **`Novo Exercício`** (alinhar com
   "Novo Programa" / "Nova Ficha"). *Atenção*: não confundir com o botão "Novo" da
   barra de navegação inferior (`NavegacaoInferior.tsx`), que cria programa — esse não muda.

2. **Conjunto de ações padronizado por item**:
   - **Editar** = ação primária, botão de texto/ghost (mantém em Programas e Fichas).
   - **Excluir** = ação destrutiva secundária, **ícone de lixeira** (padrão detalhado no
     **Plano P-3**) — aplicar em Programas e Fichas; Exercícios já segue esse padrão.
   - Exercícios continua **sem "Editar"** (um exercício custom só tem nome + grupo; nada a
     editar). Documentar essa exceção como intencional. *(Alternativa futura: permitir
     renomear — fora de escopo deste plano.)*
   - Resultado: as três abas passam a usar a mesma affordance destrutiva (ícone), e
     "Editar" some apenas onde não há o que editar.

3. **A11y do `BigSwitcher`** (opcional, recomendado): hoje usa `aria-pressed` em `<button>`
   (válido). Para alinhar a um seletor de visualização, considerar `role="tablist"` no
   container, `role="tab"` + `aria-selected` nos itens e tabindex roving. Não bloqueia.

4. **DRY (opcional, não-visual)**: há três `ModalConfirmacao` + três `Set` de "excluindo" +
   três handlers quase idênticos. Pode ser consolidado num helper/estado genérico de
   exclusão. Não altera o visual; fazer só se não aumentar o risco.

### Aceite P-1
- [ ] Botão de criar lê "Novo Programa" / "Nova Ficha" / "Novo Exercício".
- [ ] Excluir é ícone de lixeira nas três abas (ver P-3); Editar é texto em Programas/Fichas.
- [ ] Comportamento idêntico de exclusão (mesmo modal) nas três abas.

---

## Plano P-2 — `/distill`: enxugar o card de Programa

**Problema** (em `CartaoPrograma`): o estado "ativo" é sinalizado **4 vezes**
(pill "ATIVO" + `ring-2 ring-acento/20` no container + banner `bg-acento/10` + toggle), e a
linha de ação empilha **4 elementos** (contagem de fichas + toggle com **texto "Ativo" e**
switch + Editar + Excluir). Excesso de ruído, contra "Personalidade sem distração".

**Essência**: o card responde a duas perguntas — *"qual é este programa e está ativo?"* e
*"o que faço com ele?"*. Tudo que não serve a isso é candidato a corte.

### Mudanças (dentro de `CartaoPrograma`)

1. **Reduzir a sinalização de ativo de 4 → 2.** Manter apenas **pill "ATIVO" + toggle**:
   - Remover o `ring-2 ring-acento/20` do container do card (o "glow" é o sinal mais
     supérfluo e o mais "cara de template").
   - Remover o tint condicional do banner (`programa.ativo ? "bg-acento/10" : ...`) — banner
     sempre `bg-superficie-suave`. (O pill já marca ativo no próprio banner.)
2. **Eliminar a redundância do toggle.** O botão de toggle mostra **texto "Ativo/Ativar"
   E** um switch. Remover o texto e manter só o switch, com `aria-label` claro
   ("Programa ativo" / "Ativar programa") — já existe `title`, garantir o `aria-label`.
3. **Aliviar a linha de ação.** Após P-3 (Excluir vira ícone) e o passo 2 (toggle sem
   texto), a linha fica: `X fichas` · [switch] · [Editar] · [🗑]. Revisar gaps para ritmo
   (agrupar toggle perto do estado, separar das ações Editar/Excluir).

> Não remover funcionalidade: ativar/editar/excluir continuam disponíveis. Isto é redução
> de **sinais redundantes**, não de recursos.

### Aceite P-2
- [ ] Ativo é comunicado por no máximo 2 sinais (pill + toggle); sem `ring` e sem tint de banner.
- [ ] Toggle sem texto duplicado, com `aria-label` que descreve a ação.
- [ ] Card visualmente mais calmo nos dois temas; nada de contraste perdido (pill já usa `text-texto-invertido`).

---

## Plano P-3 — `/normalize`: ação destrutiva ("Excluir") como ícone

**Problema**: em Programas e Fichas, "Excluir" é um botão de texto do **mesmo peso** que
"Editar" (agora com cor `perigo`, mas ainda par visual da ação comum). A aba Exercícios já
trata exclusão como ícone discreto — esse é o padrão a adotar em todo lugar (prevenção de
erro + consistência).

**Padrão canônico** (já existe em `LinhaExercicioCustom`, usar como referência):

```tsx
<button
  type="button"
  onClick={aoExcluir}
  aria-label={`Excluir ${nome}`}
  className="p-2 text-texto-sutil hover:text-perigo hover:bg-perigo/10 rounded-lg transition-colors shrink-0"
>
  <Icone nome="lixeira" tamanho={18} />
</button>
```

### Mudanças
- **`CartaoPrograma`**: substituir o botão de texto "Excluir" pelo padrão de ícone acima.
  Manter "Editar" como texto/ghost ao lado.
- **`CartaoFicha`**: idem — no rodapé do card, "Editar" (texto) + lixeira (ícone).
- **Exercícios**: já conforme; nenhuma mudança.
- Manter o `ModalConfirmacao` de exclusão (a confirmação é a rede de segurança; não remover).
- Garantir `aria-label` único por item (`Excluir ${programa.nome}` / `Excluir ${ficha.nome}`).

### Aceite P-3
- [ ] "Excluir" é ícone de lixeira em Programas, Fichas e Exercícios (idêntico).
- [ ] `aria-label` descritivo em cada botão de exclusão.
- [ ] Cor de hover usa `perigo` (token), contraste AA nos dois temas.
- [ ] Fluxo de confirmação inalterado.

---

## Ordem sugerida e dependências

1. **P-3** primeiro (define a affordance destrutiva canônica).
2. **P-1** em seguida (consome P-3 para padronizar as abas + rótulos).
3. **P-2** por último (enxuga o card de Programa; assume Excluir já como ícone do P-3).

Cada plano é executável isoladamente, mas nessa ordem evita-se mexer duas vezes nos mesmos
botões. Rodar a **Verificação compartilhada** após cada um.

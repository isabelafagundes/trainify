# Plano — Tela de detalhe da sequência

## Contexto

A Home exibe o card `StripSemanal` (`src/interface/widget/calendario/StripSemanal.tsx`) com:

- total de dias da sequência atual;
- mensagem motivacional curta + `treinosSemana/7`;
- strip visual com os últimos 7 dias.

O pedido é transformar esse card numa **entrada de navegação**: ao clicar, abre uma tela de detalhe da ofensiva/constância, sem sobrecarregar a Home.

> Linguagem: na interface usar **"Sequência"** (não "Ofensiva").

## Como a navegação funciona hoje (importante)

Não há roteador de página com header próprio. O `App.tsx` é um roteador único por estado:

- `telaAtual` + `paramsTela` controlam qual tela interna aparece dentro do `<main>`.
- O **header e o botão voltar são globais**: `CabecalhoApp` recebe `onBack={aoVoltar}` e o título vem de `titulosPorTela[telaAtual]`.
- Páginas internas (ex.: `ResumoProgramaPage`) **não desenham header próprio** — só o conteúdo.

Ou seja, criar a tela = registrar título + um branch no roteador + tornar o card clicável. O voltar já vem de graça.

## Objetivo da tela

Responder rápido:

1. Qual é minha sequência atual?
2. Treinei quais dias recentemente?
3. Qual foi meu recorde?
4. O que falta para o próximo marco?
5. (contexto) Quantos treinos no mês / na semana?

## Etapas de implementação

### 1. Tornar o card clicável — `StripSemanal.tsx`

Adicionar prop opcional:

```ts
interface PropriedadesStripSemanal {
  dados: DadosFrequencia;
  aoAbrirDetalhe?: () => void;
}
```

Quando `aoAbrirDetalhe` existir:

- envolver o conteúdo num `<button type="button">` com classes resetadas (resolve teclado/foco com menos código);
- manter o visual atual idêntico;
- `aria-label="Ver detalhes da sequência"`;
- indicador sutil de navegação (chevron `setaDireita`, mesmo padrão do banner do programa na Home);
- estados `hover/active/focus-visible` no padrão do botão do banner em `HomePage.tsx`.

### 2. Wiring na Home — `HomePage.tsx`

```tsx
<StripSemanal
  dados={dadosFrequencia}
  aoAbrirDetalhe={() => aoNavegar("detalheSequencia")}
/>
```

### 3. Registrar a rota — `App.tsx`

- Adicionar título: `titulosPorTela["detalheSequencia"] = "Sequência"`.
- Adicionar branch no roteador (junto dos outros `telaAtual === ...`):

```tsx
) : telaAtual === "detalheSequencia" ? (
  <DetalheSequenciaPage historico={historico} aoNavegar={aoNavegar} />
) : ...
```

- Não precisa mexer na `NavegacaoInferior` nem no `pb` do `<main>` — não é tela de edição, então mantém o padrão com nav inferior visível.
- `aoVoltar` global já retorna para a Home (sem `voltarPara`, cai no `else` → `telaAtual = null`).

### 4. Nova tela — `src/interface/page/area-logada/sequencia/DetalheSequenciaPage.tsx`

```ts
interface PropriedadesDetalheSequenciaPage {
  historico: RegistroTreino[];
  aoNavegar: (destino: string, params?: Record<string, string>) => void;
}
```

Sem header próprio (vem do `CabecalhoApp`). Mobile-first, densidade igual à Home/Estatísticas. Seções:

1. **Destaque** — número grande do streak + unidade singular/plural + mensagem por faixa (reaproveitar a escala de `mensagemSequencia` já existente no `StripSemanal`).
2. **Próximo marco** — barra de progresso entre marco anterior e próximo, dias restantes.
3. **Últimos 7 dias** — mesma lógica visual do strip, com mais respiro (dia da semana, número, estado treinou/hoje/sem treino).
4. **Resumo** — atual, recorde, treinos no mês, treinos na semana.
5. **Histórico recente** — lista curta (últimos ~14 dias): data relativa ("Hoje", "Ontem", "12 jun") + "Treinou"/"Sem treino".

### 5. Helpers — `src/interface/page/area-logada/sequencia/utils.ts`

Criar **só** o que não existe:

```ts
export function obterProximoMarcoSequencia(streak: number): {
  marcoAnterior: number;
  proximoMarco: number;
  diasRestantes: number;
  progresso: number; // 0..1
};

export function construirDiasSequencia(
  historico: RegistroTreino[],
  diasJanela: number,
  hoje?: Date,
): Array<{ iso: string; diaSemana: string; diaMes: number; treinou: boolean; ehHoje: boolean }>;
```

Marcos: `[3, 7, 14, 21, 30, 60, 100]`. Streak 0 → próximo é 3. Acima de 100 → próximo múltiplo de 50 (ou "Maior marco alcançado").

**Reaproveitar de `estatisticas/utils.ts`** (não duplicar regra de streak):

- `calcularStreakAtual`
- `calcularRecordeStreak`
- `calcularTreinosNoMes`
- `construirDadosFrequencia`

> ⚠️ Consistência: o `StripSemanal` calcula o streak **internamente** (loop próprio), enquanto a Home/Estatísticas usam `calcularStreakAtual`. As duas regras hoje coincidem, mas a tela de detalhe deve usar `calcularStreakAtual` como fonte única. (Opcional/follow-up: refatorar o `StripSemanal` para também usar o helper e eliminar a duplicação.)

### 6. Testes

Unitários para `obterProximoMarcoSequencia` (faixas: 0, 1, 6, 7, 100, >100).

### 7. Verificação no navegador

Viewport mobile e desktop: clicar no card abre a tela, voltar retorna à Home, navegação por teclado no card funciona.

## Estados

- **Sem histórico / streak 0** — número 0, "Comece sua sequência hoje", resumo zerado, CTA opcional "Iniciar treino".
- **Treinou hoje** — dia de hoje completo, "Sequência protegida hoje."
- **Treinou ontem, não hoje** — streak ativa, "Treine hoje para manter a sequência."
- **Sequência quebrada** — streak 0, tom não punitivo: "Hoje é um bom dia para recomeçar."

## Critérios de aceite

- Clicar no card na Home abre o detalhe; voltar retorna à Home.
- Card continua visualmente igual quando clicável, com indicação sutil de navegação.
- A tela mostra sequência atual, recorde, próximo marco e últimos dias.
- A regra de streak bate com a tela de Estatísticas (`calcularStreakAtual`).
- Estados vazio / streak 0 / streak ativo não quebram layout.
- Navegação por teclado funciona no card clicável.

## Fora de escopo (1ª versão)

Gamificação pesada/medalhas/ranking, notificações push, edição manual de dias, comparação entre programas, regra de "meta semanal" em vez de "treinou no dia".

# Plano — Compartilhamento do resultado do treino (revisado)

> Revisão do plano original com foco em **reduzir risco de escopo** (Canvas 2D
> antes de WebGL), corrigir a marca do card e alinhar com o que já existe no
> código (share/filesystem já instalados, formatação BR, sessão recuperável).

## Objetivo

Após finalizar um treino, permitir criar e compartilhar um card em JPEG contendo
nome/emoji da ficha, data, duração, exercícios e séries concluídas, resumo do
cardio, um fundo gerado em código e (Fase 2) uma foto opcional. Tudo offline e
processado no dispositivo.

---

## Decisões-chave desta revisão

1. **Marca do card é "Trainify", não "Pezzo".** `Pezzo` é o nome interno do
   gerenciador de estado (`PezzoStateManager` em
   `src/application/state/pezzo.state.ts`), **não** a marca do produto. O card
   estampa Trainify.
2. **Canvas 2D antes de WebGL.** O fundo animado WebGL é o maior risco do
   projeto. Ele entra como **enriquecimento (Fase 1.5)**, não como bloqueio do
   MVP. A Fase 1 entrega o card completo com fundo em Canvas 2D (gradientes +
   grão), validando todo o pipeline export→share primeiro.
3. **Reaproveitar o que já existe.** `@capacitor/share` e `@capacitor/filesystem`
   **já estão instalados** (Capacitor 7.6.5). Nenhuma dependência nova na Fase 1.
4. **Formatação decimal BR obrigatória.** Distância/valores no card usam os
   helpers de `src/interface/util/numero.ts` (`formatarNumeroBR`) — vírgula, não
   ponto.
5. **`CardResultadoTreino` desacoplado do overlay.** Componente puro que recebe
   `registro` + `ficha` + `resumo`, para reaproveitar no compartilhamento a
   partir do histórico (Fase 3) sem retrabalho.

---

## 1. Experiência do usuário

```
Finalizar treino
      ↓
Celebração curta (confete atual, sem auto-fechar depois)
      ↓
Tela de resultado (persistente)
  ├── Prévia vertical do card (4:5)
  ├── Carrossel de fundos
  ├── [Fase 2] Adicionar foto
  ├── Botão primário: Compartilhar resultado
  └── Botão secundário: Concluir
      ↓
Compartilhar → WhatsApp, Instagram, etc.
```

O auto-fechamento atual do `OverlayFinalizado`
([useEffect com `setTimeout(aoConcluir, 2600)`](../src/interface/page/area-logada/execucao/OverlayFinalizado.tsx)) é **removido**.
A celebração (confete + "Treino finalizado!") vira o topo da tela de resultado ou
uma transição curta que revela o card.

**Botão voltar do Android:** hoje `useInterceptarVoltar(!finalizadoAberto, …)`.
Na tela de resultado persistente, definir explicitamente que o *back* físico
executa **Concluir** (mesma ação do botão secundário), evitando sair sem querer.

---

## 2. Formato do card (MVP)

- Resolução: `1080 × 1350` (4:5), JPEG qualidade `0.92`.
- Área segura interna ~80 px.
- Conteúdo: marca **Trainify**, emoji + nome da ficha, "Treino concluído", data,
  duração, nº de exercícios, nº de séries, resumo de cardio (quando houver).
- Volume levantado e sequência ficam para depois (exigem cálculo adicional).

---

## 3. Estrutura de arquivos

```
src/
├── application/
│   └── compartilhamento/
│       ├── calcular-resumo-treino.ts
│       └── calcular-resumo-treino.test.ts
│
├── infrastructure/
│   └── service/
│       ├── compartilhar-resultado.service.ts
│       └── selecionar-foto.service.ts          # Fase 2
│
└── interface/
    ├── page/area-logada/execucao/
    │   ├── OverlayFinalizado.tsx               # vira tela de resultado
    │   ├── CardResultadoTreino.tsx             # componente PURO (preview)
    │   ├── SeletorFundoResultado.tsx
    │   ├── desenhar-card.ts                    # pipeline de export p/ canvas
    │   └── hooks/
    │       └── useCompartilhamentoTreino.ts
    │
    └── widget/fundo-resultado/
        ├── FundoResultado.tsx                  # Fase 1: Canvas 2D
        ├── fundo-resultado.renderer.ts         # render compartilhado preview/export
        ├── presets-fundo.ts
        └── shaders.ts                          # Fase 1.5: WebGL
```

---

## 4. Cálculo do resumo (Fase 1 — primeiro a fazer)

Função pura, independente de UI, com testes.

```ts
interface ResumoCompartilhamento {
  duracaoSegundos: number;
  totalExercicios: number;
  totalSeries: number;
  totalCardios: number;
  duracaoCardioMinutos: number;
  distanciaCardioKm?: number;
}
```

Regras, alinhadas ao modelo real (`RegistroTreino` em `src/domain/tipos.ts` já
guarda só o que foi concluído, pois `finalizar()` filtra as séries por
`concluidas`):

- **Duração:** `finalizadoEm − iniciadoEm`, **com clamp**. A sessão é recuperável
  em segundo plano (ver `sessao-ativa.ts`), então um treino começado de manhã e
  finalizado à noite pode reportar horas irreais. Regra do MVP:
  - se `duracaoSegundos <= 0` ou datas inválidas → tratar como `0` / ocultar;
  - se `duracaoSegundos > TETO` (ex.: 4h) → **ocultar** a duração no card em vez
    de exibir valor absurdo. `TETO` numa constante.
- **Exercícios:** registros com ao menos uma série salva.
- **Séries:** soma das séries efetivamente salvas.
- **Cardio:** registros concluídos; somar duração e distância quando existirem.

Casos a tratar (todos com teste): sem musculação, sem cardio, sessão parcial,
datas inválidas, treino curtíssimo, treino longuíssimo (clamp).

---

## 5. `CardResultadoTreino` — componente puro de preview

```tsx
<CardResultadoTreino
  registro={registro}
  ficha={ficha}
  resumo={resumo}
  fundo={fundoSelecionado}
/>
```

- Renderiza a prévia (DOM/CSS) na proporção 4:5, cabendo no mobile sem rolagem
  horizontal (a imagem final é sempre 1080×1350 no canvas, independente do
  tamanho exibido).
- **Não** recebe estado do overlay — só dados. Assim serve tanto à tela de
  resultado quanto ao futuro "compartilhar do histórico".
- **Distância/decimais via `formatarNumeroBR`** (ex.: "5,2 km").

---

## 6. Fundo — Canvas 2D primeiro (Fase 1), WebGL depois (Fase 1.5)

### Presets (comum às duas fases)

```ts
export type IdPresetFundo =
  | "oceanic" | "ember" | "forest" | "aurora" | "sunset" | "graphite";

export interface PresetFundo {
  id: IdPresetFundo;
  nome: string;
  cores: [Cor, Cor, Cor, Cor];   // Cor = [r,g,b,a]
  intensidade: number;
  contraste: number;
  grao: number;
  velocidade: number;
  corTexto: "claro" | "escuro";  // garante legibilidade por preset
}
```

### `FundoResultado` (Fase 1 — Canvas 2D)

```tsx
<FundoResultado preset="oceanic" seed={registro.id} animado />
```

Responsabilidades:
- preencher o contêiner; respeitar `prefers-reduced-motion` (frame estático);
- pausar quando a página fica oculta (`visibilitychange`);
- limitar DPR a 2;
- variação leve e reprodutível a partir de `seed = registro.id` (posição/rotação
  das faixas, instante capturado, intensidade dentro de limite seguro) — **sem
  alterar as cores principais nem comprometer a leitura do texto**;
- liberar recursos no unmount.

### `FundoResultado` (Fase 1.5 — WebGL, opcional)

Troca a implementação do renderer por WebGL com shader parametrizado por
uniforms (`u_intensity`, `u_contrast`, `u_zoom`, `u_rotation`, `u_offset`,
`u_grain`), um único programa para todos os presets. Requisitos extra do WebGL:
- fallback para o renderer Canvas 2D quando WebGL indisponível;
- não perder o contexto explicitamente no Strict Mode;
- **export por render sob demanda**: renderizar 1 frame na hora de exportar e ler
  os pixels — **não** usar `preserveDrawingBuffer: true` na preview animada (custo
  de performance).

> O renderer é o **mesmo objeto** usado na preview e no export, garantindo que a
> imagem gerada seja idêntica ao que o usuário viu.

---

## 7. Renderização do JPEG (`desenhar-card.ts`)

Canvas direto — **não** capturar o DOM (screenshot é frágil com fontes/DPR/WebGL).

```
Canvas 1080 × 1350
      ↓
await document.fonts.ready          // fontes prontas antes de medir texto
      ↓
Desenhar fundo (Canvas 2D  →  ou  drawImage do frame WebGL)
      ↓
Degradê de legibilidade
      ↓
Textos e indicadores (truncar nome longo; cuidar de emoji cortado)
      ↓
canvas.toBlob("image/jpeg", 0.92)
```

Cuidados:
- **Emoji no canvas** difere entre Android/iOS e pode sair P&B/tofu. Testar em
  device real nos dois SOs; se exigir consistência, embarcar fonte de emoji.
- Truncar nomes de ficha muito longos com reticências.

---

## 8. Compartilhamento nativo (`compartilhar-resultado.service.ts`)

Duas implementações atrás de uma interface. **Sem instalar nada** — share e
filesystem já existem.

**Capacitor:** Blob → base64 → salvar em `Directory.Cache` → obter URI →
`Share.share({ title, text, url: uri, dialogTitle })` → limpar caches antigos
quando oportuno.

**Web:** `File` a partir do Blob → `navigator.share()` quando aceitar arquivos →
senão, baixar o JPEG.

Cancelar o painel de compartilhamento **não** é erro (tratar `AbortError`
silenciosamente). Cancelar **não** perde nem duplica o treino (ele já foi
salvo antes desta tela).

---

## 9. Alteração na finalização atual

Em [`persistirFinalizacao`](../src/interface/page/area-logada/execucao/ExecucaoTreinoPage.tsx),
**capturar o retorno** de `adicionarTreino` (hoje é descartado — o método já
devolve o `RegistroTreino` com `id`):

```ts
const [registroFinalizado, setRegistroFinalizado] =
  useState<RegistroTreino | null>(null);

const persistirFinalizacao = () => {
  const registro = sessao.finalizar();
  const registroSalvo = stateManagerRepository.adicionarTreino({ /* ... */ });
  void sessao.encerrar();
  setRegistroFinalizado(registroSalvo);   // card reflete o que entrou no histórico
  setFinalizadoAberto(true);
  void appModule.feedbackTatil.sucesso();
};
```

O overlay recebe `registroSalvo` + a `ficha` da sessão (já em mãos via
`sessao.ficha`, sem re-buscar).

---

## 10. Foto (Fase 2)

```
npm install @capacitor/camera@latest-7
npx cap sync
```

Serviço `selecionar-foto.service.ts` (`camera | galeria`). Usuário pode
arrastar/zoom/trocar/remover e escolher nível de escurecimento; na export a foto
é desenhada em `cover`. **Privacidade:** não salvar no histórico, não incluir no
backup, manter só durante a tela, descartar ao concluir. Adicionar descrições de
permissão no `Info.plist` (iOS). Recuperar resultado após retorno da câmera com
`appRestoredResult`.

---

## 11. Tratamento de erros

- WebGL indisponível → fundo Canvas 2D (fallback nativo da Fase 1).
- Geração do JPEG falhou → manter prévia, oferecer nova tentativa.
- Compartilhamento indisponível → baixar/salvar imagem.
- Pouco espaço → informar que não foi possível criar o arquivo.
- (Fase 2) câmera negada → explicar como liberar; galeria cancelada → voltar em
  silêncio; app retomado após câmera → `appRestoredResult`.

---

## 12. Testes

**Unitários:** duração (incl. clamp e datas inválidas), contagem de séries/
exercícios, agregação de cardio, formatação BR da distância, seed determinística,
seleção de presets, truncamento de texto, fallback de compartilhamento
(`AbortError` silencioso).

**Componente:** overlay não auto-fecha; troca de preset atualiza a prévia; estado
de carregamento durante a geração; botão bloqueado contra múltiplos toques;
(Fase 2) cancelar foto não altera o fundo; Concluir volta à Home; back do Android
= Concluir.

**Manuais:** Android e iPhone reais; WhatsApp; Instagram; tema claro/escuro; nome
muito longo; só-cardio; sessão parcial; movimento reduzido; sem WebGL; offline.

---

## 13. Fases de entrega

### Fase 1 — MVP (sem dependências novas, sem permissões novas)
- `calcular-resumo-treino.ts` + testes (com clamp de duração).
- Nova tela de resultado (remover auto-fechar; back = Concluir).
- `CardResultadoTreino` puro + 6 presets.
- **Fundo em Canvas 2D** (gradientes + grão), animado, respeitando movimento
  reduzido.
- Pipeline `desenhar-card.ts` → JPEG 4:5.
- Compartilhamento Capacitor + download na web.
- **Salvar último preset escolhido** (`@capacitor/preferences`, já existe) —
  puxado da Fase 3 por ser trivial e melhorar o uso repetido.

Critério: MVP inteiro entrega valor sem tocar em WebGL nem em permissões.

### Fase 1.5 — Fundo WebGL (enriquecimento)
- Shader único parametrizado por uniforms; renderer compartilhado preview/export;
  export por render sob demanda; fallback para Canvas 2D.

### Fase 2 — Foto personalizada
- `@capacitor/camera`; câmera + galeria; reposicionar/zoom; camada de
  legibilidade; permissões iOS/Android; retomada do app.

### Fase 3 — Evoluções
- Formato Story `1080 × 1920`; sequência atual; recordes; volume levantado;
  ocultar métricas; temas sazonais; **compartilhar a partir do detalhe do
  histórico** (quase de graça, pois `CardResultadoTreino` já é puro).

---

## Critérios de aceite do MVP (Fase 1)

- O treino é salvo **antes** da tela de compartilhamento.
- A tela **não** fecha automaticamente.
- Há **≥ 6 fundos** selecionáveis, todos gerados em código (sem imagens remotas).
- A prévia é animada e respeita `prefers-reduced-motion`.
- O JPEG é `1080 × 1350`.
- O texto permanece legível em todos os presets (`corTexto` por preset).
- Decimais no card usam vírgula (`formatarNumeroBR`).
- O card estampa **Trainify** (não "Pezzo").
- Compartilhamento funciona no Android e iOS; web tem fallback de download.
- Cancelar o compartilhamento não perde nem duplica o treino.
- Funciona 100% offline.

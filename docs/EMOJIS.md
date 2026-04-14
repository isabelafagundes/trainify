# Sistema de Emojis para Fichas de Treino

Visão geral do sistema de emojis que substitui ícones SVG por emojis, mantendo a estética Notion-like.

## Como Funciona

O sistema agora suporta **dois tipos de ícones** para as fichas:

1. **Ícones SVG tradicionais** (existentes): `halter`, `braco`, `raio`, etc.
2. **Emojis** (novos): qualquer emoji Unicode

Quando uma ficha tem o campo `emoji` preenchido, o emoji tem prioridade sobre o ícone SVG.

## Uso

### Adicionar emoji a uma ficha existente:

```typescript
const ficha: Ficha = {
  id: "ficha-01",
  nome: "Treino A",
  descricao: "Peito, tríceps e ombros",
  icone: "braco",      // fallback (usado se emoji for undefined)
  emoji: "💪",          // emoji principal (exibido quando presente)
  exercicios: [...],
  cardio: [],
};
```

### Emojis sugeridos por tipo de treino

Use o utilitário `sugerirEmojiParaTreino` para obter sugestões automáticas:

```typescript
import { sugerirEmojiParaTreino } from "@/utils/emojiTreino";

const emoji = sugerirEmojiParaTreino("Treino de Pernas");
// Retorna: "🦵"

const emoji2 = sugerirEmojiParaTreino("HIIT Cardio");
// Retorna: "⚡"
```

## Mapa de Emojis

| Grupo Muscular | Emoji |
|----------------|-------|
| Peito | 💪 |
| Tríceps | 💪 |
| Ombros | 🎯 |
| Costas | 🏋️ |
| Bíceps | 💪 |
| Trapézio | ⛰️ |
| Pernas | 🦵 |
| Glúteos | 🍑 |
| Abdômen/Core | 🔥 |
| Flexibilidade | 🧘 |
| Yoga | 🧘 |
| Corrida | 🏃 |
| Bike | 🚴 |
| Natação | 🏊 |
| HIIT | ⚡ |
| Força | 🏋️ |
| Hipertrofia | 💪 |
| Potência | ⚡ |
| Funcional | 🤸 |

## Estilo Notion-like

Os emojis são exibidos dentro de containers arredondados com fundo suave (`bg-acento-suave`), criando um visual coeso com a paleta preto/creme:

```tsx
<div className="w-10 h-10 rounded-[10px] bg-acento-suave flex items-center justify-center">
  <IconeFicha nome={ficha.icone} tamanho={22} emoji={ficha.emoji} />
</div>
```

## Emojis Populares

Para seleção manual em UI:

```typescript
import { emojisPopulares } from "@/utils/emojiTreino";

// ["💪", "🦵", "🏋️", "🏃", "🚴", "🏊", "🤸", "🧘", ...]
```

## Notas Técnicas

- O emoji é renderizado como `<span>` com `fontSize` dinâmico
- Mantém `aria-hidden="true"` para acessibilidade (decorativo)
- Fallback automático para ícone SVG se `emoji` for `undefined`
- Compatível com a tipografia e espaçamento existente

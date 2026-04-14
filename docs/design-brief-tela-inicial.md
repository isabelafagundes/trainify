# Design Brief — Reestruturação Visual da TelaInicial

## 1. Feature Summary

**O que é**: Refatoração da tela principal do Trainify para resolver competição visual entre 3 containers (StripSemanal, BannerPrograma, Lista de Fichas) e tornar a próxima ficha obviamente acessível.

**Para quem**: Praticantes de exercícios que usam o app toda vez que vão treinar, querendo ação rápida sem perder a motivação do progresso.

**O que precisa accomplishar**: Equilíbrio entre motivação (ver progresso) e ação (saber qual treino fazer hoje) — com hierarquia visual clara e next step óbvio.

---

## 2. Primary User Action

**"Ver minha sequência e iniciar o treino de hoje"** — em menos de 3 segundos, sem pensar.

**Ação crítica**: Clicar em "Iniciar" na próxima ficha. Tudo mais é contexto, não distração.

---

## 3. Design Direction

**Sensação**: Calma e determinada. Não é explosiva/hype, nem fria/clinica. É confiante.

**Estética**: Notion-like clean, mas com personalidade. Espaçamento generoso, ritmo visual, elementos que respiram.

**Como expressa**:
- StripSemanal: sutil, sem competir com ação
- BannerPrograma: integrado, não um card separado
- Lista: clara, com next step destacado
- Terminologia: "Sequência" não "Ofensiva" — constância é disciplina, não batalha

**Referência visual**: Notion (layout clean, hierarquia clara) + personalidade própria (emojis nas fichas, paleta quente)

---

## 4. Layout Strategy

**Alta hierarquia**:
1. StripSemanal — container sutil, background muito leve, SEM borda
2. Header unificado (BannerPrograma + meta da semana) — integrado com a lista
3. Lista de fichas — próxima ficha SEMPRE no topo, destaque visual claro

**Espaçamento e ritmo**:
- Strip: separado da lista por espaço generoso (24-32px)
- Header + Lista: um bloco contínuo
- Entre fichas: separadores sutis, não cards individuais

**Visual weights**:
- Strip: 20% (contexto motivacional)
- Header: 20% (informação do programa)
- Lista: 60% (ação principal)

---

## 5. Key States

| Estado | O que usuário vê/ sente |
|--------|------------------------|
| **Default (com programa)** | Strip com sequência + 7 dias, Header unificado, Lista com próxima ficha no topo destacada |
| **Empty (sem programa)** | Mensagem motivacional "Comece sua jornada" + CTA claro (edge case raro) |
| **Streak zerado** | Strip com mensagem "Comece sua sequência hoje" — não punitivo |
| **Streak alto (7+ dias)** | Mensagem de celebração mas contida ("Imparável!" não "🎉🎉🎉 LEGENDARY 🎉🎉🎉") |
| **Primeira ficha completa** | Badge "HOJE" na ficha treinada, feedback sutil |

---

## 6. Interaction Model

**Entry to completion**:
1. Usuário abre app → vê sequência (motivação)
2. Olha para a lista → próxima ficha está no topo (clareza)
3. Clica "Iniciar" → navega para execução (ação)

**Reordering**:
- Lista é ordenada automaticamente: próxima ficha sempre primeiro
- Critério: ficha treinada há mais tempo (ou nunca treinada)

**Feedback**:
- Hover em fichas: background sutil para indicar interatividade
- Botão "Iniciar": estado primário para próxima ficha, fantasma para outras
- Confirmação: NÃO — ação é rápida, sem modal (usuário pode voltar se enganar)

**Micro-interactions**:
- Streak counter: pulse sutil quando > 0 (celebração contida)
- Dia de hoje na Strip: ring inset para destaque
- Próxima ficha: indicador visual (badge "PRÓXIMA" ou similar)

---

## 7. Content Requirements

**Terminologia**:
- "Ofensiva" → "Sequência" em toda interface
- "Dias de sequência" (singular/plural correto)
- Mensagens da Strip: contidas, motivacionais sem hype

**Copy da Strip** (mantido):
```
0 dias: "Comece sua sequência hoje"
1-2 dias: "Sequência começando..."
3-6 dias: "Mandando bem!"
7-13 dias: "Semana completa!"
14-29 dias: "Imparável!"
30+ dias: "Lendário!"
```

**Copy do Header**:
- Nome do programa (ex: "Rotina Janeiro")
- Descrição (ex: "Rotina de volume, 4x semana")
- Meta da semana (ex: "2/4 fichas esta semana")

**Copy da Lista**:
- Nome da ficha (ex: "Treino A")
- Grupos musculares (chips)
- Último treino (ex: "Hoje", "Ontem", "3d atrás")
- Botão: "Iniciar"

**Empty state** (edge case):
- Título: "Comece sua jornada 💪"
- Descrição: "Organize seus treinos, acompanhe seu progresso e mantenha a constância."
- CTA: "Criar primeiro programa"

---

## 8. Recommended References

Para implementação deste brief:

- **`spatial-design.md`** — Para hierarquia visual, ritmo de espaçamento, integração de containers
- **`typography.md`** — Para escala modular, pesos e tamanhos de fonte (Bricolage + Figree)
- **`interaction-design.md`** — Para padrões de listas, estados de hover, feedback de ação
- **`motion-design.md`** — Para animações sutis (pulse do streak, transições de reordering)

---

## 9. Open Questions

1. **Badge "PRÓXIMA"** — Deve ser visual (círculo colorido, texto) ou posicional (sempre no topo é suficiente)?
   - *Implementer deve resolver*: Testar com e sem badge, validar com usuário

2. **Animação de reordering** — Quando a lista é reordenada, deve ter animação ou instantâneo?
   - *Implementer deve resolver*: Considerar performance vs. clareza visual

3. **Strip em telas menores** — Em dispositivos muito pequenos (iPhone SE), manter 7 dias ou reduzir para 5?
   - *Implementer deve resolver*: Considerar legibilidade vs. informação completa

---

## 10. Success Criteria

**Sinal de sucesso**: Usuário abre o app e em < 3 segundos sabe:
1. Quanto tempo está mantendo a sequência
2. Qual treino fazer hoje
3. Como iniciar

**Métricas qualitativas**:
- "Não preciso procurar a próxima ficha"
- "Sei exatamente onde clicar"
- "Sinto me acompanhado, mas não sobrecarregado"

**Métricas quantitativas** (futuro):
- Tempo para iniciar treino < 5 segundos
- Taxa de abandono na tela < 10%
- Usuários retornam 7+ dias seguidos (sequência)

---

## Arquivos a Modificar

1. **`src/telas/TelaInicial.tsx`** — Layout principal, integração Strip + Banner + Lista
2. **`src/componentes/BannerPrograma.tsx`** — Integrar como header da lista, remover container extra
3. **`src/componentes/StripSemanal.tsx`** — Background sutil, sem borda; "Ofensiva" → "Sequência"
4. **`src/componentes/LinhaFicha.tsx`** — Adicionar badge "PRÓXIMA" (se necessário)

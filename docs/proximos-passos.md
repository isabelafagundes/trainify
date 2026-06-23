# Próximos passos — Trainify

> Documento vivo com o roadmap de evolução do app. Atualize conforme os itens
> forem concluídos.

## ✅ Concluído

### Backup por arquivo (Fase 1)
Backup offline por arquivo (export/import de um snapshot JSON) implementado.
- Snapshot versionado (`versaoSchema`, `atualizadoEm`) — base para o sync futuro.
- Export/import via `@capacitor/filesystem` + `@capacitor/share`.
- Camada de serialização (`snapshot.service`) pronta para ser reusada pela Fase 2.
- O app segue 100% utilizável **sem internet e sem conta**.

Plano de referência: [plano-preparar-backend.md](plano-preparar-backend.md).

---

## 🔜 Em aberto

### Backup/Sync com backend (Fase 2)
A Fase 1 deixou o terreno pronto; a Fase 2 introduz a sincronização opcional
com backend (recomendado: **Supabase**). Exige:
- **Autenticação** — login completo com recuperação de senha e exclusão de conta
  (exigência das lojas Apple/Google). Login social (Apple/Google) opcional para
  reduzir fricção.
- **Sync** — `SyncRepository` que faz `exportarSnapshot()` → `PUT /backup` e
  `GET /backup` → `importarSnapshot("maisRecente")`, disparado no login e quando
  o app vai para segundo plano.
- **Resolução de conflito** — last-write-wins por `atualizadoEm` (campo já
  existe desde a Fase 1).
- **Backend** — 1 tabela (`user_id`, `dados_json`, `atualizado_em`) + Row-Level
  Security + Edge Function para exclusão de conta.
- **Garantia de zero impacto:** usuário existente abre o app, faz login opcional,
  e o primeiro sync sobe o snapshot local. Sem migração, sem perda. Quem não
  criar conta continua offline para sempre.

### Progressão automática
O app já guarda carga/reps por série. Sugerir a próxima carga com base no
histórico ("semana passada: 40kg x10, tente 42,5kg") seria um diferencial real
e está alinhado à proposta de app simples e focado.

### Timer de descanso com notificação em segundo plano
Notificar o fim do descanso quando o app está em background. O serviço de
notificações (`notificacoes-treino.service`) já existe — falta integrar ao
timer de descanso da execução de treino.

### Onboarding com fichas-template
Hoje o app começa vazio, o que gera fricção inicial. Oferecer templates prontos
(ex.: "Push/Pull/Legs") no onboarding ajuda o usuário a chegar ao valor mais
rápido.

### Revisão de design de todas as telas (impeccable)
Repassar **todas as telas do app** com o `impeccable` (skill de design) para
elevar a qualidade visual e de UX — hierarquia, espaçamento, tipografia,
microinterações e consistência do design system. Manter o alinhamento com a
proposta: simples, focado e leve.

### Cobertura de testes
Hoje só os helpers de cálculo têm testes (`estatisticas`, `sequencia`,
`useTimerDescanso`). O `TrainifyStateManager` — que detém todos os dados e a
lógica de copiar/vincular — não tem nenhum teste. É exatamente o código onde um
bug corrompe dados do usuário.

Sugestão:
- Testes para `TrainifyStateManager` (adicionar treino, vincular ficha, copiar).
- Testes para `sessao-ativa` (round-trip salvar/carregar/limpar).

### Testes E2E com Playwright
Adicionar testes end-to-end com Playwright para cobrir os fluxos principais de
ponta a ponta, complementando os testes unitários do Vitest. Fluxos prioritários:
- Onboarding (criar perfil) → home.
- Criar programa → criar ficha → vincular.
- Executar um treino completo → finalizar → conferir no histórico.
- Recuperação de sessão ativa (treino retomado após reload).
- Export/import de backup.

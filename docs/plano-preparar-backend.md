# Plano — Preparar o terreno para o backend (Fase 1)

> **Objetivo:** entregar **backup offline por arquivo** hoje e deixar a camada de
> dados pronta para que, na Fase 2, o sync com backend (Supabase) entre **sem
> impactar nenhum usuário existente** — sem migração, sem perda de dados, e
> mantendo o app 100% utilizável sem internet/conta.

## Princípios

1. **Local é a fonte da verdade.** O backend (futuro) é só um cofre do mesmo blob.
2. **Internet nunca obrigatória.** Sem conta = offline puro, como hoje.
3. **O arquivo de export é o mesmo blob do sync.** O trabalho de Fase 1 é a
   camada de serialização da Fase 2 — não é descartável.
4. **Last-write-wins por `atualizadoEm`.** O campo nasce agora; a comparação só
   é usada na Fase 2.

## Diagnóstico do estado atual (o que já ajuda)

- ✅ **Choke point já existe:** toda persistência passa por
  `appModule.armazenamento` ([app.module.ts](../src/interface/configuration/module/app.module.ts)).
  Nenhuma tela toca `localStorage`/`Preferences` direto. Só os 4 state managers
  (`trainify`, `usuario`, `tema`, `sessao-ativa`) gravam.
- ✅ `@capacitor/share` já instalado.
- ⚠️ **Sem versionamento** nos dados persistidos.
- ⚠️ **Sem `atualizadoEm`** — necessário para o LWW futuro.
- ⚠️ **Dados espalhados em chaves** (`DADOS_TREINO`, `USUARIO`, …) — falta um
  ponto único que monte/aplique o "snapshot" completo.
- ⚠️ `@capacitor/filesystem` **não instalado** (preciso para gravar arquivo).

## O que ENTRA no snapshot (dados portáveis do usuário)

- `usuario` (perfil)
- `programas`, `fichas`, `historico`, `exerciciosCustom`

## O que FICA DE FORA (preferência de aparelho / efêmero)

- `tema` e `fonte grande` → preferência por aparelho, não é dado do usuário.
- `sessao_ativa` → treino em andamento, efêmero; nunca vai para backup.

---

## Passo a passo

### Passo 1 — Modelo do snapshot versionado
**Novo:** `src/domain/snapshot.ts`

```ts
export interface SnapshotTrainify {
  versaoSchema: number;      // começa em 1
  atualizadoEm: string;      // ISO — base do last-write-wins
  exportadoEm: string;       // ISO — quando o arquivo foi gerado (informativo)
  usuario: Usuario | null;
  dados: {
    programas: Programa[];
    fichas: Ficha[];
    historico: RegistroTreino[];
    exerciciosCustom: Exercicio[];
  };
}
```

**`src/constants.ts`:** adicionar `export const VERSAO_SCHEMA = 1;`

### Passo 2 — `atualizadoEm` na fonte da verdade
**Editar:** [trainify.state.ts](../src/application/state/trainify.state.ts)

- Adicionar `atualizadoEm: string` ao payload persistido (`DadosTreino`).
- Em `salvarDados()`, carimbar `atualizadoEm = new Date().toISOString()` a cada
  gravação (toda mutação já chama `salvarDados`).
- Expor `getAtualizadoEm()` e um getter cru dos dados para o snapshot.
- Novo método `substituirDados(dados, atualizadoEm)` — aplica um snapshot
  importado ao estado, persiste e notifica. (É o que o import e, depois, o sync
  vão chamar.)

### Passo 3 — Serviço de snapshot (a "costura" da Fase 2)
**Novo:** `src/application/snapshot/snapshot.service.ts`

```ts
exportarSnapshot(): Promise<SnapshotTrainify>          // lê dos managers → blob
importarSnapshot(s, estrategia): Promise<void>         // valida versão → aplica
serializar(s): string                                  // JSON.stringify
desserializar(texto): SnapshotTrainify                 // parse + valida + migra
```

- `estrategia: "substituir" | "maisRecente"` — Fase 1 usa só `"substituir"`;
  `"maisRecente"` (compara `atualizadoEm`, LWW) fica pronto para a Fase 2.
- `desserializar` checa `versaoSchema` e roda uma **cadeia de migrações** por
  versão (hoje só valida o shape da v1). É isso que torna mudanças futuras de
  formato indolores.
- **Este módulo é o único ponto que a Fase 2 consome:** o `SyncRepository` fará
  `exportarSnapshot()` → `PUT /backup` e `GET /backup` → `importarSnapshot()`.
  A UI não muda.

### Passo 4 — Serviço de backup por arquivo (infra)
**Instalar:** `@capacitor/filesystem` + `npx cap sync`
**Novo:** `src/infrastructure/service/backup-arquivo.service.ts`

- **Exportar:** grava o JSON num arquivo (`trainify-backup-AAAA-MM-DD.json`) e
  abre o share sheet (`@capacitor/share`). Web: dispara download via `Blob`.
- **Importar:** lê o conteúdo de um arquivo escolhido. Native: file picker;
  Web: `<input type="file">`. Retorna o texto cru para o `snapshot.service`.
- Abstraído atrás de uma interface, registrado no `appModule` (mantém o padrão
  de injeção de dependências).

### Passo 5 — UI de Exportar/Importar
**Editar:** [CabecalhoApp.tsx](../src/interface/widget/cabecalho/CabecalhoApp.tsx)
(painel de preferências já existente)

- Nova seção **"Dados"** com dois botões:
  - **Exportar dados** → `exportarSnapshot` → `serializar` → backup-arquivo.
  - **Importar dados** → escolher arquivo → `desserializar` → **modal de
    confirmação** ("Isto vai substituir seus dados atuais") → `importarSnapshot`.
- Toast de sucesso/erro (já há `ToastProvider`).

### Passo 6 — Identidade de instalação (opcional, barato, ajuda a Fase 2)
**Editar:** `src/constants.ts` + pequeno helper

- Gerar um `instalacaoId` (UUID) no primeiro run, guardado em Preferences.
- Não muda nada hoje; na Fase 2 ajuda a distinguir aparelhos. Pode ser cortado
  se preferir manter o escopo mínimo.

### Passo 7 — Testes
**Novos:**

- `snapshot.service.test.ts` — round-trip `serializar`/`desserializar`;
  `importarSnapshot("substituir")` realmente substitui; rejeita JSON inválido;
  migração de versão (esqueleto para v1→v2 futura).
- `trainify.state` — `substituirDados` aplica e carimba `atualizadoEm`.

---

## Como a Fase 2 encaixa (sem impacto)

1. Usuário existente abre o app → dados locais intactos (nada muda).
2. Faz login opcional (Apple/Google/e-mail) → primeiro sync **sobe o snapshot
   local** (que já é o blob de export). Nada para migrar.
3. Quem nunca criar conta → continua offline para sempre.
4. Sync = `exportarSnapshot` → `PUT`, `GET` → `importarSnapshot("maisRecente")`,
   disparado no login e no `appStateChange` (background). LWW por `atualizadoEm`.

A única peça nova da Fase 2 é o `SyncRepository` + o projeto Supabase
(1 tabela: `user_id`, `dados_json`, `atualizado_em`). UI e domínio: zero mudança.

## Resumo de arquivos

| Ação | Arquivo |
|------|---------|
| novo | `src/domain/snapshot.ts` |
| novo | `src/application/snapshot/snapshot.service.ts` |
| novo | `src/infrastructure/service/backup-arquivo.service.ts` |
| novo | `src/application/snapshot/snapshot.service.test.ts` |
| editar | `src/constants.ts` (VERSAO_SCHEMA, instalacaoId) |
| editar | `src/application/state/trainify.state.ts` (atualizadoEm, substituirDados) |
| editar | `src/interface/configuration/module/app.module.ts` (registrar serviço) |
| editar | `src/interface/widget/cabecalho/CabecalhoApp.tsx` (seção "Dados") |
| dep | `@capacitor/filesystem` + `npx cap sync` |

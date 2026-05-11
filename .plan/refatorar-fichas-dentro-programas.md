# Plano: Refatorar Fichas para Existirem Apenas Dentro de Programas

## 🎯 Objetivo
Alterar a arquitetura das fichas para que elas **só possam ser criadas e gerenciadas dentro de programas**, removendo a capacidade de existirem de forma independente.

## 📋 Análise do Estado Atual

### Problemas Identificados
1. **Fichas independentes**: A `GerenciarPage` tem uma seção dedicada para criar/editar fichas fora do contexto de programas
2. **Rota autônoma**: Existe rota `/criar-ficha` que não exige programaId
3. **Modelo de dados**: Fichas são armazenadas no mesmo nível que programas, não como filhas de programas
4. **Fichas órfãs**: É possível ter fichas que não pertencem a nenhum programa

### Arquivos Afetados
- `src/interface/page/area-logada/gerenciar/GerenciarPage.tsx` - Remove seção de fichas
- `src/interface/page/area-logada/gerenciar/EditorFichaPage.tsx` - Requer programaId
- `src/interface/page/area-logada/gerenciar/EditorProgramaPage.tsx` - Já tem lógica correta
- `src/application/state/trainify.state.ts` - Ajustar métodos de ficha
- `src/interface/configuration/routes/rota.ts` - Atualizar rotas
- `src/domain/tipos.ts` - Considerar adicionar programaId na Ficha

## 🔧 Plano de Implementação

### 1. Atualizar Modelo de Dados (Domain)
**Arquivo**: `src/domain/tipos.ts`

```typescript
// Adicionar campo opcional para rastreamento
export interface Ficha {
  id: string;
  nome: string;
  descricao: string;
  icone: NomeIcone;
  emoji?: string;
  exercicios: ExercicioFicha[];
  cardio: EntradaCardio[];
  programaId?: string; // NOVO: ID do programa pai (para consistência)
}
```

### 2. Refatorar Gerenciador de Estado
**Arquivo**: `src/application/state/trainify.state.ts`

**Mudanças:**
- `adicionarFicha`: Adicionar parâmetro `programaId` e automaticamente adicionar ao programa
- `removerPrograma`: **OPCIONAL** - Remover também as fichas do programa (decisão necessária)
- `copiarPrograma`: Copiar também as fichas (não só referências)
- Remover métodos que listam fichas independentemente se não forem necessários

```typescript
// NOVA assinatura
adicionarFicha(
  ficha: Omit<Ficha, "id" | "programaId">,
  programaId: string
): Ficha {
  const nova: Ficha = {
    ...ficha,
    id: crypto.randomUUID(),
    programaId, // Adiciona referência ao programa
  };

  this.estado.fichas.push(nova);

  // Adiciona automaticamente ao programa
  const programa = this.estado.programas.find(p => p.id === programaId);
  if (programa) {
    programa.fichaIds.push(nova.id);
  }

  this.salvarDados();
  this.notificar();
  return nova;
}
```

### 3. Atualizar Repository
**Arquivo**: `src/infrastructure/repo/state/state-manager.repo.ts`

```typescript
// Nova assinatura no repository
adicionarFicha(
  ficha: Omit<Ficha, "id" | "programaId">,
  programaId: string
): Ficha;
```

### 4. Remover Seção de Fichas da GerenciarPage
**Arquivo**: `src/interface/page/area-logada/gerenciar/GerenciarPage.tsx`

**Remover:**
- Seção inteira "Fichas" (linhas 83-128)
- Estado `fichas` (linha 18)
- Handler `handleExcluirFicha` (linhas 170-174)
- Componente `LinhaFichaGerenciar` (linhas 259-328)

**Manter:**
- Seção de Programas (expandida para mostrar fichas dentro)
- Seção de Exercícios Customizados

### 5. Atualizar EditorFichaPage
**Arquivo**: `src/interface/page/area-logada/gerenciar/EditorFichaPage.tsx`

```typescript
interface PropriedadesEditorFichaPage {
  fichaId?: string;
  programaId: string; // NOVO: OBRIGATÓRIO
  aoVoltar: () => void;
}
```

- Remover lógica de ficha independente
- Sempre receber `programaId`
- Ao voltar, voltar para o editor do programa

### 6. Atualizar EditorProgramaPage
**Arquivo**: `src/interface/page/area-logada/gerenciar/EditorProgramaPage.tsx`

- Garantir que o botão "Nova Ficha" sempre passe o `programaId`
- Ao criar ficha, passar o ID do programa atual

### 7. Atualizar Rotas
**Arquivo**: `src/interface/configuration/routes/rota.ts`

**Remover:**
```typescript
CRIAR_FICHA: "/criar-ficha", // Remover - não existe mais
```

**Manter:**
```typescript
EDITAR_FICHA: "/editar-ficha", // Mantém, mas sempre com programaId
```

### 8. Tratamento de Fichas Órfãs (Migração)

**Opção A - Manter para compatibilidade:**
- Fichas existentes sem programa continuam funcionando
- Novas fichas sempre requerem programa

**Opção B - Cleanup agressivo:**
- Remover fichas que não pertencem a nenhum programa
- Usar em `carregarDadosSalvos()`

```typescript
// Cleanup de fichas órfãs ao carregar
private carregarDadosSalvos(): TrainifyState | null {
  // ... código existente ...

  // Remover fichas órfãs
  const fichaIdsEmUso = new Set(
    dados.programas.flatMap(p => p.fichaIds)
  );
  dados.fichas = dados.fichas.filter(f => fichaIdsEmUso.has(f.id));

  return { ... };
}
```

## ✅ Decisões Confirmadas

### 1. Excluir fichas ao excluir programa?
**SIM** ✅ - Fichas são filhas de programas, morrem com o pai

### 2. Copiar fichas ao copiar programa?
**SIM** ✅ - Criar cópias reais das fichas (não só referências)

### 3. Tratamento de fichas órfãs?
**REMOVER no carregamento** ✅ - Limpeza agressiva ao iniciar o app

## 📊 Impacto na UX

### Antes
```
Gerenciar
├── Programas (criar/editar)
├── Fichas (criar/editar independentemente)
└── Exercícios
```

### Depois
```
Gerenciar
├── Programas (criar/editar com fichas embutidas)
└── Exercícios

Editor do Programa
├── Dados do programa
└── Fichas do programa
    ├── [Botão: Nova Ficha]
    ├── Ficha A
    ├── Ficha B
    └── ...
```

## ✅ Critérios de Sucesso

1. [ ] Não é possível criar uma ficha sem selecionar um programa
2. [ ] A página de gerenciamento não mostra mais a seção de fichas
3. [ ] Fichas só são acessadas/editadas através do programa pai
4. [ ] Excluir um programa remove (ou desvincula) suas fichas
5. [ ] Copiar um programa copia também suas fichas
6. [ ] Dados existentes são migrados corretamente (sem perda)

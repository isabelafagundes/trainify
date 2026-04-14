# Padrão de Arquitetura: DDD+

Arquitetura baseada em DDD e Clean Architecture com adaptações práticas.
Agnóstica de linguagem/framework.

---

## Estrutura de Pastas

```
├── domain/
│   └── [subpastas por contexto de domínio, se a linguagem permitir]
├── application/
│   ├── state/
│   ├── usecase/
│   ├── component/
│   ├── service/
│   └── repo/
├── infrastructure/
└── interfaces/
```

---

## Camadas e Dependências

- **Camada 1 (domain):** não importa nada das outras camadas
- **Camada 2 (application):** importa apenas domain
- **Camada 3 (infrastructure + interfaces):** importam domain e application; podem importar entre si

---

## Os 6 Tipos Permitidos (domain + application)

Nas camadas domain e application, apenas estes 6 tipos são permitidos.
Tipos como `util`, `factory`, `mapper`, `helper` são **PROIBIDOS** nessas camadas.

### 1. Objetos de Domínio (`domain/`)

#### Estrutura do objeto Tema

O tema é um objeto de domínio e deve seguir esta estrutura:

```
domain/
└── tema/
    ├── tema.dart           # Classe principal Tema
    ├── cor.dart            # Classe Cor (conversão hex)
    ├── cores.dart          # Classe Cores (paleta completa)
    └── imagens_tema.dart   # Enum ImagensTema
```

**NUNCA** colocar o tema em `interfaces/theme/`.

#### Regras gerais de domínio

- Cada objeto DEVE ser marcado via herança: `Agregado`, `Entidade`, `ObjetoDeValor`, `ServicoDominio` ou `EventoDominio`
- Apenas Agregados possuem repositórios
- Agregados referenciam outros agregados por **CHAVE**, nunca por referência de objeto
- Manipulação de dados sempre via o Agregado raiz, nunca pelos filhos (Entidade/ObjetoDeValor)
- Construtores nomeados obrigatórios:
  - `criar`: valida os dados (para criação de novos objetos)
  - `carregar`: sem validação (para objetos vindos de fonte de dados)
- `carregarDeMapa` obrigatório para conversão de mapa/JSON em objeto de domínio
- `paraMapa` obrigatório para conversão de objeto de domínio em mapa/JSON
- Se o agregado contiver outro objeto de domínio, deve chamar o `carregarDeMapa` desse objeto (nunca converter manualmente no agregado)
- Coleções de objetos de domínio devem ser representadas por um objeto de domínio próprio (ex: `ItemTransferencia` -> `ItensTransferencia`), com `carregarDeMapa` que itera sobre todos os itens
- `ServicoDominio`: regras de negócio que envolvem múltiplos agregados (métodos estáticos)
- `Resumo<NomeObjeto>`: versão resumida do agregado/entidade para listagens (mesma marcação do original)
- Exceptions tipadas declaradas no arquivo do objeto de domínio mais próximo
- Nomes de exceptions **SEM** sufixo "Exception" ou "Error" (ex: usar `ProdutoNaoEncontrado`, nunca `ProdutoNaoEncontradoException`)

### 2. Use Case (`application/usecase/`)

- Limitado a **NO MÁXIMO 1 agregado** (portanto, no máximo 1 repo)
- Preferir agrupar casos de uso de um agregado em uma única classe (ex: `ProdutoUseCase`); dividir em classes mais específicas apenas se o arquivo ficar muito grande (ex: `RegistroItemUseCase`)
- **NÃO** pode chamar outro UseCase (responsabilidade exclusiva do Component)
- **PODE** chamar Services
- **PODE** chamar Repo e State
- Dados manipulados ficam em State, não no próprio UseCase
- Regra de escrita: idealmente 1 UseCase escreve em 1 State; N UseCases podem ler o mesmo State
- Validações de input/formulário ficam aqui (parâmetros: tipos primitivos ou objetos de domínio)

### 3. State (`application/state/`)

- Armazena os dados que os UseCases manipulam
- Pode ser extendido (mixin/herança) ou composto por Components e Views
- States globais (ex: `AutenticacaoState`) são singletons
- Elimina necessidade de bibliotecas de gerenciamento de estado

#### Implementação de States

- **Declaração como `mixin class`**: permite uso tanto como mixin quanto como classe
  ```dart
  mixin class ProdutoState {
    Produto? produtoSelecionado;
    List<ResumoProduto> produtosPesquisados = [];
  }
  ```

- **Composição em Components**: Components compõem múltiplos States via `with`
  ```dart
  class TransferenciaComponent
      with TransferenciaState, CompradorState, ProdutoState, LojaState {
    // ...
  }
  ```

- **Injeção em UseCases**: o State é passado ao UseCase via construtor; UseCase manipula diretamente os campos
  ```dart
  class LojaUseCase {
    final LojaRepo _lojaRepo;
    final LojaState _state;

    const LojaUseCase(this._lojaRepo, this._state);

    Future<void> buscarLojas() async {
      List<Loja> lojas = await _lojaRepo.buscarLojas();
      _state.lojas = lojas;  // manipulação direta
    }
  }
  ```

- **Métodos auxiliares no State**: apenas para operações simples de carga/transformação de dados
  ```dart
  mixin class CompradorState {
    Map<int, Comprador> compradorPorCodigo = {};

    void carregarCompradores(List<Comprador> compradores) {
      compradorPorCodigo.clear();
      compradorPorCodigo = {
        for (var comprador in compradores) comprador.codigo: comprador,
      };
    }

    List<Comprador> get compradoresAsList => compradorPorCodigo.values.toList();
  }
  ```

- **States de paginação reutilizáveis**: `PaginaState<T>` encapsula lógica comum de paginação
  ```dart
  mixin class TransferenciasState {
    final PaginaState<ResumoTransferencia> _paginaResumos = PaginaState();
    PaginaState<ResumoTransferencia> get paginaState => _paginaResumos;
    // filtros, ordenação, etc.
  }
  ```

### 4. Component (`application/component/`)

- Coordena e integra diferentes UseCases, permitindo a interação entre agregados da camada de domínio (cada UseCase é limitado a um agregado)
- Relação **1:1 obrigatória** com interface (1 tela/controller = 1 component)
- Código deve ser "flat" — apenas orquestração, mínima lógica
- Constrói os UseCases que utiliza (via método `inicializar` ou construtor)
- **NUNCA** expor ou retornar State; a interface deve chamar **somente** métodos do Component
- Compõe múltiplos States via mixin (`with`), unificando os dados de diferentes agregados
- Modelado sob medida para a interface, extraindo toda lógica possível da camada de infraestrutura
- Define um `enum` de operações para controle granular de loading (`Set<Operacao>`)
- Cada método público faz seu próprio `try/catch/finally` — sem método `executar` genérico
- `ErroDominio` é sempre re-lançado (já possui mensagem amigável); erros genéricos são logados e re-lançados com mensagem amigável para o usuário

#### Exemplo de Component

Para exemplo completo de Component, usar:

- `Read("references/code-patterns.md")`
- `Read("examples/transferencias.component.dart")`

O padrão esperado é: composição de múltiplos States via `with`, orquestração de múltiplos UseCases, enum de operações para loading granular (`Set<Operacao>`) e tratamento de erro por método público (`try/catch/finally`).

### 5. Service (`application/service/`)

- Interface (apenas contrato) para:
  - a) Inversão de dependência de libs externas
  - b) Terceirização de operações do domínio para outra aplicação (frontend para backend, por exemplo)
  - c) Operações técnicas com múltiplas implementações possíveis
- Implementação fica em `infrastructure/`
- Singleton: obtido via `NomeService.instancia`

#### Exemplo 1: Inversão de dependência de biblioteca

```dart
abstract class CriptografiaService {
  String encriptar(String dado);
  String decriptar(String dadoEncriptado);
}
```

#### Exemplo 2: Terceirização de operações do domínio

Quando operações do domínio precisam ser executadas em outra aplicação (ex: backend), usa-se um Service para manipular entidades internas de um agregado, já que isso não pode ser feito via repositório.

```dart
abstract class CupomService {
  void registrarItem(ItemCupom item);
}
```

#### Exemplo 3: Operação técnica com múltiplas implementações

```dart
abstract class ImpressaoCupomService {
  void imprimirCupom(CupomId cupomId);
}
```

### 6. Repo (`application/repo/`)

- Interface de acesso a dados de Agregados (apenas o contrato)
- Lida **apenas com métodos CRUD** (Criar, Ler, Atualizar, Excluir)
- Manipula **somente a raiz do agregado**, nunca entidades internas
- **Não contém lógica de negócio**, apenas operações de leitura/escrita
- Implementação fica em `infrastructure/` (pode ser banco de dados, API, etc.)
- Singleton: obtido via `NomeRepo.instancia`

#### Exemplo de interface Repo

```dart
abstract class CupomRepo {
  List<Cupom> obterTodos();
  Cupom? obterPorId(CupomId id);
  void salvar(Cupom cupom);
  void excluir(CupomId id);
}
```

**Por que manipular apenas a raiz?** Todas as modificações no agregado devem passar pela entidade raiz, centralizando as regras de negócio. Alterar entidades internas fora do contexto do agregado pode gerar estados inconsistentes.

---

## Nomenclatura de Arquivos

### Domain

```
nome_objeto.ext                      (ex: cupom.dart, cupom_item.dart)
```

### Application

```
usecase:   nome.usecase.ext          (ex: cupom.usecase.dart, registro_item.usecase.dart)
state:     nome.state.ext            (ex: cupom.state.dart)
component: nome.component.ext        (ex: registradora.component.dart)
service:   nome.service.ext          (ex: criptografia.service.dart)
repo:      nome.repo.ext             (ex: cupom.repo.dart)
```

### Infrastructure (implementações)

```
repo:      nome_tecnologia.repo.ext      (ex: cupom_sqlite.repo.ext, cupom_api.repo.ext)
service:   nome_tecnologia.service.ext   (ex: criptografia_bouncy_castle.service.ext)
```

Nota: `api` e `mock` sao tecnologias validas para nomeacao (ex: `cupom_api.repo.ext`, `cupom_mock.repo.ext`, `criptografia_api.service.ext`, `criptografia_mock.service.ext`).

### Padrão de Classes

| Interface | Implementação |
|-----------|---------------|
| `CupomRepo` | `CupomSqliteRepo`, `CupomApiRepo` |
| `CriptografiaService` | `CriptografiaBouncyCastleService` |

---

## Injeção de Dependências

- Via construtor ou método `inicializar`
- **SEM** bibliotecas de DI (nem automáticas como Spring)
- Services e Repos: singletons implementados manualmente (`NomeRepo.instancia`)
- Components, UseCases, States: instanciados conforme uso
  - Views/Controllers constroem Components
  - Components constroem UseCases
  - States: extendidos ou compostos por Views/Components

---

## Infrastructure

- Implementações concretas de Repo e Service
- Clients HTTP, adapters de banco, configs, etc.
- DTOs apenas quando necessário para APIs de terceiros (ficam próximos à implementação do service)

### Repos e Services (Mock e API)

#### Regras

- Implementacoes **mockadas** devem ficar em `infrastructure/repo` ou `infrastructure/service`
- Padrao de nome para mock repo: `{nome do objeto de dominio}_mock.repo.ext`
- Padrao de nome para mock service: `{nome do objeto de dominio}_mock.service.ext`
- Implementacoes **reais (API)** seguem o mesmo local e padrao de nome
- Padrao de nome para API repo: `{nome do objeto de dominio}_api.repo.ext`
- Padrao de nome para API service: `{nome do objeto de dominio}_api.service.ext`

#### Exemplos

Ver exemplos completos em `references/code-patterns.md`:

| Tipo | Arquivo |
|------|---------|
| Mock Repo | [transferencia_mock.repo.dart](../examples/transferencia_mock.repo.dart) |
| Mock Service | [transferencia_mock.service.dart](../examples/transferencia_mock.service.dart) |
| API Repo | [transferencia_api.repo.dart](../examples/transferencia_api.repo.dart) |
| API Service | [transferencia_api.service.dart](../examples/transferencia_api.service.dart) |

---

## Interfaces

- Views (telas), Widgets (componentes de UI), Controllers (API), Resources (implementação de Repo via API)
- Segue convenções do framework utilizado
- Cada interface relacionada a apenas 1 Component
- Nunca vazar tipos de frameworks/bibliotecas para application

---

## Regras Adicionais

- Não adicionar tipos além dos 6 em domain/application
- Não usar bibliotecas de gerenciamento de estado
- Não usar bibliotecas de DI
- Comunicação interna (frontend-backend próprio): usar objetos de domínio, não DTOs
- Comentários apenas para decisões de domínio/arquitetura, nunca para o óbvio
- Não usar abreviações em nomes de variáveis (ex: usar `produtoUseCase`, nunca `produtoUC`)

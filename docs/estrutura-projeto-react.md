# Estrutura de Projeto & Boas Praticas

Guia de organizacao de pastas, componentes, paginas e camadas para projetos frontend com arquitetura limpa. Aplicavel a qualquer dominio.

---

## Estrutura de Pastas

```
src/
├── main.tsx                         # Ponto de entrada da aplicacao
├── constants.ts                     # Constantes globais
│
├── domain/                          # Camada de dominio (modelos e regras de negocio)
│   ├── tema.ts                      # Modelo de tema (cores, fontes, espacamentos)
│   ├── cor.ts                       # Modelo de cores
│   ├── menu-lateral.ts              # Modelo do menu lateral
│   └── {entidade}.ts                # Um arquivo por entidade do dominio
│
├── application/                     # Camada de aplicacao (estado global)
│   └── state/
│       ├── tema.state.ts            # Estado do tema/UI
│       ├── configuracao-api.state.ts
│       └── {entidade}.state.ts      # Um state por contexto necessario
│
├── infrastructure/                  # Camada de infraestrutura (acesso a dados)
│   ├── repo/                        # Repositorios (fontes de dados)
│   │   ├── api/                     # Implementacoes reais (API REST)
│   │   │   └── {entidade}-api.repo.ts
│   │   └── mock/                    # Implementacoes mock (dev/teste)
│   │       └── {entidade}-mock.repo.ts
│   │
│   └── service/                     # Servicos (logica de integracao)
│       ├── api/
│       │   ├── {recurso}-api.service.ts
│       │   ├── http-client.ts       # Cliente HTTP (Axios/Fetch)
│       │   └── interceptor.ts       # Interceptadores de request/response
│       ├── auth/
│       │   └── sessao.service.ts    # Sessao e armazenamento local
│       └── mock/
│           └── {recurso}-mock.service.ts
│
├── interface/                       # Camada de apresentacao (UI)
│   ├── configuration/               # Configuracoes da aplicacao
│   │   ├── guards/                  # Guards de rota (protecao de acesso)
│   │   │   ├── usuario-logado.guard.ts
│   │   │   └── usuario-nao-logado.guard.ts
│   │   ├── module/                  # Injecao de dependencias
│   │   │   └── app.module.ts        # Registro central de servicos/repos
│   │   └── routes/                  # Configuracao de rotas
│   │       ├── app-router.tsx       # Definicao de rotas
│   │       └── rota.ts              # Enum de rotas e paths
│   │
│   ├── page/                        # Paginas (views completas)
│   │   ├── autenticacao/            # Secao de autenticacao (usuario nao logado)
│   │   │   ├── AutenticacaoPage.tsx # Pagina container da secao
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CadastroUsuarioPage.tsx
│   │   │   ├── EsqueceuSenhaPage.tsx
│   │   │   └── AtivarUsuarioPage.tsx
│   │   │
│   │   └── area-logada/             # Area logada (usuario autenticado)
│   │       ├── AreaLogadaPage.tsx    # Layout container da area logada
│   │       ├── HomePage.tsx
│   │       └── {feature}/           # Subpasta por feature/dominio
│   │           ├── {Feature}Page.tsx
│   │           ├── Criar{Feature}Page.tsx
│   │           └── Editar{Feature}Page.tsx
│   │
│   ├── widget/                      # Componentes reutilizaveis
│   │   ├── background/
│   │   │   └── Background.tsx
│   │   ├── barra-pesquisa/
│   │   │   └── BarraPesquisa.tsx
│   │   ├── botao/                   # Variantes de botao
│   │   │   ├── Botao.tsx
│   │   │   ├── BotaoMenu.tsx
│   │   │   ├── BotaoRedondo.tsx
│   │   │   └── DuasEscolhas.tsx
│   │   ├── card/                    # Variantes de card
│   │   │   ├── CardBase.tsx
│   │   │   └── Card{Entidade}.tsx   # Um card por entidade exibivel
│   │   ├── chip/
│   │   │   └── Chip.tsx
│   │   ├── filtro/
│   │   │   └── LayoutFiltro.tsx
│   │   ├── formulario/              # Componentes de formulario
│   │   │   └── Formulario{Entidade}.tsx
│   │   ├── grid/                    # Grids de listagem
│   │   │   └── Grid{Entidade}.tsx
│   │   ├── menu-lateral/
│   │   │   ├── MenuLateral.tsx
│   │   │   ├── ConteudoMenuLateral.tsx
│   │   │   └── BotoesMenuLateral.tsx
│   │   ├── svg/
│   │   │   └── Svg.tsx
│   │   ├── switcher/
│   │   │   └── Switcher.tsx
│   │   ├── texto/
│   │   │   ├── Texto.tsx
│   │   │   └── TextoComIcone.tsx
│   │   ├── {dominio}/              # Componentes especificos de um dominio
│   │   │   └── ...
│   │   │
│   │   │  # Componentes compartilhados na raiz de widget/
│   │   ├── Calendario.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Etapas.tsx
│   │   ├── Input.tsx
│   │   ├── LayoutFlexivel.tsx
│   │   ├── Logo.tsx
│   │   ├── Menu.tsx
│   │   ├── PopUpPadrao.tsx
│   │   └── Tooltip.tsx
│   │
│   └── util/                        # Utilitarios de UI
│       ├── responsive.ts            # Breakpoints e helpers responsivos
│       └── debouncer.ts             # Utilitario de debounce
│
└── assets/                          # Recursos estaticos
    ├── fonts/                       # Fontes (organizadas por familia)
    ├── png/                         # Imagens raster
    └── svg/                         # Icones e ilustracoes SVG
        └── {contexto}/              # Subpastas por contexto de uso
```

> **Nota:** `{entidade}`, `{feature}`, `{recurso}`, `{dominio}` e `{contexto}` sao placeholders. Substitua pelo vocabulario do seu projeto.

---

## Convencoes de Nomenclatura

| Tipo             | Sufixo/Padrao              | Exemplo                          |
|------------------|----------------------------|----------------------------------|
| Pagina           | `*Page.tsx`                | `LoginPage.tsx`                  |
| Componente       | `PascalCase.tsx`           | `CardBase.tsx`                   |
| Repositorio      | `*-api.repo.ts`            | `produto-api.repo.ts`            |
| Repositorio Mock | `*-mock.repo.ts`           | `produto-mock.repo.ts`           |
| Servico          | `*.service.ts`             | `autenticacao-api.service.ts`    |
| Estado           | `*.state.ts`               | `tema.state.ts`                  |
| Guard            | `*.guard.ts`               | `usuario-logado.guard.ts`        |
| Utilitario       | `*.ts` (kebab-case)        | `responsive.ts`                  |
| Modelo (domain)  | `*.ts` (kebab-case)        | `menu-lateral.ts`                |

**Regra geral:** arquivos de componente/pagina usam `PascalCase`, todo o resto usa `kebab-case`.

---

## Principios de Arquitetura

### 1. Separacao em Camadas

```
domain/           → Modelos puros, sem dependencia de framework ou UI
application/      → Estado global e logica de aplicacao
infrastructure/   → Acesso a dados, APIs, armazenamento
interface/        → Tudo que e visual (paginas, componentes, rotas)
```

Cada camada so depende das camadas internas (domain nao depende de nada, interface depende de todas).

### 2. Repositorios com Implementacao Dupla (API + Mock)

Toda fonte de dados possui duas implementacoes sob a mesma interface:

```
repo/
├── api/       # Chamadas reais ao backend
└── mock/      # Dados ficticios para desenvolvimento e testes
```

A troca entre API e Mock e feita em um unico ponto (`app.module.ts`), sem alterar nenhuma pagina ou componente.

### 3. Servicos Separados por Responsabilidade

```
service/
├── api/       # Servicos que dependem de rede (HTTP client, interceptors)
├── auth/      # Sessao, tokens, armazenamento local
└── mock/      # Versoes mock dos servicos
```

### 4. Guards de Rota

Logica de protecao de acesso centralizada em `configuration/guards/`:

- `usuario-logado.guard.ts` — redireciona para login se nao autenticado
- `usuario-nao-logado.guard.ts` — redireciona para home se ja autenticado

### 5. Injecao de Dependencias Centralizada

`app.module.ts` funciona como ponto unico de registro. Paginas e componentes nunca instanciam servicos ou repositorios diretamente — sempre consomem via module.

---

## Organizacao de Componentes

### Componentes Compartilhados vs. Especificos

| Local                          | Uso                                         |
|--------------------------------|---------------------------------------------|
| `widget/` (raiz)              | Componentes globais usados em varias paginas |
| `widget/{categoria}/`         | Agrupados por tipo (botao, card, grid, etc.) |
| `widget/formulario/`          | Formularios reutilizaveis                    |
| `widget/{dominio}/`           | Componentes especificos de um dominio        |

### Hierarquia de Componentes

```
Pagina (page/)
└── Componentes de conteudo (widget/ com prefixo "Conteudo")
    └── Componentes atomicos (widget/botao/, widget/card/, etc.)
```

### Prefixos para Componentes

| Prefixo       | Significado                                        |
|---------------|----------------------------------------------------|
| `Conteudo*`   | Secao/bloco de conteudo dentro de uma pagina       |
| `Formulario*` | Formulario completo ou parcial                     |
| `Card*`       | Cartao de exibicao de uma entidade                 |
| `Grid*`       | Grade/lista de elementos                           |
| `Layout*`     | Componente estrutural/container                    |
| `Botao*`      | Variante de botao                                  |

---

## Sistema de Tema

### Modelo de Tema (`domain/tema.ts`)

O tema e definido como modelo de dominio com as seguintes propriedades:

```
Cores:         accent, primary, secondary, error, warning, success, base, neutral
Border Radius: P (4), M (8), G (16), XG (24)
Font Sizes:    P (14), M (16), G (20), XG (24)  — com modo fonte grande
Font Families: principal (corpo), secundaria (destaques)
Espacamento:   valor padrao unico
```

### Gestao de Tema (`application/state/tema.state.ts`)

- Instancia singleton com temas pre-definidos (claro e escuro)
- Persiste preferencia do usuario em armazenamento local
- Suporta modo de fonte grande para acessibilidade

---

## Design Responsivo

Utilitario centralizado em `interface/util/responsive.ts`:

- Breakpoints definidos (mobile, tablet, desktop)
- Helpers para calculo de padding e largura maxima
- Abordagem mobile-first

---

## Arvore de Navegacao (modelo)

A arvore abaixo e um **modelo de referencia**. Adapte as rotas ao dominio do seu projeto.

```
Raiz
├── AUTENTICACAO (protegida: redireciona logados para home)
│   ├── /login              (inicial)
│   ├── /cadastro
│   ├── /esqueceu-senha
│   └── /ativar-usuario
│
└── AREA LOGADA (protegida: redireciona nao-logados para login)
    ├── /home               (inicial)
    ├── /{entidade}
    ├── /criar-{entidade}
    ├── /editar-{entidade}
    ├── /detalhes-{entidade}
    ├── /perfil
    └── /editar-perfil
```

> **Padrao de rotas CRUD por entidade:** `/{entidade}` (lista), `/criar-{entidade}` (criacao), `/editar-{entidade}` (edicao), `/detalhes-{entidade}` (visualizacao).

---

## Exemplo Aplicado: App de Emprestimo de Livros

Para ilustrar como a estrutura se aplica a um dominio concreto, segue um exemplo baseado em um app de emprestimo de livros. **Substitua as entidades pelas do seu projeto.**

<details>
<summary>Ver exemplo completo</summary>

### Repositorios

```
infrastructure/repo/
├── api/
│   ├── usuario-api.repo.ts
│   ├── livro-api.repo.ts
│   ├── solicitacao-api.repo.ts
│   ├── categoria-api.repo.ts
│   ├── comentario-api.repo.ts
│   ├── endereco-api.repo.ts
│   └── notificacao-api.repo.ts
└── mock/
    ├── usuario-mock.repo.ts
    ├── livro-mock.repo.ts
    ├── solicitacao-mock.repo.ts
    └── ...
```

### Paginas

```
interface/page/area-logada/
├── HomePage.tsx
├── livro/
│   ├── LivroPage.tsx
│   ├── CriarLivroPage.tsx
│   └── EditarLivroPage.tsx
├── solicitacao/
│   ├── CriarSolicitacaoPage.tsx
│   ├── EditarSolicitacaoPage.tsx
│   ├── DetalhesSolicitacaoPage.tsx
│   └── HistoricoSolicitacaoPage.tsx
└── usuario/
    ├── UsuarioPage.tsx
    ├── PerfilPage.tsx
    └── EditarPerfilPage.tsx
```

### Componentes

```
interface/widget/
├── card/
│   ├── CardBase.tsx
│   ├── CardLivro.tsx
│   ├── CardComentario.tsx
│   ├── CardSolicitacao.tsx
│   └── CardUsuario.tsx
├── formulario/
│   ├── FormularioUsuario.tsx
│   └── FormularioLivro.tsx
├── grid/
│   ├── GridComentarios.tsx
│   ├── GridLivros.tsx
│   └── GridUsuarios.tsx
└── solicitacao/                  # Componentes especificos do dominio "solicitacao"
    ├── ConteudoEnderecoSolicitacao.tsx
    ├── FormularioEndereco.tsx
    └── FormularioInformacoesAdicionais.tsx
```

### Rotas

```
/login, /cadastro, /esqueceu-senha, /ativar-usuario
/home
/livro, /criar-livro, /editar-livro
/criar-solicitacao, /editar-solicitacao, /detalhes-solicitacao, /historico
/usuario, /perfil, /editar-perfil
/calendario, /aceite-solicitacao
```

</details>

---

## Checklist de Boas Praticas

- [ ] Toda fonte de dados tem implementacao mock e API
- [ ] Troca entre mock/API ocorre em um unico arquivo (module)
- [ ] Paginas nao instanciam servicos diretamente
- [ ] Componentes reutilizaveis ficam em `widget/`, agrupados por tipo
- [ ] Componentes especificos de dominio ficam em subpastas proprias
- [ ] Guards de rota protegem paginas por estado de autenticacao
- [ ] Tema e definido como modelo de dominio, nao como CSS solto
- [ ] Breakpoints e responsividade centralizados em utilitario
- [ ] Prefixos consistentes nos nomes de componentes (Card, Grid, Layout, Conteudo, Formulario)
- [ ] Assets organizados por tipo (fonts, svg, png) e por contexto

---

## Fluxo de Dados

```
Page  →  Service/Module  →  Repository  →  API / Mock
 ↑                                              ↓
 └──────────── Estado Global (State) ───────────┘
```

A pagina nunca acessa a API diretamente. O fluxo sempre passa por:
1. **Service** — orquestra a logica
2. **Repository** — busca/persiste os dados
3. **State** — armazena e distribui o estado para a UI

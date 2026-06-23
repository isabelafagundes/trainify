# Trainify

Trainify é um aplicativo privado para organizar, executar e acompanhar treinos de musculação e cardio. A ideia central é simples: o usuário abre o app, entende qual treino fazer, registra a sessão com o mínimo de fricção e acompanha sua constância ao longo do tempo.

O projeto nasceu como um tracker pessoal de treino, mas com cuidado de produto: programas, fichas, histórico, progressão e estatísticas conversam entre si para transformar o treino do dia em um registro útil para as próximas sessões.

## Objetivo

O objetivo do Trainify é ajudar a manter consistência no treino sem transformar a experiência em um painel complexo demais. O app prioriza ação rápida, clareza e progressão prática:

- Saber qual ficha executar dentro do programa ativo.
- Registrar séries, repetições, cargas, descanso, notas e cardio durante a sessão.
- Consultar histórico e progressão por exercício.
- Manter programas e fichas reaproveitáveis, editáveis e fáceis de copiar.
- Reforçar frequência e sequência de treinos de forma discreta.

## Tom do app

O Trainify tem um tom calmo, direto e determinado. Ele evita a linguagem exagerada comum em apps fitness e prefere uma experiência mais limpa, acolhedora e focada.

A interface segue uma estética mobile-first inspirada em produtos de produtividade: bastante clareza visual, hierarquia simples, microinterações contidas e elementos de personalidade apenas quando ajudam o usuário a se orientar. O app deve parecer um parceiro de rotina, não um treinador gritando metas.

## Tecnologias principais

- **React 19**: base da interface e dos fluxos de tela.
- **TypeScript**: tipagem dos modelos de domínio, estado e componentes.
- **Vite**: build tooling do frontend.
- **Tailwind CSS 4**: sistema de estilos, tokens visuais e composição da UI.
- **React Router DOM 7**: roteamento entre treinos, histórico, estatísticas, gerenciar, execução e editores.
- **Capacitor 7**: empacotamento mobile para Android e iOS, além de integrações nativas.
- **Capacitor Preferences e Filesystem**: persistência local e suporte a backup/exportação de dados.
- **Capacitor Haptics, Local Notifications, Keyboard, Safe Area e Splash Screen**: acabamento mobile, feedback tátil, notificações e adaptação a áreas seguras.
- **Vitest e Testing Library**: testes unitários e de comportamento para regras de estado, utilitários e hooks.
- **ESLint**: padronização e verificação estática do código.

## Arquitetura

O código segue uma organização em camadas, mantendo regras de negócio, estado, infraestrutura e interface separadas:

- `src/domain`: modelos e tipos centrais do domínio, como programa, ficha, exercício, cardio e registro de treino.
- `src/application`: estado global e serviços de aplicação, incluindo gerenciamento dos dados de treino e snapshots.
- `src/infrastructure`: repositórios, mocks, persistência local, backup, notificações e integrações com Capacitor.
- `src/interface`: páginas, rotas, layout, componentes reutilizáveis e utilitários visuais.

Essa separação permite evoluir a interface, trocar fontes de dados ou adicionar integrações sem espalhar regra de negócio pelas telas.

## Principais requisitos funcionais

- Criar, editar, copiar, ativar e excluir programas de treino.
- Permitir apenas um programa ativo por vez.
- Criar, editar, copiar e excluir fichas de treino.
- Vincular uma ou mais fichas a programas.
- Manter fichas independentes dos programas, permitindo reutilização.
- Cadastrar exercícios customizados além da biblioteca padrão.
- Montar fichas com exercícios, séries, repetições, uso de carga e tempo de descanso.
- Adicionar cardio opcional em uma ficha, com tipo, duração e nota.
- Executar uma ficha em modo de treino, registrando séries, repetições e cargas.
- Permitir adicionar ou remover séries durante a execução.
- Exibir timer de descanso configurado por exercício.
- Registrar notas por exercício e por cardio.
- Finalizar sessões salvando data, horário de início, horário de fim, exercícios e cardio.
- Exibir histórico de treinos realizados.
- Abrir o detalhe de um treino do histórico.
- Mostrar progressão por exercício com base em sessões anteriores.
- Exibir estatísticas gerais de frequência e evolução.
- Acompanhar sequência de treinos e atividade semanal.
- Persistir os dados localmente no dispositivo.
- Exportar/importar snapshots ou backups dos dados do usuário.
- Oferecer feedbacks discretos de conclusão, desfazer e celebração.

## Direção de produto

O Trainify privilegia a rotina real: treinos mudam, cargas variam, fichas são copiadas, exercícios são adaptados e nem todo dia precisa virar uma análise profunda. Por isso, a experiência deve continuar leve mesmo quando o histórico cresce.

O sucesso do app não é fazer o usuário passar mais tempo nele. É fazer com que ele consiga treinar melhor, registrar o necessário e voltar para a vida.

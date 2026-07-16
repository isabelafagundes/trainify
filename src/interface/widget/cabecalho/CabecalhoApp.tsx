import { useState, type ReactNode } from "react";
import { snapshotService } from "@/application/snapshot/snapshot.service";
import { temaManager } from "@/application/state/tema.state";
import { usuarioManager } from "@/application/state/usuario.state";
import type { SnapshotPezzo } from "@/domain/snapshot";
import type { Tema } from "@/domain/tema";
import { AVATAR_EMOJI_PADRAO } from "@/domain/usuario";
import { appModule } from "@/interface/configuration/module/app.module";
import { ModalConfirmacao } from "@/interface/widget/modal/ModalConfirmacao";
import { Icone } from "@/interface/widget/svg/Icone";
import { FormularioPerfil } from "@/interface/widget/formulario/FormularioPerfil";
import { useToast } from "@/interface/widget/toast";

interface PropriedadesCabecalhoApp {
  tituloTela: string;
  acaoDireita?: ReactNode;
  onBack?: () => void;
  nomeUsuario?: string;
  avatarEmoji?: string;
  /** Drawer de preferências — opcionalmente controlado de fora para também ser
      acionável pela barra lateral do desktop. Sem essas props, o cabeçalho
      gerencia o próprio estado (modo autônomo). */
  menuAberto?: boolean;
  aoAbrirMenu?: () => void;
  aoFecharMenu?: () => void;
}

function AmostraTema({ tema }: { tema: Tema }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-borda-suave"
      aria-hidden="true"
    >
      <span
        className="h-full flex-1"
        style={{ backgroundColor: tema.variaveis["--color-fundo"] }}
      />
      <span
        className="h-full flex-1"
        style={{ backgroundColor: tema.variaveis["--color-acento"] }}
      />
    </span>
  );
}

export function CabecalhoApp({ tituloTela, acaoDireita, onBack, nomeUsuario, avatarEmoji, menuAberto, aoAbrirMenu, aoFecharMenu }: PropriedadesCabecalhoApp) {
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [menuInternoAberto, setMenuInternoAberto] = useState(false);
  const [seletorTemaAberto, setSeletorTemaAberto] = useState(false);

  // Controlado (props) tem prioridade; senão, estado interno.
  const menuAbertoEfetivo = menuAberto ?? menuInternoAberto;
  const abrirMenu = aoAbrirMenu ?? (() => setMenuInternoAberto(true));
  const [temaAtualId, setTemaAtualId] = useState(() => temaManager.obterTema().id);
  const [exportandoDados, setExportandoDados] = useState(false);
  const [selecionandoArquivo, setSelecionandoArquivo] = useState(false);
  const [importandoDados, setImportandoDados] = useState(false);
  const [snapshotPendente, setSnapshotPendente] = useState<SnapshotPezzo | null>(null);
  const temas = temaManager.listarTemas();
  const temaAtual = temas.find((tema) => tema.id === temaAtualId) ?? temaManager.obterTema();
  const emoji = avatarEmoji || AVATAR_EMOJI_PADRAO;
  const { showSuccess, showError } = useToast();

  function selecionarTema(tema: Tema) {
    temaManager.definirTema(tema);
    setTemaAtualId(tema.id);
    setSeletorTemaAberto(false);
  }

  function fecharMenu() {
    if (aoFecharMenu) aoFecharMenu();
    else setMenuInternoAberto(false);
    setEditandoPerfil(false);
    setSeletorTemaAberto(false);
  }

  function salvarPerfil(dados: { nome: string; avatarEmoji: string }) {
    usuarioManager.definirUsuario(dados);
    setEditandoPerfil(false);
  }

  async function exportarDados() {
    setExportandoDados(true);
    try {
      const snapshot = await snapshotService.exportarSnapshot();
      const nomeArquivo = await appModule.backupArquivo.exportar(
        snapshotService.serializar(snapshot)
      );
      showSuccess(`Dados exportados em ${nomeArquivo}.`);
    } catch {
      showError("Nao foi possivel exportar seus dados.");
    } finally {
      setExportandoDados(false);
    }
  }

  async function iniciarImportacao() {
    setSelecionandoArquivo(true);
    try {
      const texto = await appModule.backupArquivo.importar();
      if (!texto) return;

      setSnapshotPendente(snapshotService.desserializar(texto));
    } catch (erro) {
      showError(mensagemErroBackup(erro));
    } finally {
      setSelecionandoArquivo(false);
    }
  }

  async function confirmarImportacao() {
    if (!snapshotPendente) return;

    setImportandoDados(true);
    try {
      await snapshotService.importarSnapshot(snapshotPendente, "substituir");
      setSnapshotPendente(null);
      fecharMenu();
      showSuccess("Dados importados com sucesso.");
    } catch (erro) {
      showError(mensagemErroBackup(erro));
    } finally {
      setImportandoDados(false);
    }
  }

  function cancelarImportacao() {
    if (importandoDados) return;
    setSnapshotPendente(null);
  }

  function mensagemErroBackup(erro: unknown): string {
    if (!(erro instanceof Error)) {
      return "Nao foi possivel importar seus dados.";
    }

    if (erro.message.includes("versao mais nova")) {
      return "Este backup foi criado por uma versao mais nova do Pezzo.";
    }

    if (erro.message.includes("schema") || erro.message.includes("Versao")) {
      return "Este arquivo nao parece ser um backup compativel do Pezzo.";
    }

    if (
      erro.message.includes("invalido") ||
      erro.message.includes("invalid") ||
      erro.message.includes("JSON")
    ) {
      return "Nao consegui ler esse backup. Confira se o arquivo JSON esta correto.";
    }

    return erro.message || "Nao foi possivel importar seus dados.";
  }

  const operacaoDadosEmAndamento =
    exportandoDados || selecionandoArquivo || importandoDados;

  return (
    <>
      {/* Scrim glass de largura total: o conteúdo da rolagem some suavemente
          atrás de um blur/gradiente no topo, cobrindo a área da status bar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 right-0 top-0 z-30 w-full lg:hidden"
        style={{
          height: "calc(var(--safe-top) + 72px)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "linear-gradient(to bottom, var(--color-fundo) 35%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
        }}
      />
      <div className="fixed left-0 right-0 top-0 z-40 mx-auto w-full max-w-[480px] md:max-w-[768px] lg:hidden px-5 pt-[max(var(--safe-top),8px)] pb-1">
        <header className="
          flex items-center justify-between gap-3
          px-4 py-3
          bg-superficie/70 backdrop-blur-xl backdrop-saturate-150
          border border-borda-suave/60
          rounded-2xl
          shadow-md shadow-black/[0.04]
        ">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Voltar"
              className="flex-shrink-0 w-10 h-10 rounded-lg border border-borda-forte bg-superficie-suave shadow-sm shadow-black/[0.04] flex items-center justify-center text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario hover:border-acento active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento transition-all duration-150"
            >
              <Icone nome="setaEsquerda" tamanho={16} />
            </button>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-bold text-texto-sutil uppercase tracking-[0.08em] font-display flex-shrink-0 lg:hidden">
              Pezzo
            </span>
            <span className="text-texto-sutil/30 text-[10px] flex-shrink-0 lg:hidden">/</span>
            <h1 className="text-sm font-semibold text-texto-primario tracking-tight font-display truncate">
              {tituloTela}
            </h1>
          </div>
        </div>
        {nomeUsuario ? (
          <button
            type="button"
            onClick={abrirMenu}
            className="
              flex-shrink-0 relative group cursor-pointer
              p-1 -m-1
              rounded-full
              active:scale-[0.95]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento
              transition-transform duration-150
            "
            aria-label={`Perfil de ${nomeUsuario}`}
          >
            <span className="flex w-8 h-8 items-center justify-center rounded-full bg-acento-suave text-lg ring-[1.5px] ring-borda-suave group-hover:ring-acento/30 transition-all duration-200">
              {emoji}
            </span>
            <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-acento ring-[1.5px] ring-superficie" />
          </button>
        ) : (
          acaoDireita
        )}
        </header>
      </div>

      {/* Drawer de preferências — irmão da barra (não some no desktop, onde a
          barra fica oculta): pode ser aberto pelo perfil da barra lateral. */}
      {menuAbertoEfetivo && nomeUsuario && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label="Preferências do usuário"
        >
          <button
            type="button"
            aria-label="Fechar preferências"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={fecharMenu}
          />

          <aside className="
            absolute right-0 top-0 h-full w-[82%] max-w-[340px]
            bg-superficie border-l border-borda
            shadow-2xl shadow-black/15
            overflow-y-auto px-5 pb-[max(var(--safe-bottom),20px)] pt-[max(var(--safe-top),20px)]
            animate-slide-in-right
          ">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex w-10 h-10 items-center justify-center rounded-full bg-acento-suave text-xl ring-[1.5px] ring-borda-suave">
                  {emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-texto-primario truncate">
                    {nomeUsuario}
                  </p>
                  <p className="text-xs text-texto-secundario">
                    Preferências
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={fecharMenu}
                className="w-9 h-9 rounded-lg bg-superficie-suave text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario flex items-center justify-center transition-colors"
              >
                <Icone nome="fechar" tamanho={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEditandoPerfil(true)}
              className="mt-6 w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-borda-suave bg-superficie-suave text-left text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario transition-colors"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icone nome="editar" tamanho={16} />
                <span className="truncate text-sm font-medium">Editar perfil</span>
              </span>
              <Icone nome="setaDireita" tamanho={14} />
            </button>

            <div className="mt-7 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-texto-sutil">
                Tema
              </h2>

              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={seletorTemaAberto}
                  onClick={() => setSeletorTemaAberto((aberto) => !aberto)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-borda-suave bg-superficie-suave px-3 py-3 text-left text-texto-primario transition-colors hover:bg-superficie-hover"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <AmostraTema tema={temaAtual} />
                    <span className="truncate text-sm font-medium">{temaAtual.nome}</span>
                  </span>
                  <span className={`text-texto-sutil transition-transform ${seletorTemaAberto ? "rotate-180" : ""}`}>
                    <Icone nome="setaBaixo" tamanho={16} />
                  </span>
                </button>

                {seletorTemaAberto && (
                  <div
                    role="listbox"
                    aria-label="Selecionar tema"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border border-borda bg-superficie-elevada p-1.5 shadow-xl shadow-black/15"
                  >
                    {temas.map((tema) => {
                      const ativo = tema.id === temaAtualId;
                      return (
                        <button
                          key={tema.id}
                          type="button"
                          role="option"
                          aria-selected={ativo}
                          onClick={() => selecionarTema(tema)}
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                            ativo
                              ? "bg-acento-suave text-texto-primario"
                              : "text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <AmostraTema tema={tema} />
                            <span className="truncate text-sm font-medium">{tema.nome}</span>
                          </span>
                          {ativo && <Icone nome="listaVerificacao" tamanho={16} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-texto-sutil">
                Dados
              </h2>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={exportarDados}
                  disabled={operacaoDadosEmAndamento}
                  className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-borda-suave bg-superficie-suave text-left text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icone nome="clipboard" tamanho={16} />
                    <span className="truncate text-sm font-medium">
                      {exportandoDados ? "Exportando..." : "Exportar dados"}
                    </span>
                  </span>
                  <Icone nome="setaDireita" tamanho={14} />
                </button>

                <button
                  type="button"
                  onClick={iniciarImportacao}
                  disabled={operacaoDadosEmAndamento}
                  className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-borda-suave bg-superficie-suave text-left text-texto-secundario hover:bg-superficie-hover hover:text-texto-primario disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icone nome="setaBaixo" tamanho={16} />
                    <span className="truncate text-sm font-medium">
                      {importandoDados ? "Importando..." : "Importar dados"}
                    </span>
                  </span>
                  <Icone nome="setaDireita" tamanho={14} />
                </button>
              </div>
            </div>
          </aside>

          {editandoPerfil && (
            <section
              className="absolute inset-0 z-20 flex flex-col bg-superficie animate-slide-in-right md:left-auto md:w-full md:max-w-[560px] md:border-l md:border-borda md:shadow-2xl"
              aria-label="Editar perfil"
            >
              <header className="flex shrink-0 items-center gap-3 border-b border-borda px-5 pb-4 pt-[max(var(--safe-top),16px)]">
                <button
                  type="button"
                  onClick={() => setEditandoPerfil(false)}
                  aria-label="Voltar para preferências"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-superficie-suave text-texto-secundario transition-colors hover:bg-superficie-hover hover:text-texto-primario"
                >
                  <Icone nome="setaEsquerda" tamanho={18} />
                </button>
                <div>
                  <h2 className="font-display text-xl font-bold text-texto-primario">
                    Editar perfil
                  </h2>
                  <p className="text-xs text-texto-secundario">
                    Atualize seu nome e avatar
                  </p>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(var(--safe-bottom),24px)] pt-7">
                <div className="mx-auto w-full max-w-[480px]">
                  <FormularioPerfil
                    nomeInicial={nomeUsuario}
                    avatarInicial={emoji}
                    textoBotao="Salvar perfil"
                    aoSalvar={salvarPerfil}
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      )}
      <ModalConfirmacao
        aberto={snapshotPendente !== null}
        titulo="Importar dados"
        descricao="Isto vai substituir seus dados atuais neste aparelho. Tem certeza que deseja continuar?"
        textoConfirmar={importandoDados ? "Importando..." : "Importar"}
        textoCancelar="Cancelar"
        variant="atencao"
        aoConfirmar={confirmarImportacao}
        aoCancelar={cancelarImportacao}
      />
      {importandoDados && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Importando dados"
        >
          <div className="flex min-w-[220px] flex-col items-center rounded-2xl border border-borda bg-superficie p-6 shadow-2xl shadow-black/20">
            <span
              className="h-9 w-9 rounded-full border-2 border-acento/25 border-t-acento animate-spin"
              aria-hidden="true"
            />
            <p className="mt-4 text-sm font-semibold text-texto-primario">
              Importando dados...
            </p>
          </div>
        </div>
      )}
    </>
  );
}

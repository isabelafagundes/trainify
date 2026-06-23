import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export interface BackupArquivoService {
  exportar(conteudo: string): Promise<string>;
  importar(): Promise<string | null>;
}

function criarNomeArquivo(): string {
  const data = new Date().toISOString().slice(0, 10);
  return `trainify-backup-${data}.json`;
}

function selecionarArquivoTexto(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.style.display = "none";

    input.onchange = () => {
      const arquivo = input.files?.[0];
      input.remove();
      if (!arquivo) {
        resolve(null);
        return;
      }

      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result ?? ""));
      leitor.onerror = () => reject(new Error("Nao foi possivel ler o arquivo."));
      leitor.readAsText(arquivo);
    };

    document.body.appendChild(input);
    input.click();
  });
}

class BackupArquivoWeb implements BackupArquivoService {
  async exportar(conteudo: string): Promise<string> {
    const nomeArquivo = criarNomeArquivo();
    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return nomeArquivo;
  }

  async importar(): Promise<string | null> {
    return selecionarArquivoTexto();
  }
}

class BackupArquivoCapacitor implements BackupArquivoService {
  async exportar(conteudo: string): Promise<string> {
    const nomeArquivo = criarNomeArquivo();

    await Filesystem.writeFile({
      path: nomeArquivo,
      data: conteudo,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    const { uri } = await Filesystem.getUri({
      path: nomeArquivo,
      directory: Directory.Cache,
    });

    await Share.share({
      title: "Backup Trainify",
      text: "Backup dos seus dados do Trainify.",
      url: uri,
      dialogTitle: "Exportar dados",
    });

    return nomeArquivo;
  }

  async importar(): Promise<string | null> {
    return selecionarArquivoTexto();
  }
}

export function criarBackupArquivoService(): BackupArquivoService {
  return Capacitor.isNativePlatform()
    ? new BackupArquivoCapacitor()
    : new BackupArquivoWeb();
}

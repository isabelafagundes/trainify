import { STORAGE_KEYS } from "@/constants";
import { appModule } from "@/interface/configuration/module/app.module";

export async function obterInstalacaoId(): Promise<string> {
  const existente = await appModule.armazenamento.obter(STORAGE_KEYS.INSTALACAO_ID);
  if (existente) return existente;

  const novo = crypto.randomUUID();
  await appModule.armazenamento.definir(STORAGE_KEYS.INSTALACAO_ID, novo);
  return novo;
}

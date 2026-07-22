import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function blobBase64(blob: Blob) { return new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(r.error);r.onload=()=>resolve(String(r.result).split(",")[1]);r.readAsDataURL(blob);}); }
export interface OpcoesCompartilhamentoResultado {
  titulo?: string;
  texto?: string;
  tituloDialogo?: string;
}

export async function compartilharResultado(
  blob: Blob,
  nomeArquivo: string,
  opcoes: OpcoesCompartilhamentoResultado = {},
) {
  const titulo = opcoes.titulo ?? "Meu treino no Kynori";
  const texto = opcoes.texto ?? "Treino concluído no Kynori 💪";
  const tituloDialogo = opcoes.tituloDialogo ?? "Compartilhar resultado";
  try {
    if(Capacitor.isNativePlatform()){const path=`resultados/${nomeArquivo}`;await Filesystem.writeFile({path,data:await blobBase64(blob),directory:Directory.Cache,recursive:true});const {uri}=await Filesystem.getUri({path,directory:Directory.Cache});await Share.share({title:titulo,text:texto,url:uri,dialogTitle:tituloDialogo});return;}
    const file=new File([blob],nomeArquivo,{type:"image/jpeg"}); if(navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({title:titulo,text:texto,files:[file]});return;} const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=nomeArquivo;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  } catch(erro) { if(erro instanceof DOMException&&erro.name==="AbortError")return; const message=erro instanceof Error?erro.message:String(erro);if(/cancel/i.test(message))return;throw erro; }
}

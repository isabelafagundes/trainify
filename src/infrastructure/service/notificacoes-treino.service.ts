import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export interface AgendamentoLembreteTreino {
  titulo: string;
  corpo: string;
  hora: number;
  minuto: number;
}

export interface NotificacoesTreinoService {
  solicitarPermissao(): Promise<boolean>;
  agendarLembreteDiario(lembrete: AgendamentoLembreteTreino): Promise<void>;
  cancelarLembretes(): Promise<void>;
}

class NotificacoesTreinoWeb implements NotificacoesTreinoService {
  async solicitarPermissao(): Promise<boolean> {
    return false;
  }

  async agendarLembreteDiario(): Promise<void> {
    return undefined;
  }

  async cancelarLembretes(): Promise<void> {
    return undefined;
  }
}

class NotificacoesTreinoCapacitor implements NotificacoesTreinoService {
  private readonly idLembreteDiario = 101;

  async solicitarPermissao(): Promise<boolean> {
    const atual = await LocalNotifications.checkPermissions();
    if (atual.display === "granted") return true;

    const solicitado = await LocalNotifications.requestPermissions();
    return solicitado.display === "granted";
  }

  async agendarLembreteDiario(lembrete: AgendamentoLembreteTreino): Promise<void> {
    const permitido = await this.solicitarPermissao();
    if (!permitido) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.idLembreteDiario,
          title: lembrete.titulo,
          body: lembrete.corpo,
          schedule: {
            on: {
              hour: lembrete.hora,
              minute: lembrete.minuto,
            },
            repeats: true,
          },
        },
      ],
    });
  }

  async cancelarLembretes(): Promise<void> {
    await LocalNotifications.cancel({
      notifications: [{ id: this.idLembreteDiario }],
    });
  }
}

export function criarNotificacoesTreinoService(): NotificacoesTreinoService {
  return Capacitor.isNativePlatform()
    ? new NotificacoesTreinoCapacitor()
    : new NotificacoesTreinoWeb();
}

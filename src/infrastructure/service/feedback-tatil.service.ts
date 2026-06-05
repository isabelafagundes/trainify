import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export interface FeedbackTatilService {
  impactoMedio(): Promise<void>;
  sucesso(): Promise<void>;
}

class FeedbackTatilWeb implements FeedbackTatilService {
  async impactoMedio(): Promise<void> {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(30);
    }
  }

  async sucesso(): Promise<void> {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([60, 40, 60]);
    }
  }
}

class FeedbackTatilCapacitor implements FeedbackTatilService {
  async impactoMedio(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  async sucesso(): Promise<void> {
    await Haptics.notification({ type: NotificationType.Success });
  }
}

export function criarFeedbackTatilService(): FeedbackTatilService {
  return Capacitor.isNativePlatform()
    ? new FeedbackTatilCapacitor()
    : new FeedbackTatilWeb();
}

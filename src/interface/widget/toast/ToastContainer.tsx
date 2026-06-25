import { Toast } from "./Toast";

interface ToastItem {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed right-5 top-[max(calc(var(--safe-top)+10px),20px)] z-[10000] flex flex-col gap-2.5 pointer-events-none max-sm:right-2.5 max-sm:left-2.5">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
}

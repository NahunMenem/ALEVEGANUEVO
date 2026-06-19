import { redirect } from "next/navigation";
import { LogoutForm } from "@/components/logout-form";
import { getSession } from "@/lib/auth";
import { getSystemAccessStatus } from "@/lib/system-access";
import { formatCurrency } from "@/lib/utils";

function formatDateOnly(value: string | null) {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export default async function SistemaVencidoPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const status = await getSystemAccessStatus();
  if (!status.blocked) {
    redirect("/inicio");
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Alejandro Vega";

  return (
    <main className="hero">
      <div className="hero-card" style={{ display: "block", maxWidth: 680 }}>
        <section className="hero-form">
          <div className="stack">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={appName} className="hero-logo-image" src="/logo.png" />
            <div className="pill">{status.reason === "suspendido" ? "Sistema suspendido" : "Sistema vencido"}</div>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>Acceso temporalmente bloqueado</h1>
            <p className="muted">
              El abono mensual de {status.clientName || appName} vencio el {formatDateOnly(status.dueDate)}.
              Para volver a usar el sistema, regulariza el pago con el administrador.
            </p>
            <div className="card stack" style={{ background: "rgba(0,0,0,0.18)" }}>
              <div>
                <strong>Monto mensual</strong>
                <p className="muted" style={{ margin: 0 }}>
                  {formatCurrency(status.amount)}
                </p>
              </div>
              <div>
                <strong>Usuario conectado</strong>
                <p className="muted" style={{ margin: 0 }}>
                  {session.username}
                </p>
              </div>
            </div>
            <div className="actions">
              <LogoutForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

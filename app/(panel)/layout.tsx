import { Suspense } from "react";
import { LogoutForm } from "@/components/logout-form";
import { PanelNotice } from "@/components/panel-notice";
import { Sidebar } from "@/components/sidebar";
import { requireSession } from "@/lib/auth";
import { getSystemAccessStatus } from "@/lib/system-access";

export default async function PanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const systemStatus = await getSystemAccessStatus();

  return (
    <div className="shell">
      <Sidebar role={session.role} username={session.username} />
      <main className="content">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <LogoutForm />
        </div>
        <Suspense fallback={null}>
          <PanelNotice />
        </Suspense>
        {systemStatus.warning ? (
          <div className="notice panel-notice" role="status">
            El sistema vence en {systemStatus.daysRemaining} dia(s). Regulariza el abono para evitar el bloqueo.
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}

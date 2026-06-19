import { redirect } from "next/navigation";
import { CajaShell } from "@/components/caja-shell";
import { requireSession } from "@/lib/auth";
import { getCaja } from "@/lib/data";
import { parsePage } from "@/lib/pagination";
import { toInputDate } from "@/lib/utils";

export default async function CajaPage({
  searchParams
}: {
  searchParams: Promise<{ fecha_desde?: string; fecha_hasta?: string; page?: string }>;
}) {
  const session = await requireSession();
  if (session.role !== "admin") {
    redirect("/inicio?notice=No%20tenes%20permiso%20para%20ver%20Caja&notice_type=error");
  }

  const params = await searchParams;
  const today = toInputDate(new Date());
  const fechaDesde = params.fecha_desde ?? today;
  const fechaHasta = params.fecha_hasta ?? today;
  const page = parsePage(params.page);
  const caja = await getCaja(fechaDesde, fechaHasta, page);

  return <CajaShell caja={caja} fechaDesde={fechaDesde} fechaHasta={fechaHasta} page={page} />;
}

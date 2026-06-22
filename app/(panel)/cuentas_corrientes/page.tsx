import { redirect } from "next/navigation";
import { CuentasCorrientesShell } from "@/components/cuentas-corrientes-shell";
import { requireSession } from "@/lib/auth";
import { getCuentasCorrientes, getClienteDetalle } from "@/lib/data";
import { parsePage } from "@/lib/pagination";

export default async function CuentasCorrientesPage({
  searchParams
}: {
  searchParams: Promise<{ busqueda?: string; page?: string; cliente_id?: string }>;
}) {
  await requireSession();

  const params = await searchParams;
  const page = parsePage(params.page);
  const busqueda = params.busqueda ?? "";
  const clienteId = params.cliente_id ? Number(params.cliente_id) : null;

  const listado = await getCuentasCorrientes(busqueda || undefined, page);

  let detalle = null;
  if (clienteId) {
    detalle = await getClienteDetalle(clienteId, page);
    if (!detalle.cliente) {
      redirect("/cuentas_corrientes?notice=Cliente%20no%20encontrado&notice_type=error");
    }
  }

  return (
    <CuentasCorrientesShell
      listado={listado as any}
      detalle={detalle as any}
      busqueda={busqueda}
      page={page}
      clienteIdActivo={clienteId}
    />
  );
}

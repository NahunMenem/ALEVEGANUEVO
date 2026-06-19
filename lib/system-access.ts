import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { toInputDate } from "@/lib/utils";

type SystemAccessRow = {
  nombre_cliente: string;
  monto_mensual: string;
  fecha_vencimiento: string;
  activo: boolean;
};

export type SystemAccessStatus = {
  configured: boolean;
  blocked: boolean;
  warning: boolean;
  reason: string | null;
  daysRemaining: number | null;
  dueDate: string | null;
  amount: string | null;
  clientName: string | null;
};

function parseDateOnly(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function getDbSchema() {
  return process.env.DB_SCHEMA?.trim() || "alejandro_vega";
}

export async function getSystemAccessStatus(): Promise<SystemAccessStatus> {
  const schema = getDbSchema();

  try {
    const result = await sql<SystemAccessRow>(
      `
        SELECT
          nombre_cliente,
          monto_mensual::text,
          fecha_vencimiento::text,
          activo
        FROM public.sistemas_mensuales
        WHERE db_schema = $1
        LIMIT 1
      `,
      [schema]
    );

    const row = result.rows[0];
    if (!row) {
      return {
        configured: false,
        blocked: false,
        warning: false,
        reason: null,
        daysRemaining: null,
        dueDate: null,
        amount: null,
        clientName: null
      };
    }

    const today = parseDateOnly(toInputDate(new Date()));
    const dueDate = row.fecha_vencimiento.slice(0, 10);
    const daysRemaining = Math.ceil((parseDateOnly(dueDate) - today) / 86_400_000);
    const blocked = !row.activo || daysRemaining <= 0;

    return {
      configured: true,
      blocked,
      warning: !blocked && daysRemaining <= 5,
      reason: !row.activo ? "suspendido" : blocked ? "vencido" : null,
      daysRemaining,
      dueDate,
      amount: row.monto_mensual,
      clientName: row.nombre_cliente
    };
  } catch (error) {
    console.error("No se pudo consultar el estado mensual del sistema", error);
    return {
      configured: false,
      blocked: false,
      warning: false,
      reason: null,
      daysRemaining: null,
      dueDate: null,
      amount: null,
      clientName: null
    };
  }
}

export async function assertSystemAccess() {
  const status = await getSystemAccessStatus();
  if (status.blocked) {
    redirect("/sistema-vencido");
  }
}

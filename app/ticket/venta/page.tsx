import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { ReceiptPrintTrigger } from "@/components/receipt-print-trigger";
import { requireSession } from "@/lib/auth";
import { getLastSaleReceipt } from "@/lib/sale-receipt";
import { formatCurrency, formatDate } from "@/lib/utils";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Alejandro Vega";

export default async function TicketVentaPage() {
  await requireSession();
  const receipt = await getLastSaleReceipt();

  if (!receipt) {
    notFound();
  }

  return (
    <main className="receipt-page">
      <ReceiptPrintTrigger />
      <div className="receipt-actions no-print">
        <Link className="button secondary" href="/registrar_venta">
          Volver
        </Link>
        <PrintButton />
      </div>

      <section className="receipt-paper">
        <div className="receipt-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={appName}
            className="receipt-logo"
            src="/logo.png"
          />
          <div><strong>{appName.toUpperCase()}</strong></div>
          <div>Ticket de compra</div>
        </div>

        <div className="receipt-separator" />

        <div className="receipt-data">
          <p><strong>Fecha:</strong> {formatDate(receipt.fecha)}</p>
          <p><strong>DNI cliente:</strong> {receipt.dniCliente || "-"}</p>
        </div>

        <div className="receipt-separator" />

        <div className="receipt-data">
          {receipt.items.map((item, index) => (
            <p key={`${item.nombre}-${index}`}>
              <strong>{item.nombre}</strong><br />
              {item.cantidad} x {formatCurrency(item.precio)} = {formatCurrency(item.total)}
            </p>
          ))}
        </div>

        <div className="receipt-separator" />

        <div className="receipt-data">
          {receipt.pagos.map((pago, index) => (
            <p key={`${pago.tipo}-${index}`}>
              <strong>Pago {index + 1}:</strong> {pago.tipo} - {formatCurrency(pago.monto)}
            </p>
          ))}
          <p><strong>Total:</strong> {formatCurrency(receipt.total)}</p>
        </div>

        <div className="receipt-separator" />

        <p className="receipt-note receipt-center">
          Gracias por su compra.
        </p>
      </section>
    </main>
  );
}

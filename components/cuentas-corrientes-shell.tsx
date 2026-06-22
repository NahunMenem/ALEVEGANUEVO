"use client";

import { useState } from "react";
import { Banknote, DollarSign, Pencil, Plus, Search, Trash2, User, Users, Wallet, X } from "lucide-react";
import { createClienteAction, updateClienteAction, deleteClienteAction, registrarCargoAction, registrarPagoCCAction, deleteMovimientoCCAction } from "@/app/actions";
import { PaginationControls } from "@/components/pagination-controls";
import { formatCurrency, formatDate } from "@/lib/utils";

type ClienteRow = { id: number; nombre: string; telefono: string; dni: string; fecha_alta: Date; total_cargos: string; total_pagos: string; saldo: string };
type MovimientoRow = { id: number; tipo: string; monto: string; descripcion: string; tipo_pago: string | null; fecha: Date };
type Listado = { items: ClienteRow[]; hasNext: boolean; totalDeuda: number };
type Detalle = { cliente: { id: number; nombre: string; telefono: string; dni: string; fecha_alta: Date }; items: MovimientoRow[]; hasNext: boolean; totalCargos: number; totalPagos: number; saldo: number } | null;
type ModalState = { type: "none" } | { type: "nuevo_cliente" } | { type: "editar_cliente"; cliente: ClienteRow } | { type: "cargo"; clienteId: number; clienteNombre: string } | { type: "pago"; clienteId: number; clienteNombre: string };

export function CuentasCorrientesShell({ listado, detalle, busqueda, page, clienteIdActivo }: { listado: Listado; detalle: Detalle; busqueda: string; page: number; clienteIdActivo: number | null }) {
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const buildHref = (nextPage: number) => {
    const p = new URLSearchParams();
    if (busqueda) p.set("busqueda", busqueda);
    if (clienteIdActivo) p.set("cliente_id", String(clienteIdActivo));
    p.set("page", String(nextPage));
    return "/cuentas_corrientes?" + p.toString();
  };
  return (
    <div className="stack">
      <div className="page-head">
        <div><h1>Cuentas Corrientes</h1><p>Gestiona las deudas de tus clientes. Registra cargos y pagos para cada cuenta.</p></div>
        <div className="actions"><button className="button" type="button" onClick={() => setModal({ type: "nuevo_cliente" })}><Plus size={16} /> Nuevo cliente</button></div>
      </div>
      <div className="kpis">
        <section className="card dashboard-kpi"><div className="dashboard-kpi-icon"><Users size={20} strokeWidth={2} /></div><div className="stat"><small>Total clientes</small><strong>{listado.items.length}{listado.hasNext ? "+" : ""}</strong></div></section>
        <section className="card dark dashboard-kpi"><div className="dashboard-kpi-icon danger"><DollarSign size={20} strokeWidth={2} /></div><div className="stat"><small>Deuda total</small><strong>{formatCurrency(listado.totalDeuda)}</strong><span className="kpi-meta">Saldo pendiente de todos los clientes</span></div></section>
      </div>
      <section className="card stack">
        <div className="dashboard-section-title"><Search size={18} /><strong>Buscar cliente</strong></div>
        <form className="dashboard-filter-grid">
          <label className="field"><span>Nombre, DNI o telefono</span><input type="text" name="busqueda" defaultValue={busqueda} placeholder="Buscar..." /></label>
          <div className="actions" style={{ alignItems: "end" }}><button className="button secondary" type="submit"><Search size={16} /> Buscar</button></div>
        </form>
      </section>
      <section className="card stack">
        <div className="dashboard-section-title"><Users size={18} /><strong>Clientes</strong></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Cliente</th><th>Telefono</th><th>DNI</th><th>Cargos</th><th>Pagos</th><th>Saldo</th><th>Acciones</th></tr></thead>
          <tbody>{listado.items.length ? listado.items.map((c) => { const s = Number(c.saldo); return (
            <tr key={c.id} className={clienteIdActivo === c.id ? "row-highlight" : ""}>
              <td><a href={"/cuentas_corrientes?cliente_id=" + c.id}><strong>{c.nombre}</strong></a></td>
              <td>{c.telefono || "-"}</td><td>{c.dni || "-"}</td>
              <td>{formatCurrency(c.total_cargos)}</td><td>{formatCurrency(c.total_pagos)}</td>
              <td><strong className={s > 0 ? "value-negative" : s < 0 ? "value-positive" : ""}>{formatCurrency(s)}</strong></td>
              <td><div className="actions-row">
                <button className="button small" type="button" onClick={() => setModal({ type: "cargo", clienteId: c.id, clienteNombre: c.nombre })}><Plus size={14} /> Cargo</button>
                <button className="button small secondary" type="button" onClick={() => setModal({ type: "pago", clienteId: c.id, clienteNombre: c.nombre })}><Banknote size={14} /> Pago</button>
                <button className="button small secondary" type="button" onClick={() => setModal({ type: "editar_cliente", cliente: c })}><Pencil size={14} /></button>
                <form action={deleteClienteAction} style={{ display: "inline" }}><input type="hidden" name="cliente_id" value={c.id} /><button className="button small danger" type="submit"><Trash2 size={14} /></button></form>
              </div></td></tr>); }) : <tr><td colSpan={7}><div className="cart-empty">No hay clientes cargados.</div></td></tr>}
          </tbody></table></div>
        {!clienteIdActivo && <PaginationControls buildHref={buildHref} hasNext={listado.hasNext} page={page} />}
      </section>
      {detalle && detalle.cliente && (<section className="card stack">
        <div className="dashboard-section-title"><User size={18} /><strong>Detalle: {detalle.cliente.nombre}</strong></div>
        <div className="kpis">
          <div className="card dashboard-kpi"><div className="dashboard-kpi-icon success"><DollarSign size={20} strokeWidth={2} /></div><div className="stat"><small>Total cargos</small><strong>{formatCurrency(detalle.totalCargos)}</strong></div></div>
          <div className="card dashboard-kpi"><div className="dashboard-kpi-icon"><Banknote size={20} strokeWidth={2} /></div><div className="stat"><small>Total pagos</small><strong>{formatCurrency(detalle.totalPagos)}</strong></div></div>
          <div className="card dark dashboard-kpi"><div className="dashboard-kpi-icon danger"><Wallet size={20} strokeWidth={2} /></div><div className="stat"><small>Saldo pendiente</small><strong>{formatCurrency(detalle.saldo)}</strong></div></div>
        </div>
        <div className="table-wrap"><table>
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripcion</th><th>Metodo pago</th><th>Monto</th><th>Acciones</th></tr></thead>
          <tbody>{detalle.items.length ? detalle.items.map((m) => (
            <tr key={m.id}>
              <td>{formatDate(m.fecha)}</td>
              <td><span className={"badge " + (m.tipo === "cargo" ? "badge-danger" : "badge-success")}>{m.tipo === "cargo" ? "Cargo" : "Pago"}</span></td>
              <td>{m.descripcion || "-"}</td><td>{m.tipo_pago || "-"}</td>
              <td><strong className={m.tipo === "cargo" ? "value-negative" : "value-positive"}>{m.tipo === "cargo" ? "-" : "+"}{formatCurrency(m.monto)}</strong></td>
              <td><form action={deleteMovimientoCCAction} style={{ display: "inline" }}><input type="hidden" name="movimiento_id" value={m.id} /><button className="button small danger" type="submit"><Trash2 size={14} /></button></form></td>
            </tr>)) : <tr><td colSpan={6}><div className="cart-empty">No hay movimientos para este cliente.</div></td></tr>}
          </tbody></table></div>
        {clienteIdActivo && <PaginationControls buildHref={(pg: number) => "/cuentas_corrientes?cliente_id=" + clienteIdActivo + "&page=" + pg} hasNext={detalle.hasNext} page={page} />}
        <div className="actions"><a href="/cuentas_corrientes" className="button secondary">Volver al listado</a></div>
      </section>)}
      {modal.type !== "none" && (<div className="modal-overlay" onClick={() => setModal({ type: "none" })}><div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><strong>
          {modal.type === "nuevo_cliente" && "Nuevo cliente"}
          {modal.type === "editar_cliente" && "Editar cliente"}
          {modal.type === "cargo" && "Registrar cargo - " + modal.clienteNombre}
          {modal.type === "pago" && "Registrar pago - " + modal.clienteNombre}
        </strong><button className="modal-close" onClick={() => setModal({ type: "none" })} type="button"><X size={18} /></button></div>
        {(modal.type === "nuevo_cliente" || modal.type === "editar_cliente") && (<form action={modal.type === "nuevo_cliente" ? createClienteAction : updateClienteAction} className="stack">
          {modal.type === "editar_cliente" && <input type="hidden" name="cliente_id" value={modal.cliente.id} />}
          <label className="field"><span>Nombre</span><input type="text" name="nombre" required defaultValue={modal.type === "editar_cliente" ? modal.cliente.nombre : ""} /></label>
          <label className="field"><span>Telefono</span><input type="text" name="telefono" defaultValue={modal.type === "editar_cliente" ? modal.cliente.telefono : ""} /></label>
          <label className="field"><span>DNI</span><input type="text" name="dni" defaultValue={modal.type === "editar_cliente" ? modal.cliente.dni : ""} /></label>
          <div className="actions"><button className="button" type="submit">{modal.type === "nuevo_cliente" ? "Crear cliente" : "Guardar cambios"}</button></div>
        </form>)}
        {modal.type === "cargo" && (<form action={registrarCargoAction} className="stack">
          <input type="hidden" name="cliente_id" value={modal.clienteId} />
          <label className="field"><span>Monto</span><input type="number" name="monto" step="0.01" min="0.01" required /></label>
          <label className="field"><span>Descripcion</span><input type="text" name="descripcion" placeholder="Detalle del cargo..." /></label>
          <div className="actions"><button className="button" type="submit">Registrar cargo</button></div>
        </form>)}
        {modal.type === "pago" && (<form action={registrarPagoCCAction} className="stack">
          <input type="hidden" name="cliente_id" value={modal.clienteId} />
          <label className="field"><span>Monto</span><input type="number" name="monto" step="0.01" min="0.01" required /></label>
          <label className="field"><span>Descripcion</span><input type="text" name="descripcion" placeholder="Pago de cuenta corriente" /></label>
          <label className="field"><span>Metodo de pago</span><select name="tipo_pago" defaultValue="efectivo"><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="tarjeta">Tarjeta</option><option value="mercado pago">Mercado Pago</option></select></label>
          <div className="actions"><button className="button" type="submit">Registrar pago</button></div>
        </form>)}
      </div></div>)}
    </div>
  );
}
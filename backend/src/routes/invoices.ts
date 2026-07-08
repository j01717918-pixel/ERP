import { Router } from "express";
import PDFDocument from "pdfkit";
import { db } from "../db";
import { AuthReq, requireCompany } from "../middleware/auth";
export const invoiceRouter = Router();
invoiceRouter.use(requireCompany);

invoiceRouter.get("/", async (req: AuthReq, res) => {
  res.json(await db.invoice.findMany({
    where: { companyId: req.companyId! },
    include: { sales: { include: { customer: true, items: { include: { item: true }}}}},
    orderBy: { createdAt: "desc" },
  }));
});

invoiceRouter.get("/:id/pdf", async (req: AuthReq, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const inv = await db.invoice.findUnique({
    where: { id },
    include: { company: true, sales: { include: { customer: true, items: { include: { item: true }}}}},
  });
  if (!inv) return res.status(404).json({ error: "Not found" });
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${inv.invoiceNo}.pdf"`);
  doc.pipe(res);
  doc.fontSize(22).fillColor("#0f172a").text(inv.company.name, { align: "left" });
  doc.fontSize(10).fillColor("#64748b").text(inv.company.address || "");
  doc.text("GSTIN: " + (inv.company.gstNumber || "-"));
  doc.moveDown();
  doc.fontSize(18).fillColor("#0f172a").text("TAX INVOICE", { align: "right" });
  doc.fontSize(10).fillColor("#475569").text(`Invoice #: ${inv.invoiceNo}`, { align: "right" });
  doc.text(`Date: ${inv.sales.date.toISOString().slice(0,10)}`, { align: "right" });
  doc.moveDown();
  doc.fillColor("#0f172a").fontSize(12).text("Bill To:");
  doc.fontSize(11).fillColor("#334155").text(inv.sales.customer.name);
  if (inv.sales.customer.gstNumber) doc.text("GSTIN: " + inv.sales.customer.gstNumber);
  doc.moveDown();
  // table
  const top = doc.y + 10;
  doc.fontSize(10).fillColor("#0f172a");
  doc.text("Item", 50, top); doc.text("Qty", 280, top); doc.text("Rate", 340, top); doc.text("GST%", 410, top); doc.text("Amount", 470, top);
  doc.moveTo(50, top + 15).lineTo(545, top + 15).strokeColor("#e2e8f0").stroke();
  let y = top + 25;
  for (const it of inv.sales.items) {
    doc.fillColor("#334155").text(it.item.name, 50, y);
    doc.text(String(it.quantity), 280, y);
    doc.text(it.rate.toFixed(2), 340, y);
    doc.text(String(it.gst), 410, y);
    doc.text(it.amount.toFixed(2), 470, y);
    y += 20;
  }
  doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke();
  y += 20;
  doc.fillColor("#0f172a").text(`Subtotal: ${inv.sales.subtotal.toFixed(2)}`, 380, y); y += 18;
  doc.text(`GST: ${inv.sales.gstTotal.toFixed(2)}`, 380, y); y += 18;
  doc.fontSize(13).text(`Total: ₹ ${inv.sales.total.toFixed(2)}`, 380, y);
  doc.end();
});

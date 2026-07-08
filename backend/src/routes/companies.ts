import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { AuthReq } from "../middleware/auth";
export const companyRouter = Router();
const schema = z.object({
  name: z.string().min(1), gstNumber: z.string().optional(),
  address: z.string().optional(), state: z.string().optional(),
  phone: z.string().optional(), email: z.string().optional(),
  financialYear: z.string().optional(),
});
companyRouter.get("/", async (req: AuthReq, res) => {
  res.json(await db.company.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: "asc" } }));
});
companyRouter.post("/", async (req: AuthReq, res, next) => {
  try {
    const count = await db.company.count({ where: { userId: req.userId! } });
    if (count >= 5) return res.status(400).json({ error: "Max 5 companies" });
    const data = schema.parse(req.body);
    res.json(await db.company.create({ data: { ...data, userId: req.userId! } }));
  } catch (e) { next(e); }
});
companyRouter.put("/:id", async (req: AuthReq, res, next) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    res.json(await db.company.update({ where: { id }, data: schema.parse(req.body) }));
  }
  catch (e) { next(e); }
});
companyRouter.delete("/:id", async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await db.company.delete({ where: { id } }); res.json({ ok: true });
});

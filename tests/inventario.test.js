import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { generateToken, getUserByEmail, rootConnection } from "./setup.js";

describe("Inventario Endpoints - RBAC", () => {
  let adminToken, supervisorToken, cajeroToken, domiciliarioToken, auditorToken;
  let adminUser, supervisorUser, cajeroUser, domiciliarioUser, auditorUser;

  beforeAll(async () => {
    adminUser = await getUserByEmail("admin@test.com");
    supervisorUser = await getUserByEmail("supervisor@test.com");
    cajeroUser = await getUserByEmail("cajero@test.com");
    domiciliarioUser = await getUserByEmail("domiciliario@test.com");
    auditorUser = await getUserByEmail("auditor@test.com");

    adminToken = generateToken(adminUser);
    supervisorToken = generateToken(supervisorUser);
    cajeroToken = generateToken(cajeroUser);
    domiciliarioToken = generateToken(domiciliarioUser);
    auditorToken = generateToken(auditorUser);
  });

  const validEntrada = {
    producto_id: 1,
    cantidad: 10,
    tipo_referencia: "Compra",
    numero_factura_proveedor: "FAC-TEST-001",
  };

  describe("GET /api/inventario (list stock - all roles)", () => {
    const testRole = (roleName, token) => {
      it(`should return 200 for ${roleName}`, async () => {
        const res = await request(app)
          .get("/api/inventario")
          .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    };

    testRole("Admin", adminToken);
    testRole("Supervisor", supervisorToken);
    testRole("Cajero", cajeroToken);
    testRole("Domiciliario", domiciliarioToken);
    testRole("Auditor", auditorToken);

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/inventario");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/inventario/:productoId (stock by product - all roles)", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .get("/api/inventario/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.producto_id).toBe(1);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/inventario/1");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/inventario/movimientos (list movements - all roles)", () => {
    const testRole = (roleName, token) => {
      it(`should return 200 for ${roleName}`, async () => {
        const res = await request(app)
          .get("/api/inventario/movimientos")
          .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
    };

    testRole("Admin", adminToken);
    testRole("Supervisor", supervisorToken);
    testRole("Cajero", cajeroToken);
    testRole("Domiciliario", domiciliarioToken);
    testRole("Auditor", auditorToken);

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/inventario/movimientos");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/inventario/entrada (register entry - Admin, Cajero)", () => {
    it("should return 201 for Admin", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...validEntrada, cantidad: 5 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id_entrada_inventario");
    });

    it("should return 201 for Cajero", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ ...validEntrada, cantidad: 3, numero_factura_proveedor: "FAC-CAJ-001" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Supervisor", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ ...validEntrada, cantidad: 2, numero_factura_proveedor: "FAC-SUP-001" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Domiciliario", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .set("Authorization", `Bearer ${domiciliarioToken}`)
        .send({ ...validEntrada, cantidad: 2, numero_factura_proveedor: "FAC-DOM-001" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Auditor", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .set("Authorization", `Bearer ${auditorToken}`)
        .send({ ...validEntrada, cantidad: 2, numero_factura_proveedor: "FAC-AUD-001" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .send(validEntrada);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid data", async () => {
      const res = await request(app)
        .post("/api/inventario/entrada")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ producto_id: 999, cantidad: -5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
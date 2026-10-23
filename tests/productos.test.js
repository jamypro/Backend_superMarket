import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { generateToken, getUserByEmail, rootConnection } from "./setup.js";

describe("Productos Endpoints - RBAC", () => {
  let adminToken, supervisorToken, cajeroToken, domiciliarioToken, auditorToken;
  let adminUser, supervisorUser, cajeroUser, domiciliarioUser, auditorUser;
  let testProductId;

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

  beforeAll(async () => {
    const [result] = await rootConnection.query(
      `INSERT INTO productos (codigo_barras, nombre, descripcion, id_categoria, id_unidad_de_medida, precio_venta, precio_compra, precio_minimo, porcentaje_iva, activo)
       VALUES ('9999999999999', 'Test Product', 'For testing', 1, 1, 10000, 8000, 9000, 19.00, 1)`
    );
    testProductId = result.insertId;
  });

  const validProduct = {
    codigo_barras: "8888888888888",
    nombre: "Nuevo Producto",
    descripcion: "Descripción test",
    id_categoria: 1,
    id_unidad_de_medida: 1,
    precio_venta: 15000,
    precio_compra: 12000,
    precio_minimo: 13000,
    porcentaje_iva: 19.00,
    activo: 1,
  };

  describe("GET /api/productos (list)", () => {
    const testRole = (roleName, token) => {
      it(`should return 200 for ${roleName}`, async () => {
        const res = await request(app)
          .get("/api/productos")
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
      const res = await request(app).get("/api/productos");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should support filters", async () => {
      const res = await request(app)
        .get("/api/productos?nombre=Leche")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/productos/:id", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .get(`/api/productos/${testProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_producto).toBe(testProductId);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get(`/api/productos/${testProductId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/productos (create - Admin, Supervisor)", () => {
    it("should return 201 for Admin", async () => {
      const res = await request(app)
        .post("/api/productos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validProduct);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe(validProduct.nombre);
    });

    it("should return 201 for Supervisor", async () => {
      const res = await request(app)
        .post("/api/productos")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ ...validProduct, codigo_barras: "8888888888889", nombre: "Supervisor Product" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const res = await request(app)
        .post("/api/productos")
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ ...validProduct, codigo_barras: "8888888888890", nombre: "Cajero Product" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Domiciliario", async () => {
      const res = await request(app)
        .post("/api/productos")
        .set("Authorization", `Bearer ${domiciliarioToken}`)
        .send({ ...validProduct, codigo_barras: "8888888888891", nombre: "Domiciliario Product" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Auditor", async () => {
      const res = await request(app)
        .post("/api/productos")
        .set("Authorization", `Bearer ${auditorToken}`)
        .send({ ...validProduct, codigo_barras: "8888888888892", nombre: "Auditor Product" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/productos/:id (update - Admin, Supervisor)", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .put(`/api/productos/${testProductId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ nombre: "Updated by Admin", precio_venta: 11000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe("Updated by Admin");
    });

    it("should return 200 for Supervisor", async () => {
      const res = await request(app)
        .put(`/api/productos/${testProductId}`)
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ nombre: "Updated by Supervisor" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const res = await request(app)
        .put(`/api/productos/${testProductId}`)
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ nombre: "Updated by Cajero" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/productos/:id (only Admin)", () => {
    let deleteProductId;

    beforeAll(async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO productos (codigo_barras, nombre, id_categoria, id_unidad_de_medida, precio_venta, precio_compra, precio_minimo, porcentaje_iva, activo)
         VALUES ('7777777777777', 'To Delete', 1, 1, 5000, 4000, 4500, 19.00, 1)`
      );
      deleteProductId = result.insertId;
    });

    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .delete(`/api/productos/${deleteProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Supervisor", async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO productos (codigo_barras, nombre, id_categoria, id_unidad_de_medida, precio_venta, precio_compra, precio_minimo, porcentaje_iva, activo)
         VALUES ('7777777777778', 'To Delete 2', 1, 1, 5000, 4000, 4500, 19.00, 1)`
      );
      const res = await request(app)
        .delete(`/api/productos/${result.insertId}`)
        .set("Authorization", `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { generateToken, getUserByEmail, rootConnection } from "./setup.js";

describe("Categorias Endpoints - RBAC", () => {
  let adminToken, supervisorToken, cajeroToken, domiciliarioToken, auditorToken;
  let adminUser, supervisorUser, cajeroUser, domiciliarioUser, auditorUser;
  let testCategoryId;

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
      `INSERT INTO categorias (nombre, descripcion, activo) VALUES ('Test Category', 'For testing', 1)`
    );
    testCategoryId = result.insertId;
  });

  const validCategory = { nombre: "Nueva Categoría", descripcion: "Descripción test", activo: 1 };

  describe("GET /api/categorias (list)", () => {
    const testRole = (roleName, token) => {
      it(`should return 200 for ${roleName}`, async () => {
        const res = await request(app)
          .get("/api/categorias")
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
      const res = await request(app).get("/api/categorias");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/categorias/:id", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .get(`/api/categorias/${testCategoryId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_categoria).toBe(testCategoryId);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get(`/api/categorias/${testCategoryId}`);
      expect(res.status).toBe(401);
    });

    it("should return 404 for non-existent", async () => {
      const res = await request(app)
        .get("/api/categorias/99999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/categorias (create - Admin, Supervisor)", () => {
    it("should return 201 for Admin", async () => {
      const res = await request(app)
        .post("/api/categorias")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validCategory);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe(validCategory.nombre);
    });

    it("should return 201 for Supervisor", async () => {
      const res = await request(app)
        .post("/api/categorias")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ ...validCategory, nombre: "Supervisor Category" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const res = await request(app)
        .post("/api/categorias")
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ ...validCategory, nombre: "Cajero Category" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Domiciliario", async () => {
      const res = await request(app)
        .post("/api/categorias")
        .set("Authorization", `Bearer ${domiciliarioToken}`)
        .send({ ...validCategory, nombre: "Domiciliario Category" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Auditor", async () => {
      const res = await request(app)
        .post("/api/categorias")
        .set("Authorization", `Bearer ${auditorToken}`)
        .send({ ...validCategory, nombre: "Auditor Category" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/categorias/:id (update - Admin, Supervisor)", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .put(`/api/categorias/${testCategoryId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ nombre: "Updated by Admin", descripcion: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe("Updated by Admin");
    });

    it("should return 200 for Supervisor", async () => {
      const res = await request(app)
        .put(`/api/categorias/${testCategoryId}`)
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ nombre: "Updated by Supervisor" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const res = await request(app)
        .put(`/api/categorias/${testCategoryId}`)
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ nombre: "Updated by Cajero" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/categorias/:id (only Admin)", () => {
    let deleteCategoryId;

    beforeAll(async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO categorias (nombre, descripcion, activo) VALUES ('To Delete', 'Delete me', 1)`
      );
      deleteCategoryId = result.insertId;
    });

    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .delete(`/api/categorias/${deleteCategoryId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Supervisor", async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO categorias (nombre, descripcion, activo) VALUES ('To Delete 2', 'Delete me', 1)`
      );
      const res = await request(app)
        .delete(`/api/categorias/${result.insertId}`)
        .set("Authorization", `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
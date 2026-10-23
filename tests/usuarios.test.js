import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { generateToken, getUserByEmail, rootConnection } from "./setup.js";

describe("Usuarios Endpoints - RBAC", () => {
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

  const testUserData = {
    rol_id: 3,
    nombre: "Test",
    apellido: "Usuario",
    tipo_documento: "CC",
    documento: "7777777777",
    correo: "testuser@test.com",
    contrasena: "Password123",
  };

  describe("GET /api/usuarios (list)", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return 200 for Supervisor", async () => {
      const res = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 for Cajero", async () => {
      const res = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${cajeroToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 for Domiciliario", async () => {
      const res = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${domiciliarioToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 for Auditor", async () => {
      const res = await request(app)
        .get("/api/usuarios")
        .set("Authorization", `Bearer ${auditorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/usuarios");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/usuarios/:id", () => {
    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .get(`/api/usuarios/${supervisorUser.id_usuario}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id_usuario).toBe(supervisorUser.id_usuario);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get(`/api/usuarios/${supervisorUser.id_usuario}`);
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/usuarios (create)", () => {
    it("should return 201 for Admin", async () => {
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(testUserData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.correo).toBe(testUserData.correo);
    });

    it("should return 201 for Supervisor", async () => {
      const newUser = { ...testUserData, correo: "test2@test.com", documento: "7777777778" };
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const newUser = { ...testUserData, correo: "test3@test.com", documento: "7777777779" };
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send(newUser);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("permiso");
    });

    it("should return 403 for Domiciliario", async () => {
      const newUser = { ...testUserData, correo: "test4@test.com", documento: "7777777780" };
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${domiciliarioToken}`)
        .send(newUser);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Auditor", async () => {
      const newUser = { ...testUserData, correo: "test5@test.com", documento: "7777777781" };
      const res = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${auditorToken}`)
        .send(newUser);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/usuarios/:id (update)", () => {
    let targetUserId;

    beforeAll(async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado)
         VALUES (3, 'Target', 'User', 'CC', '6666666666', 'target@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1)`
      );
      targetUserId = result.insertId;
    });

    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .put(`/api/usuarios/${targetUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ telefono: "3001234567" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 200 for Supervisor", async () => {
      const res = await request(app)
        .put(`/api/usuarios/${targetUserId}`)
        .set("Authorization", `Bearer ${supervisorToken}`)
        .send({ telefono: "3001234568" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const res = await request(app)
        .put(`/api/usuarios/${targetUserId}`)
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ telefono: "3001234569" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/usuarios/:id/contrasena (change password)", () => {
    let targetUserId;

    beforeAll(async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado)
         VALUES (3, 'Pass', 'User', 'CC', '5555555555', 'pass@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1)`
      );
      targetUserId = result.insertId;
    });

    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .patch(`/api/usuarios/${targetUserId}/contrasena`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ contrasena: "NewPassword123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Cajero", async () => {
      const res = await request(app)
        .patch(`/api/usuarios/${targetUserId}/contrasena`)
        .set("Authorization", `Bearer ${cajeroToken}`)
        .send({ contrasena: "NewPassword123" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/usuarios/:id (only Admin)", () => {
    let targetUserId;

    beforeAll(async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado)
         VALUES (3, 'Delete', 'Me', 'CC', '4444444444', 'delete@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1)`
      );
      targetUserId = result.insertId;
    });

    it("should return 200 for Admin", async () => {
      const res = await request(app)
        .delete(`/api/usuarios/${targetUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 403 for Supervisor", async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado)
         VALUES (3, 'Delete', 'Me2', 'CC', '4444444445', 'delete2@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1)`
      );
      const res = await request(app)
        .delete(`/api/usuarios/${result.insertId}`)
        .set("Authorization", `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should return 403 for Cajero", async () => {
      const [result] = await rootConnection.query(
        `INSERT INTO usuarios (rol_id, nombre, apellido, tipo_documento, documento, correo, contrasena, estado)
         VALUES (3, 'Delete', 'Me3', 'CC', '4444444446', 'delete3@test.com', '$2b$10$abcdefghijklmnopqrstuv', 1)`
      );
      const res = await request(app)
        .delete(`/api/usuarios/${result.insertId}`)
        .set("Authorization", `Bearer ${cajeroToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { generateToken, getUserByEmail, rootConnection } from "./setup.js";

describe("Auth Endpoints", () => {
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

  describe("POST /api/auth/register", () => {
    it("should register a new user (201)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          rol_id: 3,
          nombre: "Nuevo",
          apellido: "Cajero",
          tipo_documento: "CC",
          documento: "9999999999",
          correo: "nuevocajero@test.com",
          contrasena: "Password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("id_usuario");
      expect(res.body.data.correo).toBe("nuevocajero@test.com");
      expect(res.body.data).not.toHaveProperty("contrasena");
    });

    it("should reject duplicate email (400)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          rol_id: 3,
          nombre: "Otro",
          apellido: "Cajero",
          tipo_documento: "CC",
          documento: "8888888888",
          correo: "admin@test.com",
          contrasena: "Password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject invalid data (400)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          rol_id: 3,
          nombre: "",
          correo: "invalid-email",
          contrasena: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials (200)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          correo: "admin@test.com",
          contrasena: "TestPass123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.usuario).toHaveProperty("id_usuario");
      expect(res.body.data.usuario).toHaveProperty("rol_id", 1);
    });

    it("should reject wrong password (401)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          correo: "admin@test.com",
          contrasena: "WrongPassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-existent user (401)", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          correo: "nonexistent@test.com",
          contrasena: "Password123",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token (200)", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.correo).toBe("admin@test.com");
      expect(res.body.data.rol_id).toBe(1);
    });

    it("should reject request without token (401)", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("token");
    });

    it("should reject request with invalid token (401)", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
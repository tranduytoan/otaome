import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import worker, { AUTH_CODES } from "../src";
import { signJwt, verifyJwt } from "../src/jwt.js";

describe("Cloudflare Worker Backend - Auth & Wish Logging", () => {
	it("handles OPTIONS preflight with CORS headers", async () => {
		const request = new Request("http://example.com/api/login", {
			method: "OPTIONS",
		});
		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(204);
		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
	});

	it("fails login with wrong credentials and returns AUTH_FAILED_INVALID", async () => {
		const request = new Request("http://example.com/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: "wrong_user", password: "wrong_password" }),
		});
		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(401);
		const data = await response.json();
		expect(data.code).toBe(AUTH_CODES.FAILED);
		expect(data.token).toBeUndefined();
	});

	it("succeeds login with default credentials, returns AUTH_SUCCESS_2910 and 30-min JWT", async () => {
		const request = new Request("http://example.com/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: "thuthuy", password: "xinhdep" }),
		});
		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.code).toBe(AUTH_CODES.SUCCESS);
		expect(typeof data.token).toBe("string");
		expect(data.expiresIn).toBe(1800);

		// Verify JWT validity
		const payload = await verifyJwt(data.token);
		expect(payload).not.toBeNull();
		expect(payload.sub).toBe("thuthuy");
		expect(payload.exp - payload.iat).toBe(1800);
	});

	it("authenticates using accounts list stored in KV account_list", async () => {
		const kv = env.HPBD_THUY;
		// Seed custom account in KV
		const customAccounts = [
			{ username: "player_custom", password: "super_secret_password" },
		];
		await kv.put("account_list", JSON.stringify(customAccounts));

		const request = new Request("http://example.com/api/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: "player_custom",
				password: "super_secret_password",
			}),
		});
		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.code).toBe(AUTH_CODES.SUCCESS);
		expect(data.username).toBe("player_custom");
	});

	it("rejects wish logging when Authorization header is missing or invalid", async () => {
		const request = new Request("http://example.com/api/log-wish", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ wish: "Happy 22nd birthday" }),
		});
		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(401);
		const data = await response.json();
		expect(data.error).toBeDefined();
	});

	it("rejects wish logging with an expired token", async () => {
		// Create expired token (-10s)
		const expiredToken = await signJwt({ sub: "thuthuy" }, undefined, -10);
		const request = new Request("http://example.com/api/log-wish", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${expiredToken}`,
			},
			body: JSON.stringify({ wish: "My secret wish" }),
		});
		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(401);
	});

	it("logs user wish and device info to KV with valid JWT", async () => {
		const validToken = await signJwt({ sub: "thuthuy" }, undefined, 1800);
		const wishText = "Chúc Thu Thùy tuổi mới rực rỡ và luôn mỉm cười!";
		const deviceInfo = {
			screen: "1920x1080",
			viewport: "1280x720",
			timeZone: "Asia/Ho_Chi_Minh",
			language: "vi-VN",
		};

		const request = new Request("http://example.com/api/log-wish", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${validToken}`,
				"User-Agent": "Mozilla/5.0 PixelBrowser/1.0",
				"cf-connecting-ip": "1.2.3.4",
			},
			body: JSON.stringify({
				wish: wishText,
				device_info: deviceInfo,
			}),
		});

		const response = await worker.fetch(request, env, createExecutionContext());
		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data.success).toBe(true);
		expect(data.key).toMatch(/^log:\d+$/);

		// Verify record exists in KV
		const kv = env.HPBD_THUY;
		const saved = await kv.get(data.key, "json");
		expect(saved).not.toBeNull();
		expect(saved.wish).toBe(wishText);
		expect(saved.username).toBe("thuthuy");
		expect(saved.device_info.client.screen).toBe("1920x1080");
		expect(saved.device_info.userAgent).toBe("Mozilla/5.0 PixelBrowser/1.0");
		expect(saved.device_info.clientIp).toBe("1.2.3.4");
	});
});

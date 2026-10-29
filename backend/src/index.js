/**
 * Happy Birthday Thu Thùy - Cloudflare Worker Backend
 * Provides KV-backed Authentication & Wish Logging with JWT
 */

import { signJwt, verifyJwt } from "./jwt.js";

export const AUTH_CODES = {
	SUCCESS: "AUTH_SUCCESS_2910",
	FAILED: "AUTH_FAILED_INVALID",
};

export const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
			...CORS_HEADERS,
		},
	});
}

function getKv(env) {
	return env.HPBD_THUY || env.KV || null;
}

/**
 * Fetch accounts list from KV `account_list`
 * Falls back to default hardcoded credentials if KV is not yet seeded
 */
async function getAccountsList(env) {
	const kv = getKv(env);
	if (kv) {
		try {
			const accounts = await kv.get("account_list", "json");
			if (Array.isArray(accounts) && accounts.length > 0) {
				return accounts;
			}
		} catch (_) {}
	}
	// Fallback seed account
	return [{ username: "thuthuy", password: "xinhdep" }];
}

/**
 * Handle POST /api/login
 */
async function handleLogin(request, env) {
	try {
		const body = await request.json();
		const { username, password } = body || {};

		if (!username || !password) {
			return jsonResponse(
				{ code: AUTH_CODES.FAILED, error: "Username and password required" },
				401
			);
		}

		const accounts = await getAccountsList(env);
		const userClean = String(username).trim().toLowerCase();
		const passClean = String(password).trim().toLowerCase();

		const matchedAccount = accounts.find(
			(acc) =>
				acc.username &&
				acc.username.trim().toLowerCase() === userClean &&
				acc.password &&
				acc.password.trim().toLowerCase() === passClean
		);

		if (!matchedAccount) {
			return jsonResponse(
				{ code: AUTH_CODES.FAILED, error: "Sai Username hoặc Password rồi! Thử lại nhé" },
				401
			);
		}

		// 30-minute JWT token (1800 seconds)
		const jwtSecret = env.JWT_SECRET;
		const token = await signJwt({ sub: matchedAccount.username }, jwtSecret, 1800);

		return jsonResponse({
			code: AUTH_CODES.SUCCESS,
			token,
			expiresIn: 1800,
			username: matchedAccount.username,
		});
	} catch (_) {
		return jsonResponse(
			{ code: AUTH_CODES.FAILED, error: "Invalid JSON body" },
			400
		);
	}
}

/**
 * Handle POST /api/log-wish
 */
async function handleLogWish(request, env) {
	// Authenticate via Bearer JWT
	const authHeader = request.headers.get("Authorization") || "";
	const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
	if (!tokenMatch) {
		return jsonResponse({ error: "Missing or invalid Authorization header" }, 401);
	}

	const token = tokenMatch[1];
	const jwtSecret = env.JWT_SECRET;
	const payload = await verifyJwt(token, jwtSecret);

	if (!payload) {
		return jsonResponse({ error: "Token expired or invalid" }, 401);
	}

	try {
		const body = await request.json();
		const { wish, device_info } = body || {};

		if (!wish || typeof wish !== "string" || !wish.trim()) {
			return jsonResponse({ error: "Wish text cannot be empty" }, 400);
		}

		const timestamp = Date.now();
		const key = `log:${timestamp}`;

		// Legal and safe device metadata collection
		const userAgent = request.headers.get("User-Agent") || "Unknown";
		const clientIp = request.headers.get("cf-connecting-ip") || "Unknown";
		const cfGeo = request.cf
			? {
					country: request.cf.country,
					city: request.cf.city,
					region: request.cf.region,
					timezone: request.cf.timezone,
			  }
			: null;

		const logEntry = {
			timestamp,
			username: payload.sub,
			wish: wish.trim(),
			device_info: {
				client: device_info || {},
				userAgent,
				cfGeo,
				clientIp,
			},
		};

		const kv = getKv(env);
		if (kv) {
			await kv.put(key, JSON.stringify(logEntry));
		}

		return jsonResponse({
			success: true,
			key,
			timestamp,
		});
	} catch (_) {
		return jsonResponse({ error: "Invalid JSON body" }, 400);
	}
}

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: CORS_HEADERS,
			});
		}

		// API Routing
		if (request.method === "POST" && url.pathname === "/api/login") {
			return await handleLogin(request, env);
		}

		if (request.method === "POST" && url.pathname === "/api/log-wish") {
			return await handleLogWish(request, env);
		}

		if (url.pathname === "/api/health" || url.pathname === "/") {
			return jsonResponse({
				status: "ok",
				service: "HPBD2 Cloudflare Backend",
				time: new Date().toISOString(),
			});
		}

		return jsonResponse({ error: "Endpoint not found" }, 404);
	},
};

/**
 * Lightweight native Web Crypto JWT implementation (HMAC-SHA256)
 * Zero external dependencies, fully compatible with Cloudflare Workers runtime
 */

const DEFAULT_SECRET = "hpbd_thu_thuy_secret_2026_cyan";

function base64UrlEncode(buffer) {
	let binary = "";
	const bytes = new Uint8Array(buffer);
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function base64UrlDecode(str) {
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4) {
		base64 += "=";
	}
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

async function getCryptoKey(secret) {
	const enc = new TextEncoder();
	return await crypto.subtle.importKey(
		"raw",
		enc.encode(secret || DEFAULT_SECRET),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"]
	);
}

/**
 * Sign a payload into a JWT token (expires in expiresInSeconds, default 30 min = 1800s)
 */
export async function signJwt(payload, secret = DEFAULT_SECRET, expiresInSeconds = 1800) {
	const header = { alg: "HS256", typ: "JWT" };
	const now = Math.floor(Date.now() / 1000);
	const fullPayload = {
		...payload,
		iat: now,
		exp: now + expiresInSeconds,
	};

	const enc = new TextEncoder();
	const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
	const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(fullPayload)));
	const unsignedToken = `${headerB64}.${payloadB64}`;

	const key = await getCryptoKey(secret);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		enc.encode(unsignedToken)
	);

	const signatureB64 = base64UrlEncode(signature);
	return `${unsignedToken}.${signatureB64}`;
}

/**
 * Verify and decode a JWT token. Returns payload if valid, null otherwise.
 */
export async function verifyJwt(token, secret = DEFAULT_SECRET) {
	if (!token || typeof token !== "string") return null;
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	const [headerB64, payloadB64, signatureB64] = parts;
	const unsignedToken = `${headerB64}.${payloadB64}`;

	try {
		const key = await getCryptoKey(secret);
		const signatureBytes = base64UrlDecode(signatureB64);
		const enc = new TextEncoder();

		// Constant-time cryptographic verification
		const isValid = await crypto.subtle.verify(
			"HMAC",
			key,
			signatureBytes,
			enc.encode(unsignedToken)
		);

		if (!isValid) return null;

		const payloadBytes = base64UrlDecode(payloadB64);
		const dec = new TextDecoder();
		const payload = JSON.parse(dec.decode(payloadBytes));

		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			// Token expired
			return null;
		}

		return payload;
	} catch (_) {
		return null;
	}
}

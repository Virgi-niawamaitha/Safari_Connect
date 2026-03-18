export function generateReference(prefix = "SC") {
	const now = Date.now().toString(36).toUpperCase();
	const rand = Math.floor(Math.random() * 1e6)
		.toString()
		.padStart(6, "0");
	return `${prefix}-${now}-${rand}`;
}

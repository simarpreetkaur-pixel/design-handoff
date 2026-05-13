/**
 * Loaded before `server.js` via `node --import ./server-env.mjs ./server.js`
 * so TLS / DNS run before any dependency opens HTTPS (ESM hoists static imports).
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

import dns from "node:dns"
dns.setDefaultResultOrder("ipv4first")

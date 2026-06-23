
// utils/validateProductLink.ts
import { URL } from 'url';
import dns from 'dns/promises';
import net from 'net';

// Known spam/abuse TLDs
const SPAM_TLDS = new Set(['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.loan', '.work']);

// Known URL shorteners (hides final destination)
const URL_SHORTENERS = new Set([
    'bit.ly', 'tinyurl.com', 't.co', 'shorturl.at',
    'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly',
]);

// Suspicious keyword patterns in hostname
const SUSPICIOUS_HOSTNAME_PATTERNS = [
    /(.)\1{4,}/,                              // repeated chars: "aaaaa.com"
    /(free-?gift|you-?won|click-?here|verify-?now|login-?secure|account-?update)/i,
    /\d{4,}/,                                 // too many digits in hostname
    /^(\d{1,3}\.){3}\d{1,3}$/,               // raw IP as hostname e.g. http://192.168.1.1/product
    /-{2,}/,                                  // multiple hyphens: "am-az-on-deals.com"
];

// Suspicious patterns in full URL
const SUSPICIOUS_URL_PATTERNS = [
    /%00|%0d|%0a/i,       // null bytes / CRLF injection
    /javascript:/i,        // XSS attempt
    /data:/i,              // data URI
    /vbscript:/i,          // legacy XSS
    /@.+@/,                // double @ in URL (credential stuffing trick)
];

function isPrivateOrReservedIp(ip: string): boolean {
    if (net.isIPv4(ip)) {
        const parts = ip.split('.').map(Number);
        return (
            parts[0] === 10 ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 168) ||
            parts[0] === 127 ||
            (parts[0] === 169 && parts[1] === 254) ||
            parts[0] === 0
        );
    }
    return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fe80');
}


export async function validateProductLink(link: string): Promise<boolean> {
    try {
        if (!link || typeof link !== 'string' || link.trim().length === 0) return true;

        const trimmed = link.trim();

        // Suspicious full URL patterns
        for (const pattern of SUSPICIOUS_URL_PATTERNS) {
            if (pattern.test(trimmed)) return true;
        }

        // Valid URL format
        let url: URL;
        try {
            url = new URL(trimmed);
        } catch {
            return true;
        }

        // Protocol check
        if (!['http:', 'https:'].includes(url.protocol)) return true;

        // HTTPS only
        if (url.protocol === 'http:') return true;

        const hostname = url.hostname.toLowerCase();

        // URL shorteners
        if (URL_SHORTENERS.has(hostname)) return true;

        // Spam TLDs
        if ([...SPAM_TLDS].some((tld) => hostname.endsWith(tld))) return true;

        // Suspicious hostname patterns
        for (const pattern of SUSPICIOUS_HOSTNAME_PATTERNS) {
            if (pattern.test(hostname)) return true;
        }

        // Valid TLD
        const parts = hostname.split('.');
        if (parts.length < 2 || parts[parts.length - 1].length < 2) return true;

        // SSRF — resolve DNS and block private/internal IPs
        const addresses = await dns.lookup(hostname, { all: true });
        if (!addresses || addresses.length === 0) return true;
        for (const { address } of addresses) {
            if (isPrivateOrReservedIp(address)) return true;
        }

        return false; // ✅ all checks passed — not spam
    } catch {
        return true; // anything unexpected → treat as spam
    }
}
import path from 'node:path';

const PRODUCTION_URL = 'https://ceria-belajar.pages.dev';
const LOCAL_URL = 'http://localhost:4173';

/**
 * Two targets:
 * - Production (default): the live site on Cloudflare Pages.
 * - Local: set APP_DIR to a checkout of the app; Playwright builds it and serves it with `vite preview`.
 * BASE_URL overrides both, e.g. for a Cloudflare preview deployment.
 */
const appDir = process.env.APP_DIR ? path.resolve(process.env.APP_DIR) : undefined;

export const env = {
  appDir,
  isLocal: !!appDir,
  baseURL: process.env.BASE_URL ?? (appDir ? LOCAL_URL : PRODUCTION_URL),
};

# cloudflare-toys

Small typed helpers for Cloudflare Workers-adjacent projects.

## Why

Cloudflare projects tend to start with the same small pieces of glue code:

- a typed client for an account-scoped Cloudflare API
- a tiny Turnstile Siteverify wrapper
- helpers for Workers Analytics Engine SQL requests
- image delivery URL builders with project-specific variants
- adapters between Workers bindings and framework/library APIs

None of that code is difficult, but it is repetitive. Every new Worker, SvelteKit app, or internal tool ends up needing the same `fetch` wrapper, the same response types, the same form-data conversion, and the same "where do I put this secret/account ID?" decisions.

`cloudflare-toys` collects those boring helpers into small, typed modules so each app can start closer to the product code. The package stays intentionally thin: it does not hide Cloudflare's APIs behind a large abstraction, and it does not read from framework-specific environment modules. You pass credentials explicitly and handle the Better Fetch `{ data, error }` result yourself.

The package is designed to have a small footprint. Each Cloudflare product lives behind its own subpath export, so bundlers can tree-shake unused helpers instead of pulling the whole package into your Worker.

## Install

::: code-group

```sh [npm]
npm install cloudflare-toys
```

```sh [pnpm]
pnpm add cloudflare-toys
```

```sh [bun]
bun add cloudflare-toys
```

:::

## Packages

- [`cloudflare-toys/images/storage`](/images) — Cloudflare Images hosted storage API client.
- [`cloudflare-toys/images/variants`](/variants) — typed hosted image delivery variant URLs.
- [`cloudflare-toys/turnstile`](/turnstile) — Turnstile Siteverify helper.
- [`cloudflare-toys/unemail`](/unemail) — Unemail driver for Cloudflare Email Service's structured binding API.
- [`cloudflare-toys/wae`](/wae) — Workers Analytics Engine SQL API client.
- [`cloudflare-toys/misc/better-auth/secondaryStorage`](/better-auth) — Better Auth helper for Workers KV.
- [`cloudflare-toys/misc/drizzle/cache`](/drizzle-kv-cache) — Drizzle query-cache adapter for Workers KV.

## Design

The clients are thin typed wrappers around Cloudflare APIs:

- credentials are passed explicitly
- no SvelteKit, Hono, Next.js, or Worker handler coupling
- schemas are defined with Valibot and Better Fetch
- methods return Better Fetch results, usually `{ data, error }`
- modules are split by Cloudflare product so apps only import what they use
- subpath exports keep imports tree-shakeable and Worker bundles small

Example:

```ts
import createTurnstileClient from "cloudflare-toys/turnstile";

const turnstile = createTurnstileClient({
  secret: env.TURNSTILE_SECRET_KEY,
});

const { data, error } = await turnstile.verify(token);
```

This keeps app code explicit while avoiding copy-pasted platform plumbing.

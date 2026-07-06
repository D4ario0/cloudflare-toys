# Better Auth

Small compatibility helper for using Workers KV as Better Auth secondary storage.

## Usage

```ts
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { asSecondaryStorage } from "cloudflare-toys/misc/better-auth";

export const auth = betterAuth({
  secondaryStorage: asSecondaryStorage(env.AUTH_KV),
});
```

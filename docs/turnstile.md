# Turnstile

Validate Cloudflare Turnstile tokens with the Siteverify API.

This helper only covers server-side token validation. It does not render the Turnstile widget and it should only be used from backend code where your Turnstile secret is safe.

See reference: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

## Usage

```ts
import createTurnstileClient, {
  TURNSTILE_RESPONSE_FIELD,
} from "cloudflare-toys/turnstile";

const turnstile = createTurnstileClient({
  secret: env.TURNSTILE_SECRET_KEY,
});

const formData = await request.formData();
const token = formData.get(TURNSTILE_RESPONSE_FIELD);

if (typeof token !== "string") {
  return new Response("Missing verification token", { status: 400 });
}

const { data, error } = await turnstile.verify(token, {
  remoteip: request.headers.get("CF-Connecting-IP") ?? undefined,
});

if (error || !data.success) {
  return new Response("Invalid verification", { status: 400 });
}
```

## API

```ts
import createTurnstileClient from "cloudflare-toys/turnstile";

const turnstile = createTurnstileClient({
  secret: "0x...",
});

const result = await turnstile.verify("token-from-widget");
```

### `createTurnstileClient(options)`

```ts
type TurnstileOptions = {
  secret: string;
  origin?: string;
};
```

`origin` defaults to `https://challenges.cloudflare.com`.

### `turnstile.verify(response, options?)`

```ts
type SiteverifyOptions = {
  remoteip?: string;
  idempotency_key?: string;
};
```

Returns the Better Fetch result object:

```ts
const { data, error } = await turnstile.verify(token);
```

## Response

The successful Better Fetch `data` value is Cloudflare's Siteverify response:

```ts
const { data, error } = await turnstile.verify(token);

if (!error && data.success) {
  console.log(data.hostname);
  console.log(data.action);
}
```

Common fields include:

- `success`
- `challenge_ts`
- `hostname`
- `action`
- `cdata`
- `error-codes`
- `metadata.ephemeral_id` for Enterprise ephemeral IDs

If you set an expected widget action or hostname in your app, check those fields after validation:

```ts
const { data, error } = await turnstile.verify(token);

if (error || !data.success) {
  return new Response("Invalid verification", { status: 400 });
}

if (data.action !== "login" || data.hostname !== "example.com") {
  return new Response("Invalid verification context", { status: 400 });
}
```

## Notes

- Server-side validation is mandatory. The client-side widget alone does not protect a form.
- The client calls `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- `secret` and `response` are required by Cloudflare.
- `remoteip` and `idempotency_key` are optional.
- Token responses are sent as `FormData` via the shared schema transform.
- Turnstile tokens are single-use and expire after 5 minutes.
- Token responses have a maximum length of 2048 characters.
- The widget field name is exported as `TURNSTILE_RESPONSE_FIELD` and equals `cf-turnstile-response`.

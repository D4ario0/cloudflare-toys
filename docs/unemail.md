# Unemail

Use [Unemail](https://unemail.dev/) with Cloudflare Email Service's structured `SendEmail` binding API.

Unlike Unemail's legacy Cloudflare driver, this adapter does not require the runtime `EmailMessage` constructor or raw MIME messages.

## Install

```sh
pnpm add cloudflare-toys unemail
```

`unemail` is an optional peer dependency, so it is only needed when importing this subpath.

## Configure the binding

Add a send-email binding to `wrangler.jsonc`:

```jsonc
{
  "send_email": [{ "name": "EMAIL" }]
}
```

The sender domain must be enabled for Cloudflare Email Sending. Generate Worker types with Wrangler so the binding is available as `SendEmail` in your project.

## Usage

```ts
import { createEmail } from "unemail";
import { cloudflareEmail } from "cloudflare-toys/unemail";

const email = createEmail({
  driver: cloudflareEmail({ binding: env.EMAIL }),
});

const { data, error } = await email.send({
  from: { email: "hello@example.com", name: "Example" },
  to: "user@example.net",
  subject: "Welcome",
  text: "Welcome to Example.",
  html: "<p>Welcome to <strong>Example</strong>.</p>",
});
```

The adapter exports only the Unemail driver. Client creation remains in application code so you can configure Unemail as needed.

## Supported features

- text and HTML bodies
- `to`, `cc`, and `bcc` recipients
- reply-to addresses
- custom headers supported by Cloudflare
- regular and inline attachments

Unemail addresses with names are converted to Cloudflare's `{ email, name }` shape. Other addresses are passed as strings.

## Attachments

```ts
await email.send({
  from: "reports@example.com",
  to: "user@example.net",
  subject: "Report",
  text: "Your report is attached.",
  attachments: [
    {
      filename: "report.csv",
      contentType: "text/csv",
      content: "Name,Amount\nWidget,100",
    },
  ],
});
```

Inline attachments with both `disposition: "inline"` and a `cid` are mapped to Cloudflare's `contentId` field. Other attachments use the `attachment` disposition. A missing content type defaults to `application/octet-stream`.

## Errors

The driver returns an `INVALID_OPTIONS` error when `from` or `to` is missing. Errors thrown by the Cloudflare binding are normalized through Unemail's `toEmailError` helper.

Cloudflare Email Service is intended for transactional email. The combined recipient and message-size limits imposed by Cloudflare still apply.

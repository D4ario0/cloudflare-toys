import {
  createError,
  createRequiredError,
  defineDriver,
  normalizeAddresses,
  toEmailError,
  type EmailAddressInput,
} from "unemail";

const driverName = "cloudflare-email";

function toCloudflareAddress(address: ReturnType<typeof normalizeAddresses>[number]) {
  const email = address.email.trim();
  return address.name ? { email, name: address.name } : email;
}

function toCloudflareAddresses(input: EmailAddressInput | undefined) {
  return normalizeAddresses(input)
    .filter((address) => address.email.trim().length > 0)
    .map(toCloudflareAddress);
}

export const cloudflareEmail = defineDriver<{ binding: SendEmail }>((options) => {
  if (!options?.binding) throw createRequiredError(driverName, "binding");

  return {
    name: driverName,
    flags: {
      attachments: true,
      customHeaders: true,
      html: true,
      replyTo: true,
      text: true,
    },
    async send(message) {
      try {
        const from = normalizeAddresses(message.from).find(
          (address) => address.email.trim().length > 0,
        );
        const to = toCloudflareAddresses(message.to);

        if (!from || to.length === 0) {
          return {
            data: null,
            error: createError(driverName, "INVALID_OPTIONS", "`from` and `to` are required"),
          };
        }

        const cc = toCloudflareAddresses(message.cc);
        const bcc = toCloudflareAddresses(message.bcc);
        const replyTo = toCloudflareAddresses(message.replyTo)[0];

        const result = await options.binding.send({
          from: toCloudflareAddress(from),
          to,
          subject: message.subject,
          ...(message.text ? { text: message.text } : {}),
          ...(message.html ? { html: message.html } : {}),
          ...(message.headers ? { headers: message.headers } : {}),
          ...(cc.length > 0 ? { cc } : {}),
          ...(bcc.length > 0 ? { bcc } : {}),
          ...(replyTo ? { replyTo } : {}),
          ...(message.attachments
            ? {
                attachments: message.attachments.map((attachment) =>
                  attachment.disposition === "inline" && attachment.cid
                    ? {
                        content: attachment.content,
                        contentId: attachment.cid,
                        disposition: "inline" as const,
                        filename: attachment.filename,
                        type: attachment.contentType ?? "application/octet-stream",
                      }
                    : {
                        content: attachment.content,
                        disposition: "attachment" as const,
                        filename: attachment.filename,
                        type: attachment.contentType ?? "application/octet-stream",
                      },
                ),
              }
            : {}),
        });

        return {
          data: { id: result.messageId, driver: driverName, at: new Date() },
          error: null,
        };
      } catch (error) {
        return { data: null, error: toEmailError(driverName, error) };
      }
    },
  };
});

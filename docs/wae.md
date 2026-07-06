# Workers Analytics Engine

Typed client for the Workers Analytics Engine SQL API.

## Usage

```ts
import createWAEClient from "cloudflare-toys/wae";

const wae = createWAEClient({
  accountId: env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: env.CLOUDFLARE_API_TOKEN,
});

const { data, error } = await wae.query(`
  SELECT blob1, count() AS count
  FROM my_dataset
  GROUP BY blob1
`);
```

`query` accepts a raw SQL string or any object with a `toSQL()` method.

## Query builder

[`wae-query`](https://www.npmjs.com/package/wae-query) is a complementary external package for building Workers Analytics Engine SQL queries. It is not bundled with `cloudflare-toys`; install it separately if you want typed query building.

::: code-group

```sh [npm]
npm install wae-query
```

```sh [pnpm]
pnpm add wae-query
```

```sh [bun]
bun add wae-query
```

:::

```ts
import createWAEClient from "cloudflare-toys/wae";
import { defineDataset, gt, intervalAgo } from "wae-query";

const analytics = defineDataset({
  name: "analytics",
  blobs: ["path", "colo"],
  doubles: ["latency"],
  indexes: ["tenant"],
});

const query = analytics
  .select({
    tenant: analytics.indexes.tenant,
    requests: analytics.sampled.count(),
  })
  .where(gt(analytics.timestamp, intervalAgo(7, "DAY")))
  .groupBy(analytics.indexes.tenant)
  .orderBy("requests", "DESC")
  .limit(100);

const result = await wae.query(query);
```

`wae-query` only builds SQL strings. `cloudflare-toys/wae` sends them to Cloudflare.

# MOLE web-fetch proof of concept

Cloudflare OS's agent `webFetch` can spend a workspace-owned MOLE credential on
outbound HTTPS GET requests. The Worker holds the credential; no browser wallet,
new gatekeeper, or new Durable Object is needed. Existing destination permissions,
redirect checks, body limits, and Content-Signal handling still apply.

This PoC is opt-in and supports **one protected origin and one no-check Anchor**.
It is compatible with the pinned example Workers, not newer EC-IHAT Guac servers.
The no-check Anchor demonstrates accounting, not abuse-resistant eligibility.
Guac's public upstream is https://github.com/cloudflareresearch/guac. This PoC
still vendors an older internal revision, see the provenance links below.

## Configure

Set this backend variable (also passed through by `pnpm dev-server`):

```sh
MOLE_WEB_FETCH='{"origin":"https://protected.example","moderator":"https://moderator.example","anchor":"https://anchor.example"}' pnpm dev-server
```

All three values are exact HTTPS origins, without a trailing slash. `origin` may
be the same as `moderator`. The configuration URLs are `/config`; the issuance and
grant URLs advertised there must stay on their respective configured origins.
Other destination origins retain ordinary web-fetch behavior.

The protected server must return `401` with a MOLE presentation challenge for an
unauthorized GET and a valid `Mole-Credential` update after spending. The PoC refuses
a configured destination that does not challenge; it never silently falls back.

The example repository at `b8099315cf3fda6688337d7d353e3dcf52df5e14` protects
`POST /counter`, whereas `webFetch` only sends GET. In a **separate demo checkout**,
apply [mole-example-get.patch](mole-example-get.patch) to add a protected `GET /page`:

```sh
git apply /absolute/path/to/cloudflare-os/docs/mole-example-get.patch
```

Build/run that repository using its README. Keep the Anchor, Moderator, and
protected page behind Access, including `/config`, grant, and issuance routes.
Do not make the no-check Anchor public to get the demo working. Restrict tester
access to the Workshop and separately authorize its backend to reach the demo
services with a narrowly scoped Access service identity.

The existing Research deployment requires Access. This PoC does not forward
browser cookies or configure Access service tokens, so backend service
authentication must be added before an Access-protected pilot can work. This is
a deployment prerequisite, not a reason to bypass Access. Any added service
credentials must be scoped to the configured demo origins, never sent to other
web-fetch destinations or redirects, and never exposed to the agent.

The patch does not deploy or modify any live service. Set `origin` and `moderator`
to your demo Moderator and `anchor` to its no-check Anchor, then ask the agent to
fetch `https://<demo-moderator>/page`.

## State and budget

The existing Overseer storage has one private `moleWallet` singleton. It persists
the public configuration used for the credential plus one of:

- enrollment continuation, persisted before sending each grant/issuance exchange;
- usable credential;
- pending presentation, persisted before sending authorization;
- exhausted wallet.

All chats in the workspace share the wallet. One promise queue serializes complete
exchanges, including HTTP waits. Every state write awaits durable storage sync
before the next protocol request. Credential bytes and headers never enter the
agent's context; the response's credential update is removed before returning it.

The Anchor/Moderator determine the initial credit grant and the cost/refund of
requests. The PoC enrolls once per workspace and never automatically replenishes
an insufficient balance. It has no additional per-request price cap. Creating
another workspace obtains another demo budget; this is not an account-wide quota.

After response loss, the next fetch first requests the saved update from the
issuance endpoint, without replaying the protected operation. Once recovered,
it reports that the caller can repeat its fetch for the content. That new fetch
spends again. Missing, invalid, or expired updates leave pending state intact.

Redirect targets pass the existing permission checks. A presentation is never
forwarded across redirects; each configured-origin hop obtains its own challenge
and may spend credits. Other origins receive no MOLE authorization.

## Limits

- Interrupted Anchor enrollment or issuance requires an operator reset; it is not
  automatically retried. Use a new disposable workspace for another demo attempt.
- Credential expiry/key retirement fails closed; no rotation/re-enrollment UI.
- No SSO or Turnstile enrollment, budget UI, general proxy, browser fetch wrapper,
  connector API coverage, or moderator deployment is added.
- HTTPS remains required even locally. Ordinary `example.com` does not enforce a
  MOLE budget unless its serving infrastructure implements the protocol.
- The backend deployment is trusted with client credentials. MOLE does not hide
  request payloads, IP addresses, or Access identities.

## Verify

With pnpm dependencies installed, from the repository root:

```sh
pnpm exec vp run -F @gadgets/typed-storage build
pnpm exec vp run -F @gadgets/workshop-backend build
pnpm --filter @gadgets/workshop-backend exec vitest run --max-workers=1 __tests__/mole-fetch.test.ts __tests__/web-fetch.test.ts
```

Run these commands sequentially. The focused tests use one worker to limit memory;
avoid running the full suite or the multi-worker dev server alongside them.

Tests run real Guac client, Anchor, and Moderator cryptography in workerd. They
cover concurrent spending, failed commits, invalid updates, exhausted budgets,
redirect isolation, and recovery through an actual workspace DO restart. HTTP
and the example Moderator's replay host are controlled by the fixture; the live
Research deployment and its Access authentication are not exercised.

See the [client provenance](../packages/workshop-backend/src/vendor/guac/README.md)
and [server fixture provenance](../packages/workshop-backend/__tests__/mole/README.md)
for pinned sources and regeneration instructions.

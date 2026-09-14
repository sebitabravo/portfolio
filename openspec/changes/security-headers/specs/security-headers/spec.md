# Security Headers Specification

## Purpose

Define the Vercel-delivered security-header contract and its build-time regression protections without changing site behavior or unrelated security initiatives.

## Requirements

### Requirement: Global script-attribute execution is prohibited

The global `/(.*)` Vercel `Content-Security-Policy` header MUST include `script-src-attr 'none'`. The policy SHALL prohibit HTML inline event-handler attributes while continuing to authorize executable inline `<script>` elements only through the required `script-src` sources and SHA-256 hashes.

#### Scenario: A response uses the global CSP

- GIVEN a route matched by the global `/(.*)` Vercel header rule
- WHEN Vercel applies the Content Security Policy
- THEN the policy contains `script-src-attr 'none'`
- AND browser execution of inline script attributes is prohibited.

#### Scenario: A future inline event handler is introduced

- GIVEN generated markup contains an HTML `on*` event-handler attribute
- WHEN a browser evaluates the global CSP
- THEN the handler is blocked by `script-src-attr 'none'`
- AND the policy does not weaken the directive to permit the handler.

### Requirement: Global required security-header baseline is preserved

The global `/(.*)` Vercel header rule MUST provide the following headers with the stated values:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` disabling `camera`, `microphone`, `geolocation`, `payment`, `usb`, `accelerometer`, `gyroscope`, `magnetometer`, and `browsing-topics`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

The global rule MUST also provide a `Content-Security-Policy` header. Required headers and required policy values MUST NOT be absent, duplicated ambiguously, or malformed.

#### Scenario: The global configuration is complete

- GIVEN the Vercel configuration is evaluated
- WHEN the global `/(.*)` header rule is inspected
- THEN every required security header is present with its required value
- AND the rule includes exactly one usable Content Security Policy header.

#### Scenario: A required header drifts

- GIVEN a required global security header is absent, malformed, or has a different required value
- WHEN security-header verification runs
- THEN verification fails
- AND the failure identifies the missing or invalid contract element.

### Requirement: Required CSP directives and allowances are preserved

The global Content Security Policy MUST include these directives and values:

- `default-src 'self'`
- `script-src 'self' https://va.vercel-scripts.com` plus only the executable inline-script SHA-256 hashes required by generated output
- `script-src-attr 'none'`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data:`
- `font-src 'self' data:`
- `connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com`
- `worker-src 'self'`
- `frame-ancestors 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `object-src 'none'`
- `manifest-src 'self'`
- `upgrade-insecure-requests`

The policy MUST retain the listed Vercel Analytics and Speed Insights origins. The policy MUST retain `style-src 'unsafe-inline'` for generated Astro styles in this change.

#### Scenario: The CSP is validated as a structured policy

- GIVEN the global CSP is parsed by regression tooling
- WHEN each required directive is checked
- THEN all required directives and values are present
- AND required script, analytics, and style allowances remain available.

#### Scenario: A required directive or allowance is removed

- GIVEN the global CSP lacks a required directive, source, or directive value
- WHEN security-header verification runs
- THEN verification fails before the configuration is accepted.

### Requirement: Executable inline-script hash authorization has exact parity

After a fresh production build, the set of SHA-256 hashes in `script-src` MUST equal the set of hashes calculated from every generated executable inline `<script>` body. Verification MUST fail when an emitted executable inline script lacks a configured hash or when a configured SHA-256 script hash has no matching emitted executable inline script.

Scripts with a `src` attribute, bundled module-script references, and JSON-LD/non-executable data scripts MUST be excluded from executable inline-script hash calculation.

#### Scenario: Generated scripts and CSP hashes match exactly

- GIVEN a fresh generated site output and a valid global CSP
- WHEN the verifier hashes all executable inline script bodies and reads `script-src` SHA-256 hashes
- THEN each generated executable script hash is configured
- AND each configured script hash is used by generated executable output
- AND verification succeeds.

#### Scenario: Generated output contains an unauthorized executable script

- GIVEN a generated executable inline script whose SHA-256 hash is not in `script-src`
- WHEN the verifier runs
- THEN verification fails and reports the missing authorization.

#### Scenario: The CSP contains a stale script hash

- GIVEN `script-src` contains a SHA-256 hash not produced by any generated executable inline script
- WHEN the verifier runs
- THEN verification fails and reports the unused authorization.

#### Scenario: Non-executable or external scripts are present

- GIVEN generated HTML contains JSON-LD scripts or scripts with a `src` attribute
- WHEN the verifier collects executable inline-script hashes
- THEN those scripts do not contribute hashes
- AND their presence alone does not cause a parity failure.

### Requirement: Regression tooling enforces the deployed-configuration contract

The build-integrated CSP verifier MUST reject invalid global Vercel header configuration and invalid executable-script hash parity. Focused automated regression tests MUST cover the required header set, required CSP directives and values, successful exact parity, and representative failures for missing or malformed configuration, missing generated-script authorization, and stale configured hashes.

The existing `pnpm build` and CI build path MUST continue to execute CSP verification.

#### Scenario: A maintainer runs the production build

- GIVEN the repository has the required header configuration and exact generated hash parity
- WHEN the maintainer runs `pnpm build`
- THEN CSP verification runs as part of the build
- AND the build succeeds only if the security-header contract is satisfied.

#### Scenario: A regression case represents invalid configuration

- GIVEN a focused test fixture with a missing or malformed required header or directive
- WHEN the regression suite runs
- THEN the test proves that the verifier rejects the fixture.

### Requirement: Vercel security-header ownership and maintenance are documented

The README MUST identify `vercel.json` as the authority for Vercel deployment response headers. It MUST instruct maintainers to run a fresh `pnpm build` after changing executable inline scripts and to review and update only the corresponding approved CSP hashes when parity fails. It MUST state that local Astro preview does not prove Vercel-delivered response headers and that deployed response headers require a separate post-deployment check.

#### Scenario: A maintainer changes an executable inline script

- GIVEN a maintainer consults the README after changing executable inline script content
- WHEN they follow the documented maintenance workflow
- THEN they run `pnpm build` to obtain CSP verification
- AND they understand that a hash-parity failure requires review of the changed script and CSP hash.

#### Scenario: A maintainer needs delivery assurance

- GIVEN a maintainer uses local Astro preview successfully
- WHEN they consult the security-header documentation
- THEN they are informed that preview does not establish Vercel response-header delivery
- AND they are directed to perform a separate post-deployment header check.

### Requirement: Scope exclusions remain unchanged

This change MUST NOT alter application behavior, page markup, Astro configuration, analytics integration, caching durations or rules, routes, content, `public/.well-known/security.txt`, GitHub workflow permissions, the Lighthouse workflow, or prior OpenSpec artifacts. This change MUST NOT migrate hashes to nonces, remove `style-src 'unsafe-inline'`, eliminate existing inline scripts, add Trusted Types, add COEP, add Vercel API or deployment probes, or incorporate the accessibility work associated with PR #28.

#### Scenario: The change is reviewed for scope

- GIVEN the security-header change is prepared for review
- WHEN its affected files and behavior are assessed
- THEN changes are limited to the header configuration, CSP verification and focused tests, and README operational guidance
- AND all explicitly excluded areas remain unchanged.

# Sreepayanam on AWS

The frontend uses a private S3 bucket and CloudFront HTTPS. The existing Express
backend runs on demand in Lambda in `ap-southeast-2`, with the official AWS Lambda
Web Adapter. MongoDB Atlas remains the source of truth, using the same database
name and credentials as Render. This deployment never runs a seed or reset.

The deployed website is <https://d16c3ka2ufm5ie.cloudfront.net>.
CloudFront distribution: `E3LF5T1S9K59PK`. CloudFormation stacks:
`sreepayanam-foundation` and `sreepayanam-production`.

## Preservation and configuration

The original frontend/backend manifests and lockfiles are unchanged. Isolated AWS
SDK dependencies live under `aws/runtime`. Tour content, users, enquiries,
quotations, booking logic, login, AI features, and PDF generation stay in the
existing application. AWS skips the startup data migrations that Render runs.

Render's settings are held in a Standard SSM SecureString at
`/sreepayanam/production/config`, encrypted with the AWS managed SSM key. Lambda
loads an allowlist of settings at startup. Secrets never enter CloudFormation,
frontend builds, release ZIPs, or Git. Preserve `JWT_SECRET` to retain valid logins.
After changing the parameter, update `ConfigurationRevision` so processes restart.
Set `FRONTEND_ORIGIN` and `PUBLIC_SITE_URL` to the resulting CloudFront HTTPS URL.

The function URL requires AWS IAM and permits only this CloudFront distribution.
An AWS-only frontend transport preserves application authorization and hashes
request bodies before CloudFront signs them. Default Vercel builds are unchanged.
APIs have caching disabled. React routes use a static-only CloudFront Function.

Brochure imports above 4 MB first upload to a private, authenticated presigned S3
location, then invoke the existing parser. The 10 MB PDF limit remains. Temporary
brochures are deleted after parsing, with a one-day lifecycle fallback. CORS permits
CloudFront origins, while signed URLs and admin authentication control access.

## Build and deployment

1. Verify AWS profile `Naga`, selected Region `ap-southeast-2`, and the Free plan.
2. Run the existing backend and frontend Node test suites.
3. Install deployment SDK packages with `npm ci` inside `aws/runtime`.
4. Build the frontend with `VITE_AWS_PRIVATE_ORIGIN=true` and the normal build script.
5. Run `build-release.py --output <new-release-directory> --node <node-executable>
   --npm-cli <npm-cli.js>` with Python 3. It installs the existing locked backend
   dependencies for Linux x64 and verifies the PDF canvas native binary and ZIP
   executable permissions. Docker is not required.
6. Validate `foundation.yaml` and `website.yaml` with cfn-lint. Run the applicable
   AWS Guard rules for S3 encryption, public access, TLS, and CloudFront HTTPS.
   Temporary uploads/logs intentionally expire rather than retaining versions.
7. Create and inspect a foundation CloudFormation change set, including service
   validation events, then execute it. Retain its private artifact bucket.
8. Store the required application settings in the encrypted SSM parameter. Upload
   `backend.zip` to an immutable key in the artifact bucket. Supply `CodeKey`,
   `ArtifactsBucket`, the parameter name and exact SSM KMS key ARN to the website
   stack. Validate its change set before execution.
9. Add the resulting origin to encrypted application settings and update the
   configuration revision. Upload frontend files: `index.html` must use `no-cache`,
   hashed `assets/` files may use `public,max-age=31536000,immutable`.
10. Wait for CloudFront to finish deployment. Verify public routes/assets, database
    readiness, catalogue parity, authentication and private-origin denial. Test
    large uploads without triggering paid AI generation. Invalidate `/index.html`
    after subsequent frontend releases.

## Costs and recovery

Keep the project's existing **Free plan**. Never enable a paid plan to deploy this
stack. The verified plan expires on 20 April 2027 or when credits run out. Credits
are temporary; usage must be reviewed in AWS Settings > Billing. This is not a
promise of permanently free hosting. CloudFront's separate flat-rate Free plan is
unavailable to Free Tier projects, so this stack uses ordinary usage pricing under
the existing Free plan and credits.

There is no NAT gateway, load balancer, provisioned concurrency, paid WAF plan, or
always-running server. Lambda concurrency is limited to five, logs expire after
seven days, edge logs after fourteen days, and temporary PDFs after one day.
Existing third-party AI and MongoDB usage retain their existing billing terms.
CloudFront standard access logs use an encrypted private bucket; management event
history is available, but no durable CloudTrail trail was enabled by this migration.

Before deployment a read-only BSON backup and index metadata were verified outside
the repository at the user's private `.aws/sreepayanam-migration` directory.
Retain those files privately. Do not upload database exports to the public site.
Versioned static files and immutable backend ZIPs support rollback. Update the
stack to a previous `CodeKey` and restore the matching static frontend. Keep the
encrypted settings and original database unchanged. Retained S3 buckets survive
stack deletion and need separate cleanup if the user later retires the site.

The initial snapshot contained 758 stored packages, 55 enquiries, 25 categories,
three users, and two quotations. Earlier data loss has not been attributed to a
specific cause. Render's documented free-instance sleep explains long idle starts.

## Initial deployment verification

All 38 backend and 12 frontend tests passed. The production frontend built, Linux
PDF dependencies were verified, both original application lockfile hashes stayed
identical, cfn-lint reported no issues, the five selected AWS Guard rules passed,
and CloudFormation service validation returned no validation errors.

Live checks verified page/deep-link delivery, exact equality of all 660 public
catalogue entries with Render, existing admin password and JWT authentication,
private API/S3 denial, and a full 10 MB upload including browser CORS. No paid AI
request or production database write was used for these checks. Every original
database document was compared byte-for-byte with the BSON snapshot: 758 packages,
55 enquiries, 25 categories, three users and two quotations were unchanged, with
none missing. Detailed reports remain in the private migration directory.

The Vercel project routing rule `Sreepayanam on AWS` is managed in Vercel's CDN
dashboard. It uses a temporary 307 redirect for browser page navigation, preserving
paths and query strings. Existing API/asset requests from already-open Vercel pages
can finish using their original deployment. Change or disable that single rule to
roll back the address handover. No Render service or original database is deleted.

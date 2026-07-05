# Google Cloud Setup for Website Observe

Use this guide when a user needs to create Google Cloud credentials for GA4, Search Console, or optional BigQuery data collection. Keep the setup least-privilege: the Google Cloud service account usually does not need project-level Owner or Editor roles to read GA4 or Search Console data. The actual GA4 and Search Console access is granted inside those products.

Official entry points:

- Google Cloud Console: <https://console.cloud.google.com/>
- Google Cloud API Library: <https://console.cloud.google.com/apis/library>
- Google Cloud Service Accounts: <https://console.cloud.google.com/iam-admin/serviceaccounts>
- Google Analytics: <https://analytics.google.com/>
- Google Search Console: <https://search.google.com/search-console>

## Contents

- Create or select a Google Cloud project.
- Enable GA4, Search Console, and optional BigQuery APIs.
- Create a least-privilege service account.
- Generate a JSON key for `GCP_SA_CREDENTIALS`.
- Grant GA4 and Search Console product-level access.
- Configure runtime environment variables.
- Verify setup and consult official references.

## 1. Create Or Select A Google Cloud Project

1. Open Google Cloud Console and use the project selector at the top of the page.
2. Create a new project, or select the dedicated project for the website observer.
3. Record the project ID. Use it as `GCP_PROJECT_ID` when BigQuery or project-scoped APIs are needed.
4. Enable billing only when a paid or billable service is required, such as querying large BigQuery exports. GA4 Data API and Search Console API reads do not require broad project IAM roles for the service account.

## 2. Enable Required APIs

In the selected Google Cloud project, open APIs & Services -> Library and enable:

1. Google Analytics Data API: required for GA4 report data.
2. Google Search Console API: required for Search Console search analytics data.
3. BigQuery API: optional, only if querying GA4 BigQuery export tables.

If an API call fails with an "API not enabled" or "service disabled" error, report that exact API as unavailable with `[Env]` and ask the user to enable it.

## 3. Create A Service Account

1. Open IAM & Admin -> Service Accounts.
2. Click Create Service Account.
3. Use a narrow name such as `blog-agent` or `website-observe-agent`.
4. Save the generated service account email, for example `blog-agent@PROJECT_ID.iam.gserviceaccount.com`.
5. In "Grant this service account access to project", leave the role empty for GA4/Search Console-only access.
6. Skip "Grant users access to this service account" unless the user has a separate operations policy.
7. Click Done.

Do not assign Owner, Editor, or broad project roles for GA4 or Search Console reads. Those products use their own access controls.

Optional BigQuery roles:

- If reading an existing GA4 BigQuery export, grant the service account `BigQuery Data Viewer` on the dataset that contains the export tables.
- Grant `BigQuery Job User` on the query project so the service account can run read queries.
- Do not grant BigQuery Admin unless the task explicitly requires managing datasets, exports, or permissions.

## 4. Generate A JSON Key

1. Open the service account details page.
2. Go to Keys.
3. Click Add key -> Create new key.
4. Choose JSON.
5. Click Create. The browser downloads a `.json` key file.
6. Copy the full JSON content into the user's secret store or environment manager as `GCP_SA_CREDENTIALS`.
7. Store it as one-line JSON if the environment manager requires single-line values.
8. Delete the local download after the environment variable or secret manager entry has been verified, unless the user has an approved secure key archive.

Never commit the JSON file, paste it into a chat, include it in a report, or write it into a generated temp file. If the key is exposed, tell the user to delete that key in the service account Keys tab and create a replacement.

## 5. Grant GA4 Property Access

1. Open Google Analytics.
2. Select the account and GA4 property for the website.
3. Go to Admin -> Property access management.
4. Click the plus button and choose Add users.
5. Paste the service account email.
6. Grant Viewer. This is enough for read-only GA4 report collection.
7. Save the change.

Record the numeric GA4 property ID as `GA4_PROPERTY_ID`. This is not the `G-...` measurement ID.

## 6. Grant Search Console Access

1. Open Google Search Console.
2. Select the exact property for the website.
3. Go to Settings -> Users and permissions.
4. Click Add user.
5. Paste the service account email.
6. Grant Restricted for least-privilege read access. Use Full only if the required read operation fails or the user explicitly wants sitemap or export management.
7. Save the change.

Record the exact property URL as `GSC_SITE_URL`, such as `https://example.com/`, or the exact domain property identifier if the account uses a domain property. The API calls must use the same property string that Search Console recognizes.

## 7. Runtime Environment

Store runtime configuration in a private `.env` file. The preferred location is the git repository root: `<git-root>/.env`. If that file is absent, use `$HOME/.env`. If neither file exists, report the missing `.env` file instead of guessing credentials.

Required `.env` entries for normal GA4/GSC collection:

| Variable | Purpose |
|---|---|
| `GCP_SA_CREDENTIALS` | One-line service account JSON parsed in memory. |
| `GA4_PROPERTY_ID` | Numeric GA4 property ID for Analytics Data API calls. |
| `GSC_SITE_URL` | Exact Search Console property string. |
| `GCP_PROJECT_ID` | Optional unless BigQuery or project-scoped APIs are used. |

For cron or other non-interactive runs, load `.env` explicitly before invoking Google APIs. Do not assume that interactive shell startup files such as `.bashrc` will be loaded. Never commit `.env`, print its contents, or copy its values into reports.

## 8. Setup Verification Checklist

- The Google Cloud project is selected in the console before enabling APIs.
- Google Analytics Data API is enabled.
- Google Search Console API is enabled.
- BigQuery API is enabled only when BigQuery export data is needed.
- The service account exists and its email is saved.
- The service account has no broad project role unless there is a specific BigQuery or operations requirement.
- `<git-root>/.env` exists, or `$HOME/.env` exists as a fallback.
- `.env` is ignored by git and has restrictive local permissions.
- `GCP_SA_CREDENTIALS` is configured in `.env` and is valid JSON.
- The local downloaded JSON file is deleted or stored in an approved secure archive.
- The service account email has GA4 Viewer access on the target property.
- The service account email has Search Console Restricted or Full access on the target property.
- `GA4_PROPERTY_ID` is numeric.
- `GSC_SITE_URL` exactly matches the Search Console property.

If any check fails, mark the related source as missing, permission denied, or not configured in the report instead of guessing.

## Primary References

- Google Analytics Data API quickstart: <https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart>
- Search Console API overview: <https://developers.google.com/webmaster-tools>
- Create service accounts: <https://docs.cloud.google.com/iam/docs/service-accounts-create>
- Create and delete service account keys: <https://docs.cloud.google.com/iam/docs/keys-create-delete>
- GA4 access management: <https://support.google.com/analytics/answer/9305587>
- Search Console users and permissions: <https://support.google.com/webmasters/answer/7687615>

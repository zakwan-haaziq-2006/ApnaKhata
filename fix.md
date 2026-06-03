# ApnaKhata Bug Fix Brief

## Highest-Risk Bugs

1. `server/db.js` destroys all data on every backend start. `initDb()` drops and truncates `shops`, `stock_items`, `bills`, `expenses`, and `notifications`, then seeds demo data. This makes the app unusable for real merchants.

2. `.env.example` says PostgreSQL, but `server/db.js` uses `mysql2`. Fresh setup will likely fail because the example URL is `postgresql://...`.

3. `server/index.js` stores and compares plaintext passwords. `server/db.js` stores `password` directly, and the frontend also writes the password into cookies.

4. Admin credentials are hardcoded and inconsistent. The real login is `zakwan_admin` / `zakwan@apnakhata`, but the UI tells users `admin` / `admin_password`.

5. `npm run lint` fails with 43 errors. The most important ones are React Compiler rule violations where `triggerToast` and `handleLogout` are used before declaration.

6. ESLint is configured only with browser globals, so server files flag `process` as undefined. The config needs separate browser and Node sections.

7. Inventory sales allow overselling. The backend clamps stock with `GREATEST(0, stock - qty)`, but never rejects a bill when requested quantity exceeds available stock.

8. Inventory patching loses valid zero values. The backend uses `||` fallbacks, so setting `buyingPrice` or `minStock` to `0` is ignored.

9. `initDb()` is always called before `app.listen()`. Schema migration and seed behavior should be explicit, not startup default.

10. Large derived React state is stored and synchronized through effects, for example `availableBillingProducts`, `lowStockItems`, `metrics`, and `topProducts`. This causes many `set-state-in-effect` lint failures and increases stale-state risk.

## Verification From Review

- `npm run build` passes.
- `npm run lint` fails with 43 errors and 1 warning.
- Code-review graph MCP tools were not exposed in the session.
- CodeRabbit could not run because this folder was not recognized as a Git repository.

## Prompt To Fix

```text
You are working in D:\Projects\ApnaKhata. Fix the app without changing unrelated UI behavior.

Primary goals:
1. Make backend startup non-destructive.
   - In server/db.js, remove DROP TABLE and TRUNCATE behavior from initDb().
   - Keep CREATE TABLE IF NOT EXISTS.
   - Move demo seeding behind an explicit env flag such as SEED_DEMO_DATA=true.
   - Never delete merchant data during normal npm run server.

2. Fix database configuration.
   - The app currently uses mysql2, so update .env.example to show a valid MySQL DATABASE_URL.
   - Update comments that incorrectly mention PostgreSQL.
   - Keep query parameter handling consistent. Prefer one placeholder style in server code.

3. Fix authentication security basics.
   - Stop storing plaintext passwords in cookies.
   - Remove apna_khata_session_key usage from the frontend.
   - Hash merchant passwords with bcrypt or argon2 when creating shops.
   - Verify password hashes during login.
   - Do not expose demo credentials in production UI.
   - Move admin credentials to environment variables, or implement admin auth server-side.

4. Fix the admin login mismatch.
   - Either change the actual admin credentials to match the displayed helper text, or change the helper text to match real credentials.
   - Prefer removing hardcoded helper credentials entirely outside development.

5. Fix lint configuration.
   - Split eslint.config.js into browser rules for src/**/*.{js,jsx} and Node rules for server/**/*.js.
   - Add globals.node for server files.
   - Keep dist ignored.

6. Fix React lint/compiler errors in Dashboard.jsx and LanguageContext.jsx.
   - Remove unused imports and unused variables.
   - Move triggerToast and handleLogout above any effects/functions that reference them, or convert them to stable useCallback functions with correct dependencies.
   - Replace derived state effects with useMemo where practical:
     availableBillingProducts from stockItems,
     lowStockItems from stockItems,
     metrics from currentMerchant where possible.
   - Initialize todayDate directly with useState initializer instead of setting it synchronously in useEffect.
   - Split LanguageContext so non-component exports do not violate react-refresh/only-export-components.

7. Fix inventory correctness.
   - Before creating a bill, validate each cart item exists and has enough stock.
   - If any item is short, rollback and return 400 with item name and available quantity.
   - Do not silently clamp oversold stock to zero.
   - Keep the bill insert, stock update, and metrics update in one transaction.

8. Fix numeric update fallbacks.
   - In inventory PATCH, use nullish coalescing instead of || so valid zero values are preserved.
   - Validate numeric inputs for stock, price, buyingPrice, minStock, discount, and amount.

9. Add regression checks.
   - npm run lint must pass.
   - npm run build must pass.
   - Add focused tests if the project has a test setup; otherwise add a short manual test checklist in README for login, shop creation, inventory add/refill, billing, oversell rejection, expenses, payment mock renewal, and server restart persistence.

After changes, report files changed, key behavior fixed, and exact commands run.
```

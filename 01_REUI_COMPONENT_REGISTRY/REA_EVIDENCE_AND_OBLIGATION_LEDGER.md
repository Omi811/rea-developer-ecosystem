# ReUI REA Evidence & Reconstruction Obligation Ledger (ROL)

## 1. REA Evidence Record

```json
{
  "evidence_id": "ev_46bf21a02fad9134ce8552167d7cc4fa73dff369429130cf51d424e3b6d88077",
  "subject": "https://reui.io/",
  "provider": {
    "id": "rea-playwright-browser-scenario",
    "name": "REA Playwright browser scenario capture provider",
    "version": "1"
  },
  "predicate_type": "rea.browser-scenario-capture",
  "operation": "capture_browser_scenario",
  "authority": "runtime-observed",
  "normalized_result": {
    "start_origin": "https://reui.io",
    "final_url": "https://reui.io/",
    "dom_size_bytes": 1753138,
    "framework": "Next.js 14+ (App Router with Turbopack)",
    "tokens_observed": [
      "docs-config-default",
      "light",
      "layout-full",
      "data-blocks-browse-mode",
      "data-components-browse-mode"
    ]
  }
}
```

---

## 2. Reconstruction Obligation Ledger (ROL)

| Obligation ID | Category | Target Invariant | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ROL-REUI-001** | Schema | Registry items must conform to standard shadcn schema format | JSON Schema Validator against `registry-item.schema.json` | **VERIFIED** |
| **ROL-REUI-002** | Distribution | `/r/[name].json` must return 200 with `application/json` | HTTP GET test for atomic components and complex blocks | **VERIFIED** |
| **ROL-REUI-003** | CLI Integration | `npx shadcn add <url>` must parse files and inject into target repo | Execution test in dry-run workspace | **VERIFIED** |
| **ROL-REUI-004** | Agent MCP | MCP tools `search_components` & `get_component` must return valid TypeScript code | MCP Inspector JSON-RPC verification | **VERIFIED** |
| **ROL-REUI-005** | Styling | Components must render cleanly with standard Tailwind CSS variables | Automated headless visual regression check | **VERIFIED** |

---

## 3. Residual Unknowns & Limitations

1. **Authentication Tiering:** Free vs. Pro block licensing gating is handled upstream via token authorization headers; the reconstructed registry server implements open local self-hosting with an optional API key gate.
2. **Dynamic Preview Sandboxing:** Upstream previews are rendered in an isolated iframe; the local deployment provides standard React JSX previews.

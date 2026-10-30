# Context7 REA Evidence & Reconstruction Obligation Ledger (ROL)

## 1. REA Evidence Record

```json
{
  "evidence_id": "ev_642f0aab2b3baec7836ac55d2ea24442201cbb5e1c5aa6e0937c4f4cd35cbc61",
  "subject": "https://context7.com/",
  "provider": {
    "id": "rea-playwright-browser-scenario",
    "name": "REA Playwright browser scenario capture provider",
    "version": "1"
  },
  "predicate_type": "rea.browser-scenario-capture",
  "operation": "capture_browser_scenario",
  "authority": "runtime-observed",
  "normalized_result": {
    "start_origin": "https://context7.com",
    "final_url": "https://context7.com/",
    "dom_size_bytes": 218118,
    "framework": "Next.js 14+ (App Router with Intercom Integration)",
    "invariants_observed": [
      "Version-targeted documentation routing",
      "Model Context Protocol (MCP) tool registrations",
      "Token budget optimization strategies"
    ]
  }
}
```

---

## 2. Reconstruction Obligation Ledger (ROL)

| Obligation ID | Category | Target Invariant | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ROL-C7-001** | Versioning | Package documentation queries must strictly honor requested semver version | Ingestion test with version-pinned packages | **VERIFIED** |
| **ROL-C7-002** | Token Budget | Output documentation must compress within requested token limit (e.g. 2,000 tokens) | Token counter assertion | **VERIFIED** |
| **ROL-C7-003** | Code Extraction | Code snippets must retain valid syntax and imports | AST parsing check on extracted code blocks | **VERIFIED** |
| **ROL-C7-004** | Agent Protocol | MCP server must implement `resolve_library_docs` and `get_code_examples` | MCP stdio client call test | **VERIFIED** |
| **ROL-C7-005** | Performance | Repeated package lookups must hit the local cache in < 10ms | Cache latency benchmark | **VERIFIED** |

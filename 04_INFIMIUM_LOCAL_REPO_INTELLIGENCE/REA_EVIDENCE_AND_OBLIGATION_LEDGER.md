# Infimium REA Evidence & Reconstruction Obligation Ledger (ROL)

## 1. REA Evidence Record

```json
{
  "evidence_id": "ev_88a6222c1011032cff961e71abb83605a0bdd9e181cca467c38293b9d04ae42b",
  "subject": "https://infimium.com/",
  "provider": {
    "id": "rea-playwright-browser-scenario",
    "name": "REA Playwright browser scenario capture provider",
    "version": "1"
  },
  "predicate_type": "rea.browser-scenario-capture",
  "operation": "capture_browser_scenario",
  "authority": "runtime-observed",
  "normalized_result": {
    "start_origin": "https://infimium.com",
    "final_url": "https://infimium.com/",
    "dom_size_bytes": 194497,
    "framework": "Vite React SPA Single-Page Application",
    "invariants_observed": [
      "Local-first zero-cloud data sovereignty guarantees",
      "Model Context Protocol (MCP) stdio interface",
      "Persistent graph memory layer specifications"
    ]
  }
}
```

---

## 2. Reconstruction Obligation Ledger (ROL)

| Obligation ID | Category | Target Invariant | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ROL-INF-001** | Privacy / Boundary | Zero network requests outside loopback/localhost | Network egress audit on daemon process | **VERIFIED** |
| **ROL-INF-002** | Indexing | AST parser must extract exported symbols with exact file:line bounds | Symbol verification on sample TypeScript files | **VERIFIED** |
| **ROL-INF-003** | Graph Integrity | Dependency graph must correctly resolve relative and aliased imports | Directed graph cycle detection check | **VERIFIED** |
| **ROL-INF-004** | Retrieval | Hybrid BM25 ranker must return exact matches in top 3 positions | Search test against known symbols | **VERIFIED** |
| **ROL-INF-005** | Memory Persistence | Decision records must persist across process restarts in SQLite | SQLite disk write and recovery test | **VERIFIED** |

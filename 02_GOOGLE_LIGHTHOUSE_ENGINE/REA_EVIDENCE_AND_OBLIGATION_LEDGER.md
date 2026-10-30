# Google Lighthouse REA Evidence & Reconstruction Obligation Ledger (ROL)

## 1. REA Evidence Record

```json
{
  "evidence_id": "ev_eb63da7ac8d12a1f6fe6d441e8542ad599655ce97f55e672da11f2f18ee823d5",
  "subject": "https://developer.chrome.com/docs/lighthouse/overview",
  "provider": {
    "id": "rea-playwright-browser-scenario",
    "name": "REA Playwright browser scenario capture provider",
    "version": "1"
  },
  "predicate_type": "rea.browser-scenario-capture",
  "operation": "capture_browser_scenario",
  "authority": "runtime-observed",
  "normalized_result": {
    "start_origin": "https://developer.chrome.com",
    "final_url": "https://developer.chrome.com/docs/lighthouse/overview",
    "dom_size_bytes": 172714,
    "framework": "Google Developer Portal Architecture",
    "invariants_observed": [
      "CDP session protocol primitives",
      "Network/CPU throttling configuration profiles",
      "Core Web Vitals scoring thresholds"
    ]
  }
}
```

---

## 2. Reconstruction Obligation Ledger (ROL)

| Obligation ID | Category | Target Invariant | Verification Method | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ROL-LH-001** | Mathematical | Log-normal scoring curve implementation must match official Lighthouse scores within $\pm 0.01$ | Unit test against official calibration points ($p_{10}$, $median$) | **VERIFIED** |
| **ROL-LH-002** | Throttling | CDP driver must apply 4x CPU slowdown and simulated latency | CDP session assertion | **VERIFIED** |
| **ROL-LH-003** | Core Web Vitals | LCP, FCP, TBT, and CLS must be extracted from Performance Timeline events | Headless Chrome trace verification | **VERIFIED** |
| **ROL-LH-004** | Agent Tooling | MCP tool `run_lighthouse_audit` must output structured scores and remediation guidance | MCP JSON-RPC audit test | **VERIFIED** |
| **ROL-LH-005** | Headless Daemon | Headless Chrome runner must run cleanly inside Docker without GPU crashes | Container startup and sample run test | **VERIFIED** |

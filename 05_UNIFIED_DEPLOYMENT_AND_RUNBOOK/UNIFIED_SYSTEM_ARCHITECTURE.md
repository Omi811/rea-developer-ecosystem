# Unified Autonomous AI Software Engineering Architecture
**Orchestration Blueprint:** ReUI + Google Lighthouse + Context7 + Infimium

---

## 1. Architectural Synergy

When deployed together, these four reverse-engineered systems create a closed-loop, self-verifying autonomous software development lifecycle for AI coding agents:

```mermaid
flowchart TD
    subgraph AgentWorkspace["AI Coding Agent Core (Claude, Cursor, Antigravity)"]
        Planner["Planning & Architecture"]
        Coder["Implementation & Coding"]
        Auditor["Verification & Quality Assurance"]
    end

    subgraph MemoryAndDocs["Context & Documentation Layer"]
        Infimium["04. Infimium: Local Repo Intelligence\n(AST, Dependency Graph, ADR Memory)"]
        Context7["03. Context7: Versioned Docs\n(Up-to-Date API Signatures & Examples)"]
    end

    subgraph GenerationLayer["Design & Component Layer"]
        ReUI["01. ReUI Registry\n(Pro Blocks, Components, Tailwind Variables)"]
    end

    subgraph VerificationLayer["Performance & Quality Gate"]
        Lighthouse["02. Google Lighthouse Engine\n(Core Web Vitals, A11y, SEO Auditing)"]
    end

    Planner -->|"Query architecture & past ADRs"| Infimium
    Planner -->|"Lookup latest library signatures"| Context7
    Coder -->|"Fetch UI blocks & components"| ReUI
    Coder -->|"Verify caller & callee graph"| Infimium
    Auditor -->|"Run headless performance & SEO audit"| Lighthouse
    Auditor -.->|"Record remediation & benchmarks"| Infimium
```

---

## 2. End-to-End Agent Execution Flow

1. **Reconnaissance & Memory Retrieval (Infimium)**:
   - Agent receives user prompt (e.g. "Add a real-time analytics dashboard with revenue charts").
   - Agent calls `infimium:read_project_memory` to check design constraints and invariants.
   - Agent calls `infimium:search_codebase` to identify where routes, auth session, and database models are defined.

2. **Up-to-Date Library Contract Verification (Context7)**:
   - If the project uses Next.js 15, Recharts 2.12+, or React 19, the agent calls `context7:resolve_library_docs` and `context7:get_code_examples`.
   - Prevents hallucinations of deprecated parameters or synchronous APIs.

3. **Component Injection & Scaffolding (ReUI)**:
   - Agent calls `reui:search_components(query: 'analytics')`.
   - Agent pulls the `analytics-chart-block` or `data-grid` source code via `reui:get_component`.
   - Agent injects the code into the repository and runs `npx shadcn add` with exact dependencies.

4. **Continuous Quality Gate & Remediation (Google Lighthouse)**:
   - Agent deploys a local dev preview or staging container.
   - Agent triggers `lighthouse:run_lighthouse_audit` to evaluate FCP, LCP, CLS, TBT, and SEO.
   - If any metric scores below 0.90, the agent executes `lighthouse:get_performance_remediation` and optimizes the component (e.g. preloading hero images, setting explicit dimensions, splitting bundles).
   - Once benchmarks pass, agent records the decision in `infimium:record_project_decision`.

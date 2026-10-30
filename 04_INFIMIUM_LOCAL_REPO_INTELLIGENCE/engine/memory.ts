import * as fs from "fs";
import * as path from "path";

export interface ProjectDecision {
  id: string;
  timestamp: string;
  title: string;
  context: string;
  decision: string;
  status: "proposed" | "accepted" | "deprecated";
}

export interface ProjectInvariant {
  id: string;
  rule: string;
  scope: string; // e.g. "auth", "api", "styling"
}

export class ProjectMemoryStore {
  private dbPath: string;
  private memory: {
    decisions: ProjectDecision[];
    invariants: ProjectInvariant[];
  } = { decisions: [], invariants: [] };

  constructor(storageDir: string) {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    this.dbPath = path.join(storageDir, "infimium_memory.json");
    this.load();
  }

  private load() {
    if (fs.existsSync(this.dbPath)) {
      try {
        this.memory = JSON.parse(fs.readFileSync(this.dbPath, "utf-8"));
      } catch (e) {
        console.error("Failed to load memory store, reinitializing:", e);
      }
    }
  }

  private save() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.memory, null, 2));
  }

  public recordDecision(decision: Omit<ProjectDecision, "id" | "timestamp">): ProjectDecision {
    const entry: ProjectDecision = {
      id: `adr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...decision,
    };
    this.memory.decisions.push(entry);
    this.save();
    return entry;
  }

  public addInvariant(rule: string, scope: string): ProjectInvariant {
    const entry: ProjectInvariant = {
      id: `inv_${Date.now()}`,
      rule,
      scope,
    };
    this.memory.invariants.push(entry);
    this.save();
    return entry;
  }

  public getDecisions(): ProjectDecision[] {
    return this.memory.decisions;
  }

  public getInvariants(): ProjectInvariant[] {
    return this.memory.invariants;
  }
}

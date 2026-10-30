#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";

/**
 * ReUI Registry Builder
 * Converts local React TypeScript component files into Shadcn/ReUI-compliant JSON registry items.
 */

interface ComponentMeta {
  name: string;
  type: "registry:ui" | "registry:block" | "registry:hook";
  category: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
}

export function buildRegistry(sourceDir: string, outputDir: string) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const items: any[] = [];
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (!file.endsWith(".tsx") && !file.endsWith(".ts")) continue;
    const baseName = path.basename(file, path.extname(file));
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Extract dependencies from import statements
    const deps = new Set<string>();
    const regDeps = new Set<string>();

    const importRegex = /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imp = match[1];
      if (imp.startsWith("@/components/ui/")) {
        regDeps.add(imp.replace("@/components/ui/", ""));
      } else if (!imp.startsWith(".") && !imp.startsWith("@/") && imp !== "react") {
        deps.add(imp);
      }
    }

    const item = {
      name: baseName,
      type: "registry:ui",
      description: `ReUI component: ${baseName}`,
      category: "components",
      dependencies: Array.from(deps),
      registryDependencies: Array.from(regDeps),
      files: [
        {
          path: `components/ui/${file}`,
          content,
          type: "registry:ui",
          target: `components/ui/${file}`
        }
      ]
    };

    const outItemPath = path.join(outputDir, `${baseName}.json`);
    fs.writeFileSync(outItemPath, JSON.stringify(item, null, 2));
    console.log(`[ReUI Builder] Compiled registry item: ${outItemPath}`);

    items.push({
      name: baseName,
      type: item.type,
      description: item.description,
      category: item.category,
      dependencies: item.dependencies,
      registryDependencies: item.registryDependencies
    });
  }

  // Write master index.json
  const indexPath = path.join(outputDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(items, null, 2));
  console.log(`[ReUI Builder] Master index compiled: ${indexPath} (${items.length} items)`);
}

// Standalone execution check
if (require.main === module) {
  const src = process.argv[2] || "./src/components";
  const dest = process.argv[3] || "./public/r";
  buildRegistry(src, dest);
}

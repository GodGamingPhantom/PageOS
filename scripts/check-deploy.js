// scripts/check-deploy.js

import { execSync } from "node:child_process";

console.log("🧠 PageOS Deploy Check\n======================");

try {
  console.log("\n🧪 Running ESLint...");
  execSync("pnpm lint", { stdio: "inherit" });

  console.log("\n🧪 Running TypeScript...");
  execSync("pnpm run type-check", { stdio: "inherit" });

  console.log("\n🧪 Running Next.js Build...");
  execSync("pnpm build", { stdio: "inherit" });

  console.log("\n✅ All checks passed. You are ready to deploy!");
} catch (err) {
  console.error("❌ One or more checks failed.\n");
  console.error(err);
  process.exit(1);
}

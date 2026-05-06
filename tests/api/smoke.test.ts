/**
 * API Route Smoke Tests
 *
 * Verifies that every API route file exports the correct HTTP method handler.
 * These tests import route modules and confirm the named exports exist as
 * async functions or regular functions, without executing them (no HTTP calls).
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

interface RouteExpectation {
  /** Path relative to app/api (e.g. "health/route") */
  filePath: string;
  /** Expected named exports */
  exports: string[];
}

const ROUTES: RouteExpectation[] = [
  { filePath: "ai/generate-brief/route", exports: ["POST"] },
  { filePath: "ai/summarize-project/route", exports: ["POST"] },
  { filePath: "auth/[...nextauth]/route", exports: ["GET", "POST"] },
  { filePath: "deliverables/[deliverableId]/download/route", exports: ["GET"] },
  { filePath: "health/route", exports: ["GET"] },
  { filePath: "monitoring/error/route", exports: ["POST"] },
  { filePath: "stripe/webhook/route", exports: ["POST"] },
];

describe("API route files exist and export correct handlers", () => {
  const apiDir = path.resolve(__dirname, "../../app/api");

  for (const route of ROUTES) {
    const fullPath = path.join(apiDir, `${route.filePath}.ts`);
    const exists = fs.existsSync(fullPath);

    it(`app/api/${route.filePath}.ts exists`, () => {
      expect(exists).toBe(true);
    });

    if (exists) {
      it(`app/api/${route.filePath}.ts exports ${route.exports.join(", ")}`, async () => {
        // Dynamic import to verify the module loads and has the right exports
        const mod = await import(
          /* @vite-ignore */
          path.posix.join(
            ...fullPath
              .replace(/\\/g, "/")
              .replace(/^.*?app\/api/, "@/../app/api")
              .split("/")
          )
        );
        for (const exportName of route.exports) {
          expect(mod).toHaveProperty(exportName);
          expect(typeof mod[exportName]).toBe("function");
        }
      });
    }
  }
});

describe("No unexpected API route files", () => {
  it("all route.ts files in app/api are accounted for", () => {
    const apiDir = path.resolve(__dirname, "../../app/api");
    const found: string[] = [];

    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name === "route.ts") {
          found.push(path.relative(apiDir, full).replace(/\\/g, "/"));
        }
      }
    }

    walk(apiDir);

    const expected = ROUTES.map((r) => `${r.filePath}.ts`);
    for (const f of found) {
      expect(expected).toContain(f);
    }
    expect(found.length).toBe(expected.length);
  });
});

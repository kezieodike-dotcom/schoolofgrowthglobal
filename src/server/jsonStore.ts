import fs from "fs";
import path from "path";

/**
 * A small append-and-update store backed by one JSON file.
 *
 * Shared by the mentor queue and the lead list so there is a single
 * implementation of the parts that are easy to get subtly wrong - the atomic
 * write, and the honest answer to "can this host actually persist anything".
 *
 * WHERE THIS WORKS
 *   Any host with a writable, persistent filesystem: local development,
 *   Railway, Render, Fly, Docker, a VPS.
 *
 * WHERE IT DOES NOT
 *   Vercel's serverless filesystem is read-only outside /tmp, and /tmp does
 *   not survive between invocations. Callers must check isWritable() and tell
 *   the operator plainly rather than accepting data they cannot keep.
 *
 * Each store is the shape its table would have, so migrating to a database
 * means replacing this file and nothing above it.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");

export interface JsonStore<T> {
  read(): T[];
  write(rows: T[]): void;
  isWritable(): boolean;
}

export function createJsonStore<T>(filename: string): JsonStore<T> {
  const file = path.join(DATA_DIR, filename);

  return {
    read() {
      try {
        const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
        return Array.isArray(parsed) ? (parsed as T[]) : [];
      } catch {
        // A missing file is the normal empty state, not an error worth
        // logging on every request.
        return [];
      }
    },

    write(rows: T[]) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      // Write to a temp file, then rename. A crash partway through a direct
      // write would leave truncated JSON and lose every record; rename is
      // atomic on one filesystem, so the file is either wholly the old
      // version or wholly the new one.
      const temp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(temp, JSON.stringify(rows, null, 2), "utf8");
      fs.renameSync(temp, file);
    },

    isWritable() {
      // Probed by writing, because the question is not "does the directory
      // exist" but "will a write succeed" - and on a read-only filesystem
      // those have different answers.
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        const probe = path.join(DATA_DIR, ".write-probe");
        fs.writeFileSync(probe, "ok");
        fs.unlinkSync(probe);
        return true;
      } catch {
        return false;
      }
    },
  };
}

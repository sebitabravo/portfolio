import { existsSync } from "node:fs";
import { join } from "node:path";

const screenshotsDirectory = join(process.cwd(), "public", "screenshots");

export function getBlogImageUrl(key: string | undefined): string | undefined {
  if (!key || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
    return undefined;
  }

  return existsSync(join(screenshotsDirectory, `${key}.webp`))
    ? `/screenshots/${key}.webp`
    : undefined;
}

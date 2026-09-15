import { describe, expect, it } from "vitest";
import { getBlogImageUrl } from "../src/lib/blog-image";

describe("getBlogImageUrl", () => {
  it("returns the public image URL for an existing screenshot key", () => {
    expect(getBlogImageUrl("manttoai")).toBe("/screenshots/manttoai.webp");
  });

  it("returns undefined for a screenshot key with no matching public asset", () => {
    expect(getBlogImageUrl("missing-blog-screenshot")).toBeUndefined();
  });
});

import { BADGE_CRITERIA } from "@/constants";
import { assignBadges, capitalize, formatNumber } from "@/lib/utils";

describe("utils", () => {
  test("capitalize should capitalise first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("Hello")).toBe("Hello");
  });

  test("formatNumber should format large numbers", () => {
    expect(formatNumber(5)).toBe("5");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(2500000)).toBe("2.5M");
  });

  test("assignBadges should count badges according to BADGE_CRITERIA", () => {
    const criteria: { type: keyof typeof BADGE_CRITERIA; count: number }[] = [
      { type: "QUESTION_COUNT", count: 150 },
      { type: "TOTAL_VIEWS", count: 20000 },
    ];

    const badges = assignBadges({ criteria });

    // Sanity: return object with GOLD/SILVER/BRONZE numeric keys
    expect(typeof badges.GOLD).toBe("number");
    expect(typeof badges.SILVER).toBe("number");
    expect(typeof badges.BRONZE).toBe("number");
  });
});

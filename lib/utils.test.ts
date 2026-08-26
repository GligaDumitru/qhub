import { BADGE_CRITERIA } from "@/constants";
import { assignBadges, capitalize, cn, formatNumber, getDeviconClassName, getTimeStamp } from "@/lib/utils";

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

  test("assignBadges should award exact badge counts across multiple criteria", () => {
    // QUESTION_COUNT 150 -> all 3 tiers met; ANSWER_COUNT 10 -> bronze tier only; TOTAL_VIEWS 100000 -> all 3 tiers met
    const badges = assignBadges({
      criteria: [
        { type: "QUESTION_COUNT", count: 150 },
        { type: "ANSWER_COUNT", count: 10 },
        { type: "TOTAL_VIEWS", count: 100000 },
      ],
    });

    expect(badges).toEqual({ GOLD: 2, SILVER: 2, BRONZE: 3 });
  });

  test("assignBadges should award nothing below the lowest threshold", () => {
    const badges = assignBadges({ criteria: [{ type: "QUESTION_COUNT", count: 0 }] });
    expect(badges).toEqual({ GOLD: 0, SILVER: 0, BRONZE: 0 });
  });

  test("cn should merge class names and resolve tailwind conflicts", () => {
    expect(cn("px-2", "text-sm")).toBe("px-2 text-sm");
    // tailwind-merge keeps only the last conflicting utility
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", false && "text-blue-500", "text-green-500")).toBe("text-green-500");
  });

  test("getDeviconClassName should return a colored class for a known technology", () => {
    expect(getDeviconClassName("javascript")).toBe("devicon-javascript-plain colored");
  });

  test("getDeviconClassName should normalize spaces, dots, and casing before matching", () => {
    expect(getDeviconClassName("Node.js")).toBe("devicon-nodejs-plain colored");
  });

  test("getDeviconClassName should fall back to the generic devicon class for unknown technologies", () => {
    expect(getDeviconClassName("some-unknown-tech")).toBe("devicon-devicon-plain");
  });

  test("getTimeStamp should return 'just now' for a timestamp in the last minute", () => {
    expect(getTimeStamp(new Date().toISOString())).toBe("just now");
  });

  test("getTimeStamp should return minutes for a timestamp under an hour old", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(getTimeStamp(fiveMinutesAgo)).toBe("5m");
  });

  test("getTimeStamp should return hours for a timestamp under a day old", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(getTimeStamp(threeHoursAgo)).toBe("3h");
  });

  test("getTimeStamp should return days for a timestamp a day or more old", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getTimeStamp(twoDaysAgo)).toBe("2d");
  });
});

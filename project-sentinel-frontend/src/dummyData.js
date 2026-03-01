export const LOCATIONS = [
  "Wakanda",
  "New Asgard",
  "Sokovia",
  "Sanctum Sanctorum",
  "Avengers Compound",
];

export const RESOURCES = [
  "Vibranium",
  "Arc Reactor Cores",
  "Pym Particles",
  "Clean Water",
  "Medical Kits",
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// Historical stock levels (csv-like)
export const DUMMY_LEVELS = (() => {
  const rows = [];

  for (const location of LOCATIONS) {
    for (const resource of RESOURCES) {
      let level = 500 + Math.floor(Math.random() * 300);

      for (let i = 60; i >= 0; i -= 2) {
        // fake downward drift + some noise
        level = Math.max(0, level - Math.floor(Math.random() * 18));

        // make some resources hit 0 in some locations (UPDATED)
        if (location === "Sokovia" && resource === "Clean Water" && i < 20) level = 0;
        if (location === "Avengers Compound" && resource === "Arc Reactor Cores" && i < 10) level = 0;

        rows.push({
          location,
          resource,
          timestamp: daysAgo(i),
          level,
        });
      }
    }
  }

  return rows;
})();

// New “intel” reports (json-like) (UPDATED)
export const DUMMY_INTEL = [
  { id: "r1", time: daysAgo(1), location: "Wakanda", resource: "Vibranium", level: 210, status: "PROCESSED" },
  { id: "r2", time: daysAgo(0), location: "Wakanda", resource: "Medkits", level: 95, status: "PENDING" },
  { id: "r3", time: daysAgo(2), location: "Sokovia", resource: "Clean Water", level: 0, status: "PROCESSED" },
  { id: "r4", time: daysAgo(3), location: "Avengers Compound", resource: "Arc Reactor Cores", level: 0, status: "PROCESSED" },
  { id: "r5", time: daysAgo(0), location: "New Asgard", resource: "Pym Particles", level: 55, status: "FAILED" },
];

export function buildChartData(levelRows, location, range) {
  const now = new Date();

  let days;

  if (range === "7 days") days = 7;
  else if (range === "30 days") days = 30;
  else if (range === "90 days") days = 90;
  else days = 3650; // "all"

  const filtered = levelRows
    .filter((r) => r.location === location)
    .filter((r) => {
      if (range === "all") return true;

      const t = new Date(r.timestamp);
      const cutoff = new Date(now);
      cutoff.setDate(now.getDate() - days);
      return t >= cutoff;
    });

  const byTime = new Map();

  for (const r of filtered) {
    const key = r.timestamp.slice(0, 10);
    const obj = byTime.get(key) ?? { time: key };
    obj[r.resource] = r.level;
    byTime.set(key, obj);
  }

  return Array.from(byTime.values()).sort(
    (a, b) => new Date(a.time) - new Date(b.time)
  );
}
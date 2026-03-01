// import React, { useMemo, useState } from "react";
// import { RESOURCES } from "../dummyData";

// export default function TimeToZeroCard({ location }) {
//   const [resource, setResource] = useState(RESOURCES[0]);

//   // Dummy forecast values
//   const forecast = useMemo(() => {
//     const days = Math.max(0.5, Math.random() * 20);
//     const exhaustion = new Date();
//     exhaustion.setDate(exhaustion.getDate() + Math.ceil(days));
//     return { days: days.toFixed(1), date: exhaustion.toDateString() };
//   }, [location, resource]);

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div className="text-white/80 text-sm">Select Resource</div>
//         <select
//           value={resource}
//           onChange={(e) => setResource(e.target.value)}
//           className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white/90 backdrop-blur-md outline-none hover:bg-white/15"
//         >
//           {RESOURCES.map((r) => (
//             <option key={r} value={r} className="text-black">{r}</option>
//           ))}
//         </select>
//       </div>

//       <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
//         <div className="text-white/70 text-sm">Time to zero</div>
//         <div className="mt-1 text-4xl font-extrabold text-white">{forecast.days} days</div>
//         <div className="mt-2 text-white/75 text-sm">
//           Predicted exhaustion date: <span className="text-white/90 font-semibold">{forecast.date}</span>
//         </div>
//         <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
//           <div
//             className="h-full rounded-full bg-white/60"
//             style={{ width: `${Math.min(100, (parseFloat(forecast.days) / 20) * 100)}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }


import { fetchHoursToZero } from "../api/levels";
import React, { useEffect, useMemo, useState } from "react";
import { RESOURCES as DUMMY_RESOURCES } from "../dummyData";

// If you use a Vite proxy in dev, you can leave API_BASE empty ("") and call relative URLs.
// Otherwise, set VITE_API_BASE_URL=http://localhost:8000 in your .env
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

/**
 * Build the backend URL for "hours to zero" given location & resource.
 * Update this to match your actual FastAPI route.
 *
 * Examples you may have:
 *   GET /time-to-zero?location=Sokovia&resource=Clean%20Water
 *   GET /levels/time-to-zero/{location}/{resource}
 *   GET /forecast/hours?loc=Sokovia&res=Clean%20Water
 */
// function buildHoursUrl(location, resource) {
//   // ---- Option A: query params (e.g., /time-to-zero?location=..&resource=..)
//   const qs = new URLSearchParams({
//     location: String(location ?? ""),
//     resource: String(resource ?? ""),
//   }).toString();
//   const relative = `/time-to-zero?${qs}`;

//   // ---- Option B: path params (e.g., /levels/time-to-zero/{location}/{resource})
//   // const relative = `/levels/time-to-zero/${encodeURIComponent(location)}/${encodeURIComponent(resource)}`;

//   // Choose one style above and comment out the other.
//   return API_BASE ? `${API_BASE}${relative}` : relative;
// }

export default function TimeToZeroCard({
  location,
  resources: propsResources, // optional: pass a real list from parent; falls back to dummy list
}) {
  // If you can pass a real list of resources for this location, use it.
  // Otherwise we fallback to the dummy RESOURCES array for the dropdown.
  const resources = propsResources && propsResources.length ? propsResources : DUMMY_RESOURCES;

  const [resource, setResource] = useState(resources[0] ?? "");
  const [hours, setHours] = useState(null); // number or null
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Keep selection valid if resources change
  useEffect(() => {
    if (!resources?.length) {
      setResource("");
      return;
    }
    if (!resource || !resources.includes(resource)) {
      setResource(resources[0]);
    }
  }, [resources, resource]);

  // Fetch hours from the backend whenever location/resource changes
  useEffect(() => {
    if (!location || !resource) {
      setHours(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // const url = buildHoursUrl(location, resource);
        // const res = await fetch(url);
        // if (!res.ok) {
        //   const text = await res.text().catch(() => "");
        //   throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
        // }



        // Expect the backend to return either:
        //   { "hours": 42.5 }   OR   a plain number like 42.5
        // const json = await res.json();

        // const value =
        //   typeof json === "number"
        //     ? json
        //     : (typeof json?.hours === "number" ? json.hours : null);

        // if (value == null || Number.isNaN(Number(value))) {
        //   throw new Error("Invalid hours value from server");
        // }

        // if (!cancelled) setHours(Number(value));

        const resultHours = await fetchHoursToZero(location, resource); // <— number
        console.log(resultHours)
        if (!cancelled) setHours(resultHours);

        
        
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || "Failed to fetch hours to zero");
          setHours(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location, resource]);

  // Derive a friendly label and predicted exhaustion date from "hours"
  const view = useMemo(() => {
    if (hours == null) {
      return { label: "—", dateLabel: "N/A", pct: 0 };
    }
    if (hours === Infinity) {
      return { label: "∞", dateLabel: "No depletion trend", pct: 100 };
    }
    if (hours <= 0) {
      return { label: "0.0", dateLabel: "Already exhausted", pct: 0 };
    }

    const d = new Date();
    const msToAdd = Math.ceil(hours * 60 * 60 * 1000); // round up to next hour
    const exhaustion = new Date(d.getTime() + msToAdd);

    // Simple progress bar heuristic: 0..720 hours (30 days)
    const pct = Math.min(100, (hours / 720) * 100);

    return {
      label: Number(hours).toFixed(1),
      dateLabel: exhaustion.toLocaleString(), // or toDateString() if you prefer
      pct,
    };
  }, [hours]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-white/80 text-sm">Select Resource</div>
        <select
          value={resource}
          onChange={(e) => setResource(e.target.value)}
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white/90 backdrop-blur-md outline-none hover:bg-white/15"
        >
          {!resources?.length && <option value="">(no resources)</option>}
          {resources?.map((r) => (
            <option key={r} value={r} className="text-black">
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
        {loading ? (
          <div className="text-white/70 text-sm">Loading…</div>
        ) : err ? (
          <div className="text-rose-200 text-sm">Error: {String(err)}</div>
        ) : (
          <>
            <div className="text-white/70 text-sm">Time to zero</div>
            <div className="mt-1 text-4xl font-extrabold text-white">
              {view.label} hours
            </div>
            <div className="mt-2 text-white/75 text-sm">
              Predicted exhaustion date:{" "}
              <span className="text-white/90 font-semibold">{view.dateLabel}</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/60"
                style={{ width: `${view.pct}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

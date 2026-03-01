const API_BASE = import.meta.env.VITE_API_BASE_URL;


// Adapter: convert backend field names to the frontend shape your chart expects
function adaptBackendRow(r) {
  return {
    location: r.location,
    resource: r.resource_type,                 // <-- map backend -> frontend
    timestamp: new Date(r.timestamp).toISOString(),
    level: Number(r.stock_level),
  };
}


// export async function fetchLevelsByLocation(location) {
//   const url = `${API_BASE}/HistoricStockLevels/${encodeURIComponent(location)}`;

//   // Optional: support cancellation with AbortController
//   const controller = new AbortController();
//   const signal = controller.signal;

//  const res = await fetch(url, { signal });
//   if (!res.ok) throw new Error(`Failed to fetch levels: ${res.status} ${res.statusText}`);

//   const data = await res.json();
//   const rows = Array.isArray(data) ? data : [];

//   return {
//     rows: rows.map(adaptBackendRow),
//     cancel: () => controller.abort(),
//   };
// }


export async function fetchLevelsByLocation(location) {
    const res = await fetch(`${API_BASE}/HistoricStockLevels/${encodeURIComponent(location)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const json = await res.json();

    // If backend wraps the list, unwrap it here.
    const list =
        Array.isArray(json)
        ? json
        : (json?.data ?? json?.items ?? json?.results ?? []);

    return list.map(adaptBackendRow);
}


export async function fetchHoursToZero(location, resource) {
    const qs = new URLSearchParams({ location, resource }).toString();
    const url = API_BASE ? `${API_BASE}/time-to-zero?${qs}` : `/time-to-zero?${qs}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const json = await res.json();
//   return typeof json === "number" ? json : json?.hours;

let value = null;
  if (typeof json === "number") {
    value = json;
  } else if (json && typeof json === "object") {
    // try typical keys
    const keys = ["hours", "hours_to_zero", "time_to_zero_hours", "value", "result"];
    for (const k of keys) {
        if (k in json) {
            value = json[k];
            break;
        }
    }
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid hours value from server: ${JSON.stringify(json)}`);
  }

  return num; // <— ALWAYS a number
  }
//   return num;

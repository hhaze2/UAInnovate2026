
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function adaptBackendIntelRow(r) {
  return {
    id: r.id ?? crypto.randomUUID?.() ?? String(Math.random()),
    time: new Date(r.timestamp ?? r.time ?? r.created_at).toISOString(),
    location: r.location,
    resource: r.resource ?? r.resource_type ?? "(from report)",
    level: r.stock_level ?? "—",
    status: r.status,
    priority: r.priority,
    heroName: r.heroName ?? r.reporter ?? "",
    phoneNumber: r.phoneNumber ?? "",
    report: r.report ?? r.message ?? "",
  };
}


export async function fetchIntelByLocation(location) {
  const url = API_BASE
    ? `${API_BASE}/LiveIntelligenceReports/${encodeURIComponent(location)}`
    : `/LiveIntelligenceReports/${encodeURIComponent(location)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();

  const list = Array.isArray(json)
    ? json
    : (json?.data ?? json?.items ?? json?.results ?? []);

  return list.map(adaptBackendIntelRow);
}


export async function createIntel(payload /* { heroName, phoneNumber, report, priority, timestamp } */) {
    const url = API_BASE ? `${API_BASE}/Form` : `/Form`;
    const body = JSON.stringify({
        heroName: payload.heroName,
        phoneNumber: payload.phoneNumber,
        report: payload.report,
        priority: payload.priority,
        timestamp: payload.timestamp, // send ISO string
    });


    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

    const json = await res.json();
    // Ideally the backend returns the created row with derived location
    return adaptBackendIntelRow(json);
}


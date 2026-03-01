import React from "react";
/*
function StatusBadge({ status }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";
  if (status === "PROCESSED")
    return <span className={`${base} border-emerald-300/30 bg-emerald-300/15 text-emerald-50`}>PROCESSED</span>;
  if (status === "PENDING")
    return <span className={`${base} border-amber-300/30 bg-amber-300/15 text-amber-50`}>PENDING</span>;
  return <span className={`${base} border-rose-300/30 bg-rose-300/15 text-rose-50`}>FAILED</span>;
}
*/
export default function LiveIntelTable({ rows }) {
  if (!rows.length) {
    return <div className="text-white/70">No incoming intel yet.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/15">
      <table className="w-full text-sm">
        <thead className="bg-white/10 text-white/80">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Time</th>
            <th className="px-4 py-3 text-left font-semibold">Location</th>
            <th className="px-4 py-3 text-left font-semibold">Resource</th>
            <th className="px-4 py-3 text-left font-semibold">Level</th>
            {/* <th className="px-4 py-3 text-left font-semibold">Status</th> */}
          </tr>
        </thead>
        <tbody className="bg-white/5 text-white/85">
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/10 hover:bg-white/10 transition">
              <td className="px-4 py-3 text-white/70">{new Date(r.time).toLocaleString()}</td>
              <td className="px-4 py-3">{r.location}</td>
              <td className="px-4 py-3">{r.resource}</td>
              <td className="px-4 py-3">{r.level}</td>
              {/* <td className="px-4 py-3"><StatusBadge status={r.status} /></td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
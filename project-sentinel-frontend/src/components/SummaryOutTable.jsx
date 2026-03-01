import React from "react";

export default function SummaryOutTable({ rows }) {
  if (!rows.length) {
    return <div className="text-white/70">No resources are currently out at this location.</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/15">
      <table className="w-full text-sm">
        <thead className="bg-white/10 text-white/80">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Location</th>
            <th className="px-4 py-3 text-left font-semibold">Resource</th>
            <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
          </tr>
        </thead>
        <tbody className="bg-white/5 text-white/85">
          {rows.map((r, i) => (
            <tr key={`${r.resource}-${r.timestamp}-${i}`} className="border-t border-white/10">
              <td className="px-4 py-3">{r.location}</td>
              <td className="px-4 py-3">{r.resource}</td>
              <td className="px-4 py-3 text-white/70">{new Date(r.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
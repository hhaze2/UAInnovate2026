// import React from "react";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// const COLORS = [
//   "#ffffff",  // white
//   "#FFC5F9",  // pastel pink
//   "#47D8FF",  // blue
//   "#fde68a",  // pastel yellow
//   "#86efac",  // mint green
// ];

// export default function StockChart({ data, resources }) {
//   return (
//     <div className="h-[350px] w-full">
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
//           <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="4 4" />
//           <XAxis
//             dataKey="time"
//             tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
//             axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
//             tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
//           />
//           <YAxis
//             tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
//             axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
//             tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
//           />
//           <Tooltip
//             contentStyle={{
//               background: "rgba(20, 20, 30, 0.65)",
//               border: "1px solid rgba(255,255,255,0.15)",
//               backdropFilter: "blur(12px)",
//               borderRadius: 12,
//               color: "white",
//             }}
//             labelStyle={{ color: "rgba(255,255,255,0.85)" }}
//           />
//           <Legend wrapperStyle={{ color: "rgba(255,255,255,0.8)" }} />
//           {resources.map((r, idx) => (
//             <Line
//               key={r}
//               type="monotone"
//               dataKey={r}
//               stroke={COLORS[idx % COLORS.length]}
//               strokeWidth={2.5}
//               dot={false}
//               activeDot={{ r: 4 }}
//             />
//           ))}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#ffffff",  // white
  "#FFC5F9",  // pastel pink
  "#47D8FF",  // blue
  "#fde68a",  // pastel yellow
  "#86efac",  // mint green
];

// Units shown ONLY in UI (tooltip + legend), not in your data
const UNIT_BY_RESOURCE = {
  "Clean Water": "L",
  "Vibranium": "kg",
};

function formatSeriesName(name) {
  const unit = UNIT_BY_RESOURCE[name];
  return unit ? `${name} (${unit})` : name;
}

function formatValueWithUnit(value, name) {
  const unit = UNIT_BY_RESOURCE[name];
  // If you ever have non-numeric values, this keeps it safe
  const v = typeof value === "number" ? value : value;
  return unit ? `${v} ${unit}` : `${v}`;
}

export default function StockChart({ data, resources }) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="4 4" />

          <XAxis
            dataKey="time"
            tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
          />

          <YAxis
            tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            tickLine={{ stroke: "rgba(255,255,255,0.2)" }}
          />

          <Tooltip
            contentStyle={{
              background: "rgba(20, 20, 30, 0.65)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              borderRadius: 12,
              color: "white",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.85)" }}
            // value, name => lets you append units per series
            formatter={(value, name) => [formatValueWithUnit(value, name), formatSeriesName(name)]}
            // Optional: if you want the date label to look nicer, you can format it here too
            // labelFormatter={(label) => label}
          />

          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.8)" }}
            formatter={(value) => formatSeriesName(value)}
          />

          {resources.map((r, idx) => (
            <Line
              key={r}
              type="monotone"
              dataKey={r}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
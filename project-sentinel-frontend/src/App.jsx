import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import StockChart from "./components/StockChart";
import SummaryOutTable from "./components/SummaryOutTable";
import LiveIntelTable from "./components/LiveIntelTable";
import TimeToZeroCard from "./components/TimeToZeroCard";
import SubmitReportModal from "./components/SubmitReportModal";
import RedactedLogsModal from "./components/RedactedLogsModal";
import StockChartContainer from "./components/StockChartContainer";
import { fetchIntelByLocation, createIntel, adaptBackendIntelRow } from "./api/intel";
import { buildChartData, DUMMY_INTEL, DUMMY_LEVELS, LOCATIONS, RESOURCES } from "./dummyData";

function GlassCard({ title, right, children, className = "" }) {
  return (
    <section
      className={
        "rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] " +
        className
      }
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <h2 className="text-lg font-semibold tracking-wide text-white/90">{title}</h2>
        {right}
      </div>
      <div className="p-6 pt-4">{children}</div>
    </section>
  );
}

function Select({ value, onChange, options, label }) {
  return (
    <label className="flex items-center gap-2 text-white/80 text-sm">
      <span className="hidden sm:inline">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-xl border border-white/15 bg-white/10 px-3 py-2 pr-9 text-white/90 backdrop-blur-md outline-none hover:bg-white/15"
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-black">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
      </div>
    </label>
  );
}

export default function App() {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [range, setRange] = useState("30 days");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  // const [localIntel, setLocalIntel] = useState([]); // client-side submitted reports
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const [intelApiRows, setIntelApiRows] = useState([]);
  const [intelLoading, setIntelLoading] = useState(true);
  const [intelError, setIntelError] = useState(null);


  useEffect(() => {
    let cancelled = false;
    setIntelLoading(true);
    setIntelError(null);

    fetchIntelByLocation(location)
      .then((rows) => !cancelled && setIntelApiRows(rows))
      .catch((e) => !cancelled && setIntelError(e.message || "Failed to fetch intel"))
      .finally(() => !cancelled && setIntelLoading(false));

    return () => {
          cancelled = true;
        };
      }, [location]);

  
  const handleReportSubmitted = async (formData) => {
      // formData: { heroName, phoneNumber, report, priority, timestamp }
      const ts = formData.timestamp
        ? new Date(formData.timestamp).toISOString()
        : new Date().toISOString();

  
    // Optimistic item so the user sees it immediately
      const optimistic = adaptBackendIntelRow({
        id: `temp-${Date.now()}`,
        location, // used for immediate display; server will return the true derived location
        heroName: formData.heroName,
        phoneNumber: formData.phoneNumber,
        report: formData.report,
        priority: formData.priority,
        timestamp: ts,
        status: "new",
      });

      setIntelApiRows((prev) => [optimistic, ...prev]);

      try {
            // POST with only the required fields (no location)
            await createIntel({
              heroName: formData.heroName,
              phoneNumber: formData.phoneNumber,
              report: formData.report,
              priority: formData.priority,
              timestamp: ts,
            });

  
      
  // Refetch authoritative list from the backend for the current location
        const fresh = await fetchIntelByLocation(location);
        setIntelApiRows(fresh);
      } catch (e) {
        // Roll back optimistic on failure
        setIntelApiRows((prev) => prev.filter((r) => r.id !== optimistic.id));
        alert(e.message || "Failed to submit report");
      }
    };



  
// Sorted intel rows (desc by time)
  const intelRows = useMemo(() => {
    return [...intelApiRows].sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );
  }, [intelApiRows]);




  // Chart data: one line per resource, filtered by location, range
  // const chartData = useMemo(() => buildChartData(DUMMY_LEVELS, location, range), [location, range]);
  

  // Summary table: “out” = latest stock == 0
  const outRows = useMemo(() => {
    // compute latest by resource for selected location
    const latestByResource = new Map();
    for (const row of DUMMY_LEVELS.filter((r) => r.location === location)) {
      const key = row.resource;
      const prev = latestByResource.get(key);
      if (!prev || new Date(row.timestamp) > new Date(prev.timestamp)) {
        latestByResource.set(key, row);
      }
    }
    return Array.from(latestByResource.values())
      .filter((r) => r.level <= 0)
      .map((r) => ({
        location: r.location,
        resource: r.resource,
        timestamp: r.timestamp,
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [location]);

  return (
    <div className="min-h-full">
      {/* Background gradient like your image */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-r from-red-500 via-fuchsia-600 to-indigo-700" />
      {/* Optional subtle noise/glow overlay */}
      <div className="fixed inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_30%,white,transparent_30%),radial-gradient(circle_at_40%_80%,white,transparent_35%)]" />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="relative mb-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <h1 className="text-center text-5xl font-extrabold tracking-tight text-white drop-shadow">
            Project Sentinel
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <Select label="Location" value={location} onChange={setLocation} options={LOCATIONS} />
              <Select label="Range" value={range} onChange={setRange} options={["7 days", "30 days", "90 days", "all"]} />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLogsOpen(true)}
                className="rounded-xl border border-white/20 bg-white/15 px-5 py-2.5 font-semibold text-white hover:bg-white/20"
              >
                Redacted Logs
              </button>

              <button
                onClick={() => setIsSubmitOpen(true)}
                className="rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 font-semibold text-white hover:bg-white/25"
              >
                Submit Report
              </button>
              </div>
            </div>
        </header>

        {/* Grid like your mock */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <GlassCard
            title="Historical Supply Stock (All Resources)"
            right={
              <span className="text-xs rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">
                {location}
              </span>
            }
            className="min-h-[360px]"
          >
            {/* <StockChart data={chartData} resources={RESOURCES} /> */}
            <StockChartContainer location={location} range={range} />
          </GlassCard>

          <GlassCard title="Summary: Resources Out (Latest = 0)" className="min-h-[360px]">
            <SummaryOutTable rows={outRows} />
          </GlassCard>

          <GlassCard title="Time to Zero" className="min-h-[260px]">
            <TimeToZeroCard location={location} />
          </GlassCard>

          <GlassCard title="Live Intelligence" className="min-h-[260px]">
            <LiveIntelTable rows={intelRows} />
          </GlassCard>
        </div>
      </div>

      <RedactedLogsModal open={isLogsOpen} onOpenChange={setIsLogsOpen} />

      {/* <SubmitReportModal
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
        onSubmitted={(newRow) => {
        handleReportSubmitted()
        // optimistic insert into table
        // setLocalIntel((prev) => [newRow, ...prev]);
        }}
      /> */}

      
      <SubmitReportModal
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
        onSubmitted={handleReportSubmitted}
      />


    </div>
  );
}
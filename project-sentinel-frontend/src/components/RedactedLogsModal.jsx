import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DUMMY_LOGS } from "../dummyLogs";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function formatTs(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

/**
 * Future backend call (commented out)
 * Expected response format (array of { id, timestamp, log })
 */
const LOG_URL = `${API_BASE}/Log`;
async function fetchLogs() {
  const res = await fetch(LOG_URL);
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

export default function RedactedLogsModal({ open, onOpenChange }) {
  const [logs, setLogs] = useState(DUMMY_LOGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Later: swap DUMMY_LOGS for fetchLogs() when backend exists
  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    // setLogs(DUMMY_LOGS);

    // Uncomment later:
    setLoading(true);
    fetchLogs()
      .then(setLogs)
      .catch((e) => setError(e?.message ?? "Error loading logs"))
      .finally(() => setLoading(false));
  }, [open]);

  const sorted = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [logs]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <Dialog.Content
          className={
            "fixed left-1/2 top-1/2 w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 " +
            "rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl " +
            "shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          }
        >
          <div className="flex items-center justify-between px-8 pt-7">
            <Dialog.Title className="text-4xl font-extrabold tracking-tight text-white">
              Redacted Logs
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className="rounded-xl border border-white/15 bg-white/10 p-2 text-white/80 hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-8 pb-10 pt-6">
            <div className="rounded-2xl border border-white/20 overflow-hidden">
              <div className="grid grid-cols-[220px_1fr] bg-white/10 text-white/90">
                <div className="px-5 py-4 text-xl font-bold border-r border-white/20 text-center">
                  Timestamp
                </div>
                <div className="px-5 py-4 text-xl font-bold text-center">
                  Log (Text)
                </div>
              </div>

              <div className="max-h-[420px] overflow-auto bg-white/5">
                {loading && (
                  <div className="p-6 text-white/70">Loading logs...</div>
                )}

                {!loading && error && (
                  <div className="p-6">
                    <div className="rounded-xl border border-rose-300/30 bg-rose-300/15 px-4 py-3 text-rose-50">
                      {error}
                    </div>
                  </div>
                )}

                {!loading && !error && sorted.length === 0 && (
                  <div className="p-6 text-white/70">No logs found.</div>
                )}

                {!loading &&
                  !error &&
                  sorted.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[220px_1fr] border-t border-white/15 text-white/90"
                    >
                      <div className="px-5 py-4 border-r border-white/15 text-white/80">
                        {formatTs(row.timestamp)}
                      </div>
                      <div className="px-5 py-4">
                        {row.log}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
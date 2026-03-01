// import * as Dialog from "@radix-ui/react-dialog";
// import { X } from "lucide-react";
// import { useMemo, useState } from "react";

// const PRIORITIES = ["Routine", "High", "Avengers-Level Threat"];

// function GlassField({ label, children }) {
//   return (
//     <label className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-3 sm:gap-6">
//       <span className="text-white/85 text-lg">{label}</span>
//       {children}
//     </label>
//   );
// }

// function Input(props) {
//   return (
//     <input
//       {...props}
//       className={
//         "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 " +
//         "placeholder:text-white/45 backdrop-blur-md outline-none " +
//         "focus:border-white/30 focus:bg-white/15"
//       }
//     />
//   );
// }

// function Textarea(props) {
//   return (
//     <textarea
//       {...props}
//       className={
//         "w-full min-h-[160px] resize-none rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 " +
//         "placeholder:text-white/45 backdrop-blur-md outline-none " +
//         "focus:border-white/30 focus:bg-white/15"
//       }
//     />
//   );
// }

// function Select(props) {
//   return (
//     <select
//       {...props}
//       className={
//         "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 " +
//         "backdrop-blur-md outline-none hover:bg-white/15 focus:border-white/30"
//       }
//     />
//   );
// }

// /**
//  * Frontend-only submit helper (replace later with real backend)
//  * This returns a fake "inserted id" to simulate DB insert.
//  */
// async function submitReport(payload) {
//   // Future backend endpoint (Express/FastAPI/etc.)
//   // return fetch("http://localhost:3000/api/reports", {
//   //   method: "POST",
//   //   headers: { "Content-Type": "application/json" },
//   //   body: JSON.stringify(payload),
//   // }).then((r) => r.json());

//   // Dummy latency + response
//   await new Promise((res) => setTimeout(res, 700));
//   return { ok: true, id: crypto.randomUUID?.() ?? String(Date.now()) };
// }

// export default function SubmitReportModal({ open, onOpenChange, onSubmitted }) {
//   const [heroName, setHeroName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [report, setReport] = useState("");
//   const [priority, setPriority] = useState(PRIORITIES[0]);

//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const canSubmit = useMemo(() => {
//     return report.trim().length >= 5 && heroName.trim().length >= 2 && phoneNumber.trim().length >= 7;
//   }, [report, heroName, phoneNumber]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     if (!canSubmit) {
//       setError("Please fill out Hero Name, Phone Number, and a short report.");
//       return;
//     }

//     setSubmitting(true);

//     // Timestamp included in payload (ISO string is easiest for backend)
//     const payload = {
//       heroName,
//       phoneNumber,
//       report,
//       priority,
//       timestamp: new Date().toISOString(),
//       status: "PENDING", // frontend can optimistically mark as pending
//     };

//     try {
//       const res = await submitReport(payload);

//       if (!res?.ok) throw new Error("Submit failed.");

//       // Let parent update Live Intel table immediately (optimistic UI)
//       onSubmitted?.({ id: res.id, ...payload });

//       // Clear form + close
//       setHeroName("");
//       setPhoneNumber("");
//       setReport("");
//       setPriority(PRIORITIES[0]);
//       onOpenChange(false);
//     } catch (err) {
//       setError(err?.message ?? "Something went wrong submitting the report.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <Dialog.Root open={open} onOpenChange={onOpenChange}>
//       <Dialog.Portal>
//         {/* overlay */}
//         <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

//         {/* modal */}
//         <Dialog.Content
//           className={
//             "fixed left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 " +
//             "rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl " +
//             "shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
//           }
//         >
//           <div className="flex items-center justify-between px-8 pt-7">
//             <Dialog.Title className="text-3xl font-extrabold tracking-tight text-white">
//               Submit Intelligence Report
//             </Dialog.Title>

//             <Dialog.Close asChild>
//               <button
//                 className="rounded-xl border border-white/15 bg-white/10 p-2 text-white/80 hover:bg-white/15"
//                 aria-label="Close"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </Dialog.Close>
//           </div>

//           <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
//             <div className="space-y-6">
//               <GlassField label="Hero Name:">
//                 <Input
//                   value={heroName}
//                   onChange={(e) => setHeroName(e.target.value)}
//                   placeholder="e.g., Spider-Man"
//                 />
//               </GlassField>

//               <GlassField label="Phone Number:">
//                 <Input
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   placeholder="e.g., 555-0137"
//                 />
//               </GlassField>

//               <GlassField label="Report:">
//                 <Textarea
//                   value={report}
//                   onChange={(e) => setReport(e.target.value)}
//                   placeholder="Describe the situation (location, resource issue, urgency)..."
//                 />
//               </GlassField>

//               <GlassField label="Priority:">
//                 <div className="relative">
//                   <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
//                     {PRIORITIES.map((p) => (
//                       <option key={p} value={p} className="text-black">
//                         {p}
//                       </option>
//                     ))}
//                   </Select>
//                 </div>
//               </GlassField>

//               {error && (
//                 <div className="rounded-xl border border-rose-300/30 bg-rose-300/15 px-4 py-3 text-rose-50">
//                   {error}
//                 </div>
//               )}

//               <div className="flex items-center justify-end gap-3 pt-2">
//                 <Dialog.Close asChild>
//                   <button
//                     type="button"
//                     className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-white/85 hover:bg-white/15"
//                     disabled={submitting}
//                   >
//                     Cancel
//                   </button>
//                 </Dialog.Close>

//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="rounded-xl border border-white/20 bg-white/20 px-6 py-3 font-semibold text-white hover:bg-white/25 disabled:opacity-60"
//                 >
//                   {submitting ? "Submitting..." : "Submit Report"}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </Dialog.Content>
//       </Dialog.Portal>
//     </Dialog.Root>
//   );
// }

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

// If your backend expects canonical priority codes, consider mapping.
// For now we keep display values and let the parent/adapter map if needed.
const PRIORITIES = ["Routine", "High", "Avengers-Level Threat"];

function GlassField({ label, children }) {
  return (
    <label className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-3 sm:gap-6">
      <span className="text-white/85 text-lg">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 " +
        "placeholder:text-white/45 backdrop-blur-md outline-none " +
        "focus:border-white/30 focus:bg-white/15"
      }
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={
        "w-full min-h-[160px] resize-none rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 " +
        "placeholder:text-white/45 backdrop-blur-md outline-none " +
        "focus:border-white/30 focus:bg-white/15"
      }
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white/90 " +
        "backdrop-blur-md outline-none hover:bg-white/15 focus:border-white/30"
      }
    />
  );
}

export default function SubmitReportModal({ open, onOpenChange, onSubmitted }) {
  const [heroName, setHeroName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [report, setReport] = useState("");
  const [priority, setPriority] = useState(PRIORITIES[0]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Basic client-side validation
  const canSubmit = useMemo(() => {
    return (
      report.trim().length >= 5 &&
      heroName.trim().length >= 2 &&
      phoneNumber.trim().length >= 7
    );
  }, [report, heroName, phoneNumber]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError("Please fill out Hero Name, Phone Number, and a short report.");
      return;
    }

    setSubmitting(true);

    // Prepare payload expected by parent (App.jsx)
    const payload = {
      heroName: heroName.trim(),
      phoneNumber: phoneNumber.trim(),
      report: report.trim(),
      priority, // if backend needs canonical values, map here before sending up
      timestamp: new Date().toISOString(), // ISO string for backend
    };

    try {
      // Let the parent handle optimistic update + POST + refetch

      await onSubmitted?.({
      heroName: heroName.trim(),
      phoneNumber: phoneNumber.trim(),
      report: report.trim(),
      priority,
      timestamp: new Date().toISOString(),
      });

      // await onSubmitted?.(payload);

      // Clear form + close on success
      setHeroName("");
      setPhoneNumber("");
      setReport("");
      setPriority(PRIORITIES[0]);
      onOpenChange(false);
    } catch (err) {
      // If parent throws (e.g., POST failed), show inline error and keep modal open
      setError(err?.message ?? "Something went wrong submitting the report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        {/* modal */}
        <Dialog.Content
          className={
            "fixed left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 " +
            "rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl " +
            "shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          }
        >
          <div className="flex items-center justify-between px-8 pt-7">
            <Dialog.Title className="text-3xl font-extrabold tracking-tight text-white">
              Submit Intelligence Report
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

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
            <div className="space-y-6">
              <GlassField label="Hero Name:">
                <Input
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  placeholder="e.g., Peter Parker"
                />
              </GlassField>

              <GlassField label="Phone Number:">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., 555-0137"
                />
              </GlassField>

              <GlassField label="Report:">
                <Textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  placeholder="Describe the situation (resource issue, urgency, context)..."
                />
              </GlassField>

              <GlassField label="Priority:">
                <div className="relative">
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="text-black">
                        {p}
                      </option>
                    ))}
                  </Select>
                </div>
              </GlassField>

              {error && (
                <div className="rounded-xl border border-rose-300/30 bg-rose-300/15 px-4 py-3 text-rose-50">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-white/85 hover:bg-white/15"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl border border-white/20 bg-white/20 px-6 py-3 font-semibold text-white hover:bg-white/25 disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
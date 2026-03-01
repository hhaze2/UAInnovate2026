import { useEffect, useMemo, useState } from "react";
import StockChart from "./StockChart";
import { buildChartData } from "../dummyData";
import { fetchLevelsByLocation } from "../api/levels";

export default function StockChartContainer({ location, range }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

    
    fetchLevelsByLocation(location)
        .then((arr) => !cancelled && setRows(arr))  // arr is a plain array
        .catch((e) => !cancelled && setError(e.message || "Failed to fetch levels"))
        .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };

    }, [location]);

    console.log("[ChartContainer] rows type:", typeof rows, rows && rows.constructor && rows.constructor.name, rows);
    const data = useMemo(() => buildChartData(rows, location, range), [rows, location, range]);

    const resources = useMemo(() => {
        if (!data.length) return [];
        const keys = new Set();
        for (const row of data) {
        for (const key of Object.keys(row)) {
            if (key !== "time") keys.add(key);
        }
        }
        return Array.from(keys);
    }, [data]);


    if (loading) return <div>Loading chart…</div>;
    if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
    if (!data.length) return <div>No data</div>;

    return <StockChart data={data} resources={resources} />;
}



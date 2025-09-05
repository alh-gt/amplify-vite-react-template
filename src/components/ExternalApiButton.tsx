import { useState } from "react";

export default function ExternalApiButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const url =
    import.meta.env.VITE_EXTERNAL_API_URL ??
    "https://seerhit2i8.execute-api.us-east-1.amazonaws.com/?key1=hoge&key2=huga&key3=hge";

  const callApi = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      // JSONっぽければ整形、違えばそのまま表示
      try {
        const json = JSON.parse(text);
        setResult(JSON.stringify(json, null, 2));
      } catch {
        setResult(text);
      }
    } catch (e: any) {
      setResult(`ERROR: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={callApi} disabled={loading}>
        {loading ? "呼び出し中..." : "API を呼ぶ"}
      </button>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          margin: 0,
          padding: 12,
          border: "1px solid #ccc",
          borderRadius: 8,
          minHeight: 80,
        }}
      >
        {result || "（ここに結果が表示されます）"}
      </pre>
    </div>
  );
}

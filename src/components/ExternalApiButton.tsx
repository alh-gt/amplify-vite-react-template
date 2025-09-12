import { useState } from "react";

export default function ExternalApiButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // 既定URL（環境変数 → 固定値）
  const defaultUrl =
    import.meta.env.VITE_EXTERNAL_API_URL ??
    "https://u28w6vrktk.execute-api.us-east-1.amazonaws.com/dev/?key1=hoge&key2=huga&key3=hge";

  // 入力欄の状態
  const [url, setUrl] = useState<string>(defaultUrl);
  const [idToken, setIdToken] = useState<string>("");

  const callApi = async () => {
    setLoading(true);
    setResult("");
    try {
      const headers: Record<string, string> = {};
      if (idToken.trim()) {
        headers["Authorization"] = `Bearer ${idToken.trim()}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers,
      });

      const text = await res.text();

      // ステータスもわかるように先頭に付加（任意）
      const headerInfo = `HTTP ${res.status} ${res.statusText}`;

      // JSONっぽければ整形、違えばそのまま表示
      try {
        const json = JSON.parse(text);
        setResult(`${headerInfo}\n` + JSON.stringify(json, null, 2));
      } catch {
        setResult(`${headerInfo}\n` + text);
      }
    } catch (e: any) {
      setResult(`ERROR: ${e?.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={{ display: "grid", gap: 4 }}>
        <span>呼び出しURL</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://xxxx.execute-api.us-east-1.amazonaws.com/.."
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
      </label>

      <label style={{ display: "grid", gap: 4 }}>
        <span>IDトークン（JWT）</span>
        <textarea
          value={idToken}
          onChange={(e) => setIdToken(e.target.value)}
          placeholder="ここに Cognito の IDトークンを貼り付け（空なら Authorization ヘッダーを付与しません）"
          rows={4}
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
        />
      </label>

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

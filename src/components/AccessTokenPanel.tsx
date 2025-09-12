import { fetchAuthSession } from "aws-amplify/auth";
import { useEffect, useState } from "react";

export default function AccessTokenPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (force = false) => {
    setLoading(true);
    try {
      const { tokens } = await fetchAuthSession(
        force ? { forceRefresh: true } : undefined
      );
      const raw = tokens?.accessToken?.toString() ?? null; // ← 生のJWT
      setToken(raw);

      // ついでに exp を表示（任意）
      if (raw) {
        const payload = JSON.parse(
          atob(raw.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        );
        setExpiresAt(
          payload?.exp ? new Date(payload.exp * 1000).toLocaleString() : null
        );
      } else {
        setExpiresAt(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // サインイン直後に取得
  }, []);

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={() => load(true)} disabled={loading}>
        {loading ? '更新中…' : 'トークン更新（forceRefresh）'}
      </button>
      <div style={{ marginTop: 8 }}>
        <div><strong>access token</strong></div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {token ?? '—'}
        </pre>
        {expiresAt && <div>有効期限: {expiresAt}</div>}
      </div>
    </div>
  );
}
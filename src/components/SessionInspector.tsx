import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

type JwtParts = { header: unknown; payload: any }; // payload は任意のclaims構造

function base64UrlDecode(input: string): string {
  // Base64URL -> Base64
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  // atobでデコード（マルチバイト対策は最小限）
  const bin = atob(base64 + pad);
  try {
    // UTF-8化
    const bytes = new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
  } catch {
    return bin;
  }
}

function parseJwt(token: string): JwtParts | null {
  try {
    const [h, p] = token.split('.');
    if (!h || !p) return null;
    const header = JSON.parse(base64UrlDecode(h));
    const payload = JSON.parse(base64UrlDecode(p));
    return { header, payload };
  } catch {
    return null;
  }
}

function prettyJson(obj: unknown) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function CopyButton({ text, label = 'コピー' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        } catch {
          // 失敗時は no-op
        }
      }}
      style={{ marginLeft: 8 }}
    >
      {done ? '✓ コピー済' : label}
    </button>
  );
}

function Countdown({ exp }: { exp: number | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!exp) return;
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [exp]);

  if (!exp) return null;
  const remainMs = exp * 1000 - Date.now();
  const remain = Math.max(0, Math.floor(remainMs / 1000));
  const mm = Math.floor(remain / 60)
    .toString()
    .padStart(2, '0');
  const ss = (remain % 60).toString().padStart(2, '0');
  return <span style={{ marginLeft: 8, fontVariantNumeric: 'tabular-nums' }}>残り {mm}:{ss}</span>;
}

export default function SessionInspector() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [accessClaims, setAccessClaims] = useState<any | null>(null);
  const [idClaims, setIdClaims] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const refreshTimer = useRef<number | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    try {
      const { tokens } = await fetchAuthSession(force ? { forceRefresh: true } : undefined);
      const a = tokens?.accessToken?.toString() ?? null;
      const i = tokens?.idToken?.toString() ?? null;
      setAccessToken(a);
      setIdToken(i);
      setAccessClaims(a ? parseJwt(a)?.payload ?? null : null);
      setIdClaims(i ? parseJwt(i)?.payload ?? null : null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回＆サインイン直後の取得
  useEffect(() => {
    load();
  }, [load]);

  // 期限の少し前に自動更新（例: expの30秒前）
  useEffect(() => {
    if (refreshTimer.current) {
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    const exp = accessClaims?.exp as number | undefined;
    if (!exp) return;
    const msUntilRefresh = exp * 1000 - Date.now() - 30_000;
    if (msUntilRefresh > 0) {
      refreshTimer.current = window.setTimeout(() => load(true), msUntilRefresh);
    }
    return () => {
      if (refreshTimer.current) window.clearTimeout(refreshTimer.current);
    };
  }, [accessClaims?.exp, load]);

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  const curl = useMemo(() => {
    if (!accessToken) return '';
    const url = apiUrl ? apiUrl : 'https://your-api.example.com/dev/hello';
    return `curl -i \\\n  -H "Authorization: Bearer ${accessToken}" \\\n  "${url}"`;
  }, [accessToken, apiUrl]);

  const expDate =
    accessClaims?.exp ? new Date(accessClaims.exp * 1000) : null;

  return (
    <div style={{ display: 'grid', gap: 16, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => load(false)} disabled={loading}>
          {loading ? '取得中…' : '再取得'}
        </button>
        <button onClick={() => load(true)} disabled={loading}>
          {loading ? '更新中…' : 'forceRefresh'}
        </button>
        {expDate && (
          <span style={{ marginLeft: 8 }}>
            有効期限: {expDate.toLocaleString()}
            <Countdown exp={accessClaims?.exp ?? null} />
          </span>
        )}
      </div>

      <section>
        <h4 style={{ margin: '8px 0' }}>Access Token (JWT)</h4>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
          {accessToken ?? '—'}
        </pre>
        {accessToken && <CopyButton text={accessToken} />}
        <details style={{ marginTop: 8 }}>
          <summary>access token claims</summary>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {prettyJson(accessClaims)}
          </pre>
        </details>
      </section>

      <section>
        <h4 style={{ margin: '8px 0' }}>ID Token (JWT)</h4>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
          {idToken ?? '—'}
        </pre>
        {idToken && <CopyButton text={idToken} />}
        <details style={{ marginTop: 8 }}>
          <summary>id token claims</summary>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {prettyJson(idClaims)}
          </pre>
        </details>
      </section>

      <section>
        <h4 style={{ margin: '8px 0' }}>cURL（API Gateway テスト用）</h4>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
          {apiUrl
            ? `VITE_API_URL = ${apiUrl}（.env.local）`
            : 'VITE_API_URL を設定するとここに反映されます（例: https://abc.execute-api.us-east-1.amazonaws.com/prod/hello）'}
        </div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
{curl || 'access token 未取得'}
        </pre>
        {curl && <CopyButton text={curl} label="cURLをコピー" />}
      </section>
    </div>
  );
}

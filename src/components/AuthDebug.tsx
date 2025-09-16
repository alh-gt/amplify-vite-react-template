import { useMemo } from "react";
import { Amplify } from "aws-amplify";
import amplifyConfig from "../amplify-config"; // あなたの手書き設定をexportしている前提


export default function AuthDebug() {
  // 実際に使われている設定（Amplify側に入ったもの）
  const effective = Amplify.getConfig?.() ?? amplifyConfig;

  const info = useMemo(() => {
    const c = effective.Auth?.Cognito;
    const { userPoolId, userPoolClientId, loginWith } = c ?? {
        userPoolId: null, 
        userPoolClientId: null, 
        loginWith: null
    };
    return { userPoolId, userPoolClientId, loginWith };
  }, [effective]);

  return (
    <details style={{ margin: "12px 0" }} open>
      <summary>Auth 設定（実効）</summary>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(info, null, 2)}</pre>
    </details>
  );
}

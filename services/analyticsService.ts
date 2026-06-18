// Azure Application Insights — REST API 직접 호출 (SDK 없음, silent fail)
// Connection String은 Azure Portal > Application Insights > 개요 > 연결 문자열에서 복사
// 형식: InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/;...

const CONNECTION_STRING = process.env.EXPO_PUBLIC_APPINSIGHTS_CONNECTION_STRING ?? "";

// Connection String에서 iKey와 endpoint 파싱
function parseConnectionString(connStr: string): { iKey: string; endpoint: string } | null {
  if (!connStr) return null;
  const parts = Object.fromEntries(
    connStr.split(";").map((p) => {
      const idx = p.indexOf("=");
      return [p.slice(0, idx), p.slice(idx + 1)];
    })
  );
  const iKey = parts["InstrumentationKey"];
  const ingestionEndpoint = parts["IngestionEndpoint"];
  if (!iKey || !ingestionEndpoint) return null;
  return { iKey, endpoint: `${ingestionEndpoint.replace(/\/$/, "")}/v2/track` };
}

const parsed = parseConnectionString(CONNECTION_STRING);

export const logEvent = async (
  name: string,
  properties: Record<string, string | number | boolean> = {}
): Promise<void> => {
  if (!parsed) return; // Connection String 미설정 시 무시
  try {
    await fetch(parsed.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Microsoft.ApplicationInsights.Event",
        time: new Date().toISOString(),
        iKey: parsed.iKey,
        data: {
          baseType: "EventData",
          baseData: { ver: 2, name, properties },
        },
      }),
    });
  } catch {
    // 분석 실패가 앱 동작에 영향 주면 안 됨 → silent fail
  }
};

"use client";

type Props = {
  showTicker: boolean;
  showCsv: boolean;
  tickerClose: () => void;
  csvClose: () => void;
};

export function PanelModals({ showTicker, showCsv, tickerClose, csvClose }: Props) {
  return (
    <>
      {showTicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[520px] rounded-lg border border-[#1E2623] bg-[#131817] p-5">
            <div className="text-sm font-semibold text-[#E8F0ED]">QUEUE STATUS — CRITICAL</div>
            <div className="mt-3 space-y-1 text-sm text-[#5E7269] font-mono">
              <div>847 items pending assignment</div>
              <div>0 items successfully routed (last 3 hours)</div>
              <div>211 items attempted — all failed</div>
              <div className="mt-3 text-[#E24B4A]">Last failure: ROUTE_FAIL_NULL</div>
              <div>routing_matrix.csv last loaded: NEVER</div>
              <div>File not found at agent startup.</div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={tickerClose} className="rounded-md border border-[#1E2623] px-3 py-1.5 text-sm text-[#E8F0ED]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCsv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[680px] rounded-lg border border-[#1E2623] bg-[#131817] p-5">
            <div className="text-sm font-semibold text-[#E8F0ED]">routing_matrix_FINAL_v2.csv</div>
            <pre className="mt-3 max-h-[320px] overflow-y-auto rounded-md border border-[#1E2623] bg-[#0C0F0E] p-3 text-xs text-[#E8F0ED] font-mono">
              team,webhook,zones
              {"\n"}Food Supply,https://reliefnet.internal/hooks/food,ALL
              {"\n"}Medical,https://reliefnet.internal/hooks/medical/urgent,ALL
              {"\n"}Volunteer,https://reliefnet.internal/hooks/volunteer,ALL
              {"\n"}Shelter Zone A,https://reliefnet.internal/hooks/shelter/zone-a,A
              {"\n"}Shelter Zone B,https://reliefnet.internal/hooks/shelter/zone-b,B
              {"\n"}Shelter Zone C,https://reliefnet.internal/hooks/shelter/zone-c,C
              {"\n"}Shelter Zone D,https://reliefnet.internal/hooks/shelter/zone-d,D
              {"\n"}Shelter Zone E,https://reliefnet.internal/hooks/shelter/zone-e,E
              {"\n"}Shelter Zone F,https://reliefnet.internal/hooks/shelter/zone-f,F
              {"\n"}{"\n"}priority_order,Medical|Food|Shelter|Volunteer
              {"\n"}confidence_threshold,0.65
              {"\n"}unclassified_webhook,https://reliefnet.internal/hooks/unclassified
            </pre>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={csvClose} className="rounded-md border border-[#1E2623] px-3 py-1.5 text-sm text-[#E8F0ED]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

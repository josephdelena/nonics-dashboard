"use client";

import { useState, useMemo } from "react";
import type { AdsRow } from "@/lib/ads-sheets";
import { formatRupiah, formatPercent } from "@/lib/utils";

interface CampaignSummary {
  account_name: string;
  campaign_id: string;
  campaign_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  adGroups: AdGroupSummary[];
}

interface AdGroupSummary {
  ad_group_id: string;
  ad_group_name: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

interface AdsTableProps {
  data: AdsRow[];
  totalOrders: number;
}

function pct(n: number, d: number) {
  if (d === 0) return "0.00%";
  return ((n / d) * 100).toFixed(2) + "%";
}

function cpa(cost: number, conv: number) {
  if (conv === 0) return "—";
  return formatRupiah(Math.round(cost / conv));
}

export default function AdsTable({ data, totalOrders }: AdsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const campaigns = useMemo<CampaignSummary[]>(() => {
    const map = new Map<string, CampaignSummary>();
    for (const row of data) {
      const key = row.campaign_id;
      if (!map.has(key)) {
        map.set(key, {
          account_name: row.account_name,
          campaign_id: row.campaign_id,
          campaign_name: row.campaign_name,
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
          adGroups: [],
        });
      }
      const c = map.get(key)!;
      c.impressions += row.impressions;
      c.clicks += row.clicks;
      c.cost += row.cost;
      c.conversions += row.conversions;

      // ad group
      let ag = c.adGroups.find((a) => a.ad_group_id === row.ad_group_id);
      if (!ag) {
        ag = { ad_group_id: row.ad_group_id, ad_group_name: row.ad_group_name, impressions: 0, clicks: 0, cost: 0, conversions: 0 };
        c.adGroups.push(ag);
      }
      ag.impressions += row.impressions;
      ag.clicks += row.clicks;
      ag.cost += row.cost;
      ag.conversions += row.conversions;
    }
    return [...map.values()].sort((a, b) => b.cost - a.cost);
  }, [data]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (campaigns.length === 0) {
    return (
      <div className="glass p-8 text-center text-[#6B6B78] text-sm">
        Belum ada data ads. Pastikan script sudah dijalankan dan ADS_SHEET_ID sudah diisi.
      </div>
    );
  }

  const thClass = "text-left py-2.5 px-3 text-[#6B6B78] font-medium text-[11px] uppercase tracking-wider whitespace-nowrap";
  const tdClass = "py-2.5 px-3 text-sm text-[#E8E6E3] whitespace-nowrap";
  const tdRight = "py-2.5 px-3 text-sm text-right whitespace-nowrap";

  return (
    <div className="glass overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead style={{ background: "var(--bg3)" }}>
          <tr className="border-b border-[rgba(255,255,255,0.08)]">
            <th className={thClass} style={{ width: 32 }}></th>
            <th className={thClass}>Akun</th>
            <th className={thClass}>Campaign</th>
            <th className={`${thClass} text-right`}>Impresi</th>
            <th className={`${thClass} text-right`}>Klik</th>
            <th className={`${thClass} text-right`}>CTR</th>
            <th className={`${thClass} text-right`}>Spend</th>
            <th className={`${thClass} text-right`}>Conv.</th>
            <th className={`${thClass} text-right`}>Conv Rate</th>
            <th className={`${thClass} text-right`}>CPA</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, ci) => {
            const isOpen = expanded.has(c.campaign_id);
            return (
              <>
                <tr
                  key={c.campaign_id}
                  className={`border-b border-[rgba(255,255,255,0.04)] cursor-pointer transition-colors ${
                    ci % 2 === 1 ? "bg-[rgba(255,255,255,0.02)]" : ""
                  } hover:bg-[rgba(245,166,35,0.06)]`}
                  onClick={() => toggle(c.campaign_id)}
                >
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[#6B6B78] text-xs select-none">
                      {isOpen ? "▼" : "▶"}
                    </span>
                  </td>
                  <td className={tdClass + " text-[#9B9BA8] text-xs"}>{c.account_name}</td>
                  <td className={tdClass + " font-medium"}>{c.campaign_name}</td>
                  <td className={tdRight + " text-[#9B9BA8]"}>{c.impressions.toLocaleString("id-ID")}</td>
                  <td className={tdRight}>{c.clicks.toLocaleString("id-ID")}</td>
                  <td className={tdRight + " text-[#F5A623]"}>{pct(c.clicks, c.impressions)}</td>
                  <td className={tdRight + " font-semibold text-[#F5A623]"}>{formatRupiah(Math.round(c.cost))}</td>
                  <td className={tdRight}>{c.conversions.toFixed(1)}</td>
                  <td className={tdRight + " text-[#F5A623]"}>{formatPercent(c.conversions, c.clicks)}</td>
                  <td className={tdRight + " text-[#9B9BA8]"}>{cpa(c.cost, c.conversions)}</td>
                </tr>
                {isOpen &&
                  c.adGroups
                    .sort((a, b) => b.cost - a.cost)
                    .map((ag) => (
                      <tr
                        key={ag.ad_group_id}
                        className="border-b border-[rgba(255,255,255,0.03)] bg-[rgba(245,166,35,0.03)]"
                      >
                        <td></td>
                        <td className="py-2 px-3 pl-6 text-xs text-[#6B6B78]" colSpan={1}>
                          <span className="text-[#F5A623]/40 mr-1">└</span>
                        </td>
                        <td className="py-2 px-3 text-xs text-[#9B9BA8] italic">{ag.ad_group_name}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#6B6B78]">{ag.impressions.toLocaleString("id-ID")}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#6B6B78]">{ag.clicks.toLocaleString("id-ID")}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#6B6B78]">{pct(ag.clicks, ag.impressions)}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#9B9BA8]">{formatRupiah(Math.round(ag.cost))}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#6B6B78]">{ag.conversions.toFixed(1)}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#9B9BA8]">{formatPercent(ag.conversions, ag.clicks)}</td>
                        <td className="py-2 px-3 text-xs text-right text-[#6B6B78]">{cpa(ag.cost, ag.conversions)}</td>
                      </tr>
                    ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

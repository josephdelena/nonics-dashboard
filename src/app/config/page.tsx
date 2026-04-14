"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "defikame@gmail.com";

export default function ConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [testOk, setTestOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated" && session?.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/config").then(r => r.json()).then(cfg => {
      setBaseUrl(cfg.kiriminaja_base_url || "");
      setApiKey(cfg.kiriminaja_api_key || "");
    });
  }, [status]);

  async function handleSave() {
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kiriminaja_base_url: baseUrl, kiriminaja_api_key: apiKey }),
    });
    setSaving(false);
    setSaveMsg(res.ok ? "Tersimpan." : "Gagal simpan.");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleTest() {
    setTesting(true); setTestMsg(""); setTestOk(null);
    const res = await fetch("/api/config/test");
    const data = await res.json();
    setTesting(false);
    setTestOk(data.ok);
    setTestMsg(data.ok ? "Koneksi berhasil." : `Gagal: ${data.error || "Unknown error"}`);
  }

  if (status === "loading" || !session) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-xl font-semibold mb-1" style={{ background: "linear-gradient(to right, #F5A623, #F0C040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Konfigurasi
        </h1>
        <p className="text-[#6B6B78] text-xs mb-8">KiriminAja API Settings</p>

        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] p-6 space-y-5" style={{ background: "var(--bg2)" }}>
          <div>
            <label className="block text-xs text-[#6B6B78] mb-1.5">KiriminAja API URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder="https://tdev.kiriminaja.com"
              className="w-full px-3 py-2 rounded-lg text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#E8E6E3] focus:outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#6B6B78] mb-1.5">KiriminAja API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Bearer token..."
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] text-[#E8E6E3] focus:outline-none focus:border-[#F5A623] transition-colors"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B78] hover:text-[#F5A623] transition-colors text-xs"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(to right, #F5A623, #F0C040)", color: "#0A0A0F" }}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[rgba(255,255,255,0.1)] text-[#6B6B78] hover:border-[#F5A623]/40 hover:text-[#F5A623] transition-all disabled:opacity-50"
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {saveMsg && (
            <p className="text-xs text-[#22C55E]">{saveMsg}</p>
          )}
          {testMsg && (
            <p className={`text-xs ${testOk ? "text-[#22C55E]" : "text-red-400"}`}>{testMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { FaPlus, FaCopy, FaCheck, FaKey } from "react-icons/fa";
import { HiOutlineCodeBracket } from "react-icons/hi2";

interface DevApp {
  id: string;
  appName: string;
  apiKey: string;
  webhookUrl: string | null;
}

export default function DeveloperPage() {
  const [apps, setApps] = useState<DevApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ appName: "", webhookUrl: "" });
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setApps(data.developerApps);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/dev/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setApps((prev) => [...prev, data.app]);
      setForm({ appName: "", webhookUrl: "" });
      setShowForm(false);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Developer</h1>
          <p className="text-gray-400 text-sm">Manage API keys and webhooks</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-green text-black font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <FaPlus /> Register App
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-strong rounded-2xl p-6 space-y-4 mb-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">App Name</label>
            <input
              type="text"
              value={form.appName}
              onChange={(e) => setForm((f) => ({ ...f, appName: e.target.value }))}
              placeholder="My BCH App"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Webhook URL (optional)</label>
            <input
              type="url"
              value={form.webhookUrl}
              onChange={(e) => setForm((f) => ({ ...f, webhookUrl: e.target.value }))}
              placeholder="https://yourapp.com/webhook"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 rounded-xl gradient-green text-black font-semibold text-sm disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create API Key"}
          </button>
        </form>
      )}

      {apps.length === 0 && !showForm ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCodeBracket className="text-green-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No apps registered</h3>
          <p className="text-gray-400 mb-6 text-sm">Register an app to get an API key for CashDrop Connect</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-green text-black font-semibold text-sm"
          >
            <FaPlus /> Register Your First App
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <FaKey className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{app.appName}</h3>
                    {app.webhookUrl && (
                      <p className="text-xs text-gray-500">{app.webhookUrl}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-white/5 rounded-xl px-4 py-2.5 font-mono text-green-400 truncate">
                  {app.apiKey}
                </code>
                <button
                  onClick={() => copyKey(app.apiKey)}
                  className="px-3 py-2.5 rounded-xl glass hover:bg-white/10 transition-colors"
                >
                  {copied === app.apiKey ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <FaCopy className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* API Docs */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">API Reference</h2>
        <div className="glass rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-green-400 mb-2">POST /api/dev/create-link</h3>
            <p className="text-sm text-gray-400 mb-2">Create a payment link programmatically</p>
            <pre className="text-xs bg-white/5 rounded-xl p-4 text-gray-300 overflow-x-auto">
{`// Headers
x-api-key: your_api_key

// Body
{
  "linkName": "order-123",
  "title": "Order #123",
  "amountBCH": 0.05
}

// Response
{
  "paymentLink": "/username/order-123-1234567890",
  "bchAddress": "bitcoincash:qr...",
  "linkId": "clx..."
}`}
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-400 mb-2">GET /api/dev/status?linkId=X</h3>
            <p className="text-sm text-gray-400 mb-2">Check payment status for a link</p>
            <pre className="text-xs bg-white/5 rounded-xl p-4 text-gray-300 overflow-x-auto">
{`// Headers
x-api-key: your_api_key

// Response
{
  "status": "paid",
  "liveCheck": {
    "paid": true,
    "amount": 0.05,
    "txHash": "abc123...",
    "confirmations": 3
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Channel, SyncReport } from "@/lib/types";
import { CompassIcon, LeafIcon, MoonIcon, SparkleIcon } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

const CHANNEL_ICON: Record<string, typeof LeafIcon> = {
  SQUARE_POS: CompassIcon,
  STRIPE_PAYMENTS: SparkleIcon,
  GOOGLE_CALENDAR: MoonIcon,
  AYURPASS_STORE: LeafIcon,
};

const STATUS_STYLE: Record<string, string> = {
  connected: "bg-forest text-white",
  active: "bg-forest text-white",
  disconnected: "border border-hairline text-ink-secondary",
};

export default function ChannelsPage() {
  const { user } = useAuth();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncReport | null>(null);

  const reload = useCallback(() => {
    if (!provider) return;
    api
      .channels(provider.id)
      .then(setChannels)
      .catch(() => setChannels([]));
  }, [provider]);

  useEffect(reload, [reload]);

  if (!provider) {
    return <EmptyState title="No practice linked" body="Channels are managed by provider accounts." />;
  }

  async function connect(c: Channel) {
    if (!provider) return;
    setActing(c.type);
    try {
      await api.connectChannel(provider.id, c.type);
      reload();
    } finally {
      setActing(null);
    }
  }

  async function disconnect(c: Channel) {
    if (!c.integrationId) return;
    setActing(c.type);
    try {
      await api.disconnectChannel(c.integrationId);
      reload();
    } finally {
      setActing(null);
    }
  }

  async function runSync(c: Channel) {
    if (!c.integrationId) return;
    setActing(c.type);
    setSync(null);
    try {
      setSync(await api.syncChannel(c.integrationId));
      reload();
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Online channels</h1>
      <p className="mt-1 text-ink-muted">
        Connect AyurPass to your POS and calendar so your catalog, inventory and appointments stay
        in sync everywhere you sell.
      </p>

      {channels?.[0]?.mock && (
        <p className="mt-4 rounded-xl border border-gold-soft bg-clay/50 px-4 py-3 text-sm text-ink-secondary">
          Connections run in <strong>demo mode</strong> — no external account is contacted. Add live
          API keys to activate real sync.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {channels === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/70" />
          ))
        ) : (
          channels.map((c) => {
            const Icon = CHANNEL_ICON[c.type] ?? LeafIcon;
            const connected = c.status === "connected" || c.status === "active";
            return (
              <div key={c.type} className="rounded-2xl border border-hairline bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay text-forest">
                      <Icon className="h-5.5 w-5.5" />
                    </span>
                    <div>
                      <p className="flex items-center gap-2 font-medium text-foreground">
                        {c.name}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[c.status] ?? STATUS_STYLE.disconnected}`}
                        >
                          {c.status}
                        </span>
                      </p>
                      <p className="mt-1 max-w-lg text-sm text-ink-secondary">{c.description}</p>
                      {c.externalAccountId && (
                        <p className="mt-1.5 text-xs text-ink-muted">
                          Account {c.externalAccountId}
                          {c.lastSyncAt &&
                            ` · last synced ${new Date(c.lastSyncAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!c.connectable ? (
                      <span className="rounded-full bg-clay px-3.5 py-1.5 text-xs font-medium text-forest">
                        Always on
                      </span>
                    ) : connected ? (
                      <>
                        <Button
                          disabled={acting === c.type}
                          onClick={() => runSync(c)}
                          className="!px-3.5 !py-1.5"
                        >
                          {acting === c.type ? "Syncing…" : "Sync now"}
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={acting === c.type}
                          onClick={() => disconnect(c)}
                          className="!px-3.5 !py-1.5"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        disabled={acting === c.type}
                        onClick={() => connect(c)}
                        className="!px-3.5 !py-1.5"
                      >
                        {acting === c.type ? "Connecting…" : "Connect"}
                      </Button>
                    )}
                  </div>
                </div>

                {sync && sync.type === c.type && (
                  <div className="mt-4 rounded-xl bg-clay/50 px-4 py-3 text-sm text-ink-secondary">
                    Synced {sync.report.catalogItemsPushed} catalog items,{" "}
                    {sync.report.inventoryCountsPulled} inventory counts and{" "}
                    {sync.report.appointmentsMirrored} appointments.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

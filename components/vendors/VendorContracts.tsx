"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { Plus, AlertTriangle, Upload, Download, Calendar, DollarSign, List } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { UpgradePlanDialog, type PaidPlan } from "@/components/vendors/upgrade";
import { createVendor, updateVendor, deleteVendor, importVendorsCSV, type VendorFormData } from "@/actions/vendor";
import type { BillingState } from "@/lib/billing/entitlements";
import { NOTICE_PERIOD_OPTIONS } from "@/lib/vendor-alerts";

interface Vendor {
  id: string;
  name: string;
  endDate: Date;
  noticePeriod: number;
  monthlyCost: number;
}

interface Props {
  vendors: Vendor[];
  billing: BillingState;
}

type Status = "safe" | "warning" | "critical";
type View = "list" | "calendar" | "spend";

function getStatus(endDate: Date): Status {
  const days = differenceInDays(endDate, new Date());
  if (days < 30) return "critical";
  if (days <= 90) return "warning";
  return "safe";
}

function getMonthlyCost(v: Vendor): number {
  return v.monthlyCost;
}

const STATUS_LABEL: Record<Status, string> = {
  safe: "Safe",
  warning: "Warning",
  critical: "Critical",
};

const NOTICE_OPTIONS = [...NOTICE_PERIOD_OPTIONS];

function VendorForm({
  initial,
  onSave,
  onCancel,
  isPending = false,
}: {
  initial?: Vendor;
  onSave: (data: VendorFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [endDate, setEndDate] = useState(
    initial ? format(initial.endDate, "yyyy-MM-dd") : "",
  );
  const [noticePeriod, setNoticePeriod] = useState(initial?.noticePeriod ?? 30);
  const [monthlyCost, setMonthlyCost] = useState(
    initial ? getMonthlyCost(initial).toString() : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name,
      endDate,
      noticePeriod,
      monthlyCost: parseFloat(monthlyCost) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="vendor-name">Vendor name</Label>
        <Input
          id="vendor-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Salesforce"
          required
          disabled={isPending}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="end-date">Contract end date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notice-period">Notice period</Label>
          <Select
            id="notice-period"
            value={noticePeriod.toString()}
            onChange={(e) => setNoticePeriod(Number(e.target.value))}
            disabled={isPending}
          >
            {NOTICE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="monthly-cost">Monthly cost (USD)</Label>
        <Input
          id="monthly-cost"
          type="number"
          min={0}
          step="0.01"
          value={monthlyCost}
          onChange={(e) => setMonthlyCost(e.target.value)}
          placeholder="0"
          required
          disabled={isPending}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? (
            <><Spinner size={14} /> {initial ? "Updating..." : "Saving..."}</>
          ) : (
            initial ? "Update vendor" : "Save vendor"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Calendar view ─────────────────────────────────────────────────────────────
function CalendarView({ vendors }: { vendors: Vendor[] }) {
  const today = new Date();
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: format(d, "MMM yyyy") });
  }

  return (
    <div className="space-y-2">
      {months.map(({ year, month, label }) => {
        const renewals = vendors.filter((v) => {
          const d = new Date(v.endDate);
          return d.getFullYear() === year && d.getMonth() === month;
        });
        return (
          <div key={label} className="flex items-start gap-4 py-2 border-b border-[var(--border)]">
            <div className="w-24 text-sm text-[var(--text-muted)] shrink-0 pt-0.5">{label}</div>
            <div className="flex flex-wrap gap-2">
              {renewals.length === 0 ? (
                <span className="text-xs text-[var(--text-soft)]">-</span>
              ) : (
                renewals.map((v) => {
                  const status = getStatus(v.endDate);
                  return (
                    <span
                      key={v.id}
                      className={`text-xs px-2 py-1 rounded-full ${
                        status === "critical"
                          ? "bg-[var(--critical-bg)] text-[var(--critical-text)]"
                          : status === "warning"
                          ? "bg-[var(--warning-bg)] text-[var(--warning-text)]"
                          : "bg-[var(--success-bg)] text-[var(--success-text)]"
                      }`}
                    >
                      {v.name} · {format(v.endDate, "MMM d")}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Spend dashboard ────────────────────────────────────────────────────────────
function SpendView({ vendors }: { vendors: Vendor[] }) {
  const sorted = [...vendors].sort(
    (a, b) => getMonthlyCost(b) - getMonthlyCost(a),
  );
  const total = vendors.reduce((sum, v) => sum + getMonthlyCost(v), 0);
  const maxCost = sorted[0] ? getMonthlyCost(sorted[0]) : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--surface-1)] rounded-lg p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Total monthly</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
            ${(total / 1000).toFixed(total >= 1000 ? 1 : 0)}{total >= 1000 ? "K" : ""}
          </p>
        </div>
        <div className="bg-[var(--surface-1)] rounded-lg p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Annual spend</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
            ${((total * 12) / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-[var(--surface-1)] rounded-lg p-4 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Vendors tracked</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{vendors.length}</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-[var(--text-muted)] mb-3">Top vendors by cost</p>
        <div className="space-y-3">
          {sorted.map((v) => {
            const cost = getMonthlyCost(v);
            const pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
            return (
              <div key={v.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">{v.name}</span>
                  <span className="text-[var(--text-muted)]">${cost.toLocaleString()}/mo</span>
                </div>
                <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--brand)] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CSV Import ─────────────────────────────────────────────────────────────────
function parseCsv(text: string): VendorFormData[] {
  const lines = text.trim().split("\n");
  const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
  const colIndex = (names: string[]) =>
    names.map((n) => header.indexOf(n)).find((i) => i >= 0) ?? -1;

  const nameIdx = colIndex(["name", "vendor", "vendor name"]);
  const dateIdx = colIndex(["end date", "enddate", "end_date", "renewal date", "renewaldate"]);
  const noticeIdx = colIndex(["notice period", "notice", "noticeperiod"]);
  const costIdx = colIndex(["monthly cost", "cost", "monthlycost", "price"]);

  return lines.slice(1).flatMap((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
    const name = nameIdx >= 0 ? cols[nameIdx] : "";
    const endDate = dateIdx >= 0 ? cols[dateIdx] : "";
    if (!name || !endDate) return [];
    return [
      {
        name,
        endDate: new Date(endDate).toISOString().split("T")[0],
        noticePeriod: noticeIdx >= 0 ? Number(cols[noticeIdx]) || 30 : 30,
        monthlyCost: costIdx >= 0 ? parseFloat(cols[costIdx].replace(/[$,]/g, "")) || 0 : 0,
      },
    ];
  });
}

// ─── Main component ──────────────────────────────────────────────────────────────
export default function VendorContracts({ vendors: initialVendors, billing }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCsvPending, startCsvTransition] = useTransition();
  const [view, setView] = useState<View>("list");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PaidPlan | null>(null);
  const [selectedCriticalVendor, setSelectedCriticalVendor] = useState<Vendor | null>(null);

  const vendors = initialVendors;

  const today = new Date();
  const totalMonthly = vendors.reduce((s, v) => s + getMonthlyCost(v), 0);
  const canAddVendor = billing.vendorLimit === null || vendors.length < billing.vendorLimit;
  const canExportCsv = billing.csvExport;
  const renewingIn30 = vendors.filter(
    (v) => differenceInDays(v.endDate, today) <= 30 && differenceInDays(v.endDate, today) >= 0,
  ).length;
  const criticalVendors = vendors.filter((v) => getStatus(v.endDate) === "critical");

  function refresh() {
    router.refresh();
  }

  async function startCheckout(plan: PaidPlan) {
    setCheckoutPlan(plan);
    setActionError(null);

    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const payload = await res.json().catch(() => null) as { url?: string; error?: string } | null;
      if (!res.ok || !payload?.url) {
        throw new Error(payload?.error || "Unable to start checkout session");
      }

      window.location.href = payload.url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to start checkout session");
      setCheckoutPlan(null);
    }
  }

  function handleOpenAddDialog() {
    setActionError(null);

    if (!canAddVendor) {
      setUpgradeOpen(true);
      return;
    }

    setAddOpen(true);
  }

  async function handleCreate(data: VendorFormData) {
    startTransition(async () => {
      try {
        setActionError(null);
        await createVendor(data);
        setAddOpen(false);
        refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create vendor";
        setActionError(message);
        if (message.toLowerCase().includes("plan limit")) {
          setAddOpen(false);
          setUpgradeOpen(true);
        }
      }
    });
  }

  async function handleUpdate(data: VendorFormData) {
    if (!editVendor) return;
    startTransition(async () => {
      try {
        setActionError(null);
        await updateVendor(editVendor.id, data);
        setEditVendor(null);
        refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update vendor");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      try {
        setActionError(null);
        await deleteVendor(id);
        setDeleteId(null);
        refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to delete vendor");
      }
    });
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCsv(ev.target?.result as string);
      if (rows.length === 0) return alert("No valid rows found in CSV");
      startCsvTransition(async () => {
        try {
          setActionError(null);
          await importVendorsCSV(rows);
          refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to import CSV";
          setActionError(message);
          if (message.toLowerCase().includes("plan limit")) {
            setUpgradeOpen(true);
          }
        }
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="p-6 h-full min-h-0 overflow-hidden text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">Vendor contracts</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Plan: {billing.plan}
            {billing.vendorLimit === null ? " - unlimited vendors" : ` - ${vendors.length}/${billing.vendorLimit} vendors used`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExportCsv ? (
            <a
              href="/api/vendors/export"
              className="inline-flex items-center gap-1.5 h-9 rounded-md px-3 text-sm border border-[var(--border)] bg-transparent hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Download size={14} />
              Export CSV
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 rounded-md px-3 text-sm border border-[var(--border)] bg-transparent hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export CSV (Upgrade)
            </button>
          )}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvUpload}
              disabled={isCsvPending || isPending}
            />
            <span className={`inline-flex items-center gap-1.5 h-9 rounded-md px-3 text-sm border border-[var(--border)] bg-transparent hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer ${isCsvPending ? "opacity-50 pointer-events-none" : ""}`}>
              {isCsvPending ? <Spinner size={14} /> : <Upload size={14} />}
              {isCsvPending ? "Importing..." : "Import CSV"}
            </span>
          </label>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <Button size="sm" type="button" onClick={handleOpenAddDialog}>
              <Plus size={14} />
              Add vendor
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add vendor</DialogTitle>
                <DialogDescription>
                  Enter the contract details for a new vendor.
                </DialogDescription>
              </DialogHeader>
              <VendorForm
                onSave={handleCreate}
                onCancel={() => setAddOpen(false)}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-[var(--critical-border)] bg-[var(--critical-bg)] px-4 py-3 text-sm text-[var(--critical-text)]">
          {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[var(--surface-1)] rounded-lg px-4 py-3 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Total vendors</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">{vendors.length}</p>
        </div>
        <div className="bg-[var(--surface-1)] rounded-lg px-4 py-3 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Renewing in 30d</p>
          <p className={`text-2xl font-semibold mt-1 ${renewingIn30 > 0 ? "text-[var(--critical-text)]" : "text-[var(--text-primary)]"}`}>
            {renewingIn30}
          </p>
        </div>
        <div className="bg-[var(--surface-1)] rounded-lg px-4 py-3 border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">Monthly spend</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] mt-1">
            ${totalMonthly >= 1000
              ? `${(totalMonthly / 1000).toFixed(1)}K`
              : totalMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 mb-5 bg-[var(--surface-2)] rounded-lg p-1 w-fit">
        {(["list", "calendar", "spend"] as View[]).map((v) => {
          const Icon = v === "list" ? List : v === "calendar" ? Calendar : DollarSign;
          const label = v === "list" ? "Contracts" : v === "calendar" ? "Calendar" : "Spending";
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                view === v
                  ? "bg-[var(--surface-3)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0">
      {view === "list" && (
        <div className="min-h-0 h-full flex flex-col">
          {/* Critical alerts */}
          {criticalVendors.length > 0 && (
            <div className="mb-4 rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--text-primary)]">Critical renewals</p>
                <Badge variant="warning">{criticalVendors.length}</Badge>
              </div>
              <div className="max-h-44 overflow-y-auto pr-1 space-y-2">
                {criticalVendors.map((v) => {
                  const days = differenceInDays(v.endDate, today);

                  return (
                    <button
                      key={v.id}
                      type="button"
                        onClick={() => setSelectedCriticalVendor(v)}
                      className="w-full rounded-md border border-[var(--warning-border)] bg-[var(--surface-1)] px-3 py-2 text-left cursor-pointer "
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertTriangle size={14} className="text-[var(--warning-text)] shrink-0" />
                          <p className="truncate text-sm text-[var(--text-primary)]">
                            {v.name}
                          </p>
                        </div>
                        <p className="text-xs font-medium text-[var(--warning-text)] shrink-0">
                          {days}d
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Click to view details</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          {vendors.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)] flex-1">
              <p className="text-sm">No vendors yet. Add your first vendor or import a CSV.</p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--surface-1)] z-10">
                  <tr className="text-[var(--text-muted)] border-b border-[var(--border)]">
                    <th className="text-left px-3 py-2 font-normal">Vendor</th>
                    <th className="text-left px-3 py-2 font-normal">Renewal</th>
                    <th className="text-left px-3 py-2 font-normal">Cost/mo</th>
                    <th className="text-left px-3 py-2 font-normal">Status</th>
                    <th className="text-right px-3 py-2 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => {
                    const status = getStatus(v.endDate);
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors"
                      >
                        <td className="px-3 py-3 font-medium text-[var(--text-primary)]">{v.name}</td>
                        <td className="px-3 py-3 text-[var(--text-secondary)]">{format(v.endDate, "MMM d")}</td>
                        <td className="px-3 py-3 text-[var(--text-secondary)]">
                          ${getMonthlyCost(v).toLocaleString()}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={status}>{STATUS_LABEL[status]}</Badge>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditVendor(v)}
                              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(v.id)}
                              className="text-xs text-[var(--destructive)] hover:opacity-80 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "calendar" && (
        <div className="h-full overflow-y-auto pr-1">
          <CalendarView vendors={vendors} />
        </div>
      )}
      {view === "spend" && (
        <div className="h-full overflow-y-auto pr-1">
          <SpendView vendors={vendors} />
        </div>
      )}
      </div>

      <UpgradePlanDialog
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason={
          canAddVendor
            ? "This feature is available on Growth and Scale plans."
            : "Free Tier supports only 2 vendors. Upgrade to add more vendors."
        }
        loadingPlan={checkoutPlan}
        onChoosePlan={startCheckout}
      />

      <Dialog open={!!selectedCriticalVendor} onOpenChange={(open) => !open && setSelectedCriticalVendor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Critical renewal</DialogTitle>
            <DialogDescription>
              {selectedCriticalVendor?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCriticalVendor && (() => {
            const days = differenceInDays(selectedCriticalVendor.endDate, today);
            const noticeDeadline = new Date(selectedCriticalVendor.endDate);
            noticeDeadline.setDate(noticeDeadline.getDate() - selectedCriticalVendor.noticePeriod);
            const pastNotice = today >= noticeDeadline;

            return (
              <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="rounded-lg border border-[var(--warning-border)] bg-[var(--warning-bg)] px-4 py-3">
                  <p className="font-medium text-[var(--text-primary)]">
                    Renews in {days} day{days !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-xs text-[var(--warning-text)]">
                    {pastNotice ? "Notice window already started." : "Notice window is approaching."}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>Renewal date: {format(selectedCriticalVendor.endDate, "MMM d, yyyy")}</p>
                  <p>Notice period: {selectedCriticalVendor.noticePeriod} days</p>
                  <p>
                    Notice deadline: {format(noticeDeadline, "MMM d, yyyy")}
                    {pastNotice ? " (action needed now)" : ""}
                  </p>
                  <p>Monthly cost: ${getMonthlyCost(selectedCriticalVendor).toLocaleString()}</p>
                </div>
                <div className="flex justify-end pt-1">
                  <Button type="button" variant="outline" onClick={() => setSelectedCriticalVendor(null)}>
                    Close
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editVendor} onOpenChange={(o) => !o && setEditVendor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit vendor</DialogTitle>
            <DialogDescription>
              Update the selected vendor&apos;s contract details.
            </DialogDescription>
          </DialogHeader>
          {editVendor && (
            <VendorForm
              initial={editVendor}
              onSave={handleUpdate}
              onCancel={() => setEditVendor(null)}
                isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete vendor?</DialogTitle>
            <DialogDescription>
              This will permanently remove the vendor and its alert history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={isPending}
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {isPending ? (
                <><Spinner size={14} /> Deleting...</>
              ) : (
                "Delete"
              )}
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

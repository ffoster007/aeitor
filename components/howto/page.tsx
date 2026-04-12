import {
	BellRing,
	CalendarRange,
	CheckCircle2,
	FileSpreadsheet,
	LayoutDashboard,
	ShieldCheck,
	Users,
} from "lucide-react";

const setupSteps = [
	{
		title: "Add your vendors",
		description:
			"Start in Workspace and create each vendor with contract end date, notice period, and monthly cost.",
		detail: "If your team already has a spreadsheet, import the list by CSV",
		icon: FileSpreadsheet,
	},
	{
		title: "Review the renewal timeline",
		description:
			"Use the list, calendar, and spend views to see what expires first and how much budget is exposed.",
		detail: "High-risk contracts are the ones approaching renewal inside the alert window.",
		icon: CalendarRange,
	},
	{
		title: "Act before the deadline",
		description:
			"Check contracts inside the 90, 60, or 30 day window, then update terms or plan negotiations with the owner.",
		detail: "The goal is to make renewals visible early enough that they stop becoming last-minute work.",
		icon: BellRing,
	},
];

const workspaceSections = [
	{
		name: "Home",
		description:
			"This page gives the operating model for the workspace: what to set up first, where to look daily, and how to keep the renewal queue healthy.",
		icon: LayoutDashboard,
	},
	{
		name: "Workspace",
		description:
			"This is the live contract area. Add vendors, switch views, import CSV data, and maintain the contract list used by the team.",
		icon: Users,
	},
];

const checklist = [
	"Track the contract end date for every paid vendor.",
	"Set a notice period that matches the negotiation or cancellation window.",
	"Record monthly cost so the spend view reflects budget impact.",
	"Review critical renewals every week and assign a clear owner.",
	"Import old spreadsheet data instead of rebuilding the list manually.",
];

const guardrails = [
	"Do not wait until 30 days to review expensive contracts.",
	"Keep dates and notice periods accurate after every amendment.",
	"Use the spend view to spot high-cost renewals before budget reviews.",
];

export default function HowToPage() {
	return (
		<div className="h-full overflow-y-auto bg-[var(--surface-0)] text-[var(--text-primary)]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 lg:px-6">
				<section className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)]">
					<div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_320px]">
						<div className="border-b border-[var(--border)] px-6 py-6 lg:border-b-0 lg:border-r">
							<p className="text-[11px] uppercase tracking-[0.24em] text-[var(--text-soft)]">How to use Aeitor</p>
							<h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
								Keep every renewal visible before it becomes urgent.
							</h1>
							<p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)] md:text-[15px]">
								Aeitor is built to replace scattered spreadsheets with one contract workspace. The
								routine is simple: load vendors, watch the renewal windows, and act early on the
								contracts that matter most.
							</p>

							<div className="mt-6 grid gap-3 md:grid-cols-3">
								<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Primary job</p>
									<p className="mt-2 text-lg font-medium text-[var(--text-primary)]">Renewal visibility</p>
									<p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
										Surface dates, owners, and spend before the deadline gets close.
									</p>
								</div>
								<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Best cadence</p>
									<p className="mt-2 text-lg font-medium text-[var(--text-primary)]">Weekly review</p>
									<p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
										Check new critical contracts and confirm who owns the next action.
									</p>
								</div>
								<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Alert windows</p>
									<p className="mt-2 text-lg font-medium text-[var(--text-primary)]">90 / 60 / 30 days</p>
									<p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
										Use these windows to negotiate, approve, or cancel on time.
									</p>
								</div>
							</div>
						</div>

						<aside className="px-6 py-6">
							<div className="rounded-2xl border border-[var(--success-border)] bg-[var(--success-bg)] p-5">
								<div className="flex items-start gap-3">
									<ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--success-text)]" />
									<div>
										<p className="text-sm font-medium text-[var(--text-primary)]">What good usage looks like</p>
										<p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
											Every contract has a date, a notice period, a cost, and someone who is already
											aware of the next decision before the final month starts.
										</p>
									</div>
								</div>
							</div>

							<div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
								<p className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Daily quick check</p>
								<ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
									{guardrails.map((item) => (
										<li key={item} className="flex items-start gap-3 leading-6">
											<span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</aside>
					</div>
				</section>

				<section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.95fr)]">
					<div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)]">Getting started</p>
							</div>
						</div>

						<div className="mt-6 space-y-4">
							{setupSteps.map((step, index) => {
								const Icon = step.icon;
								return (
									<article
										key={step.title}
										className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 md:grid-cols-[56px_minmax(0,1fr)]"
									>
										<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)]">
											<Icon className="h-6 w-6" />
										</div>
										<div>
											<p className="text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">Step {index + 1}</p>
											<h3 className="mt-1 text-lg font-medium text-[var(--text-primary)]">{step.title}</h3>
											<p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p>
											<p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{step.detail}</p>
										</div>
									</article>
								);
							})}
						</div>
					</div>

					<div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-1)] p-6">
						<p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)]">Checklist</p>
						<h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">What to enter first</h2>
						<div className="mt-6 space-y-3">
							{checklist.map((item) => (
								<div key={item} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
									<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success-text)]" />
									<p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

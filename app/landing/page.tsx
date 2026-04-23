"use client";

import { useRouter } from "next/navigation";

const PRICING_PLANS = [
	{
		name: "Free Tier",
		price: "$0",
		cadence: "/month",
		description: "For individuals and small teams that are just getting started",
		highlight: "Best for evaluation",
		features: [
			"Track up to 2 contracts",
			"Basic overview",
		],
		cta: "Start free",
		emphasized: false,
	},
	{
		name: "Growth",
		price: "$6",
		cadence: "/user /month",
		description: "For growing teams that need to track more contracts and vendors",
		highlight: "FOR TEAMS",
		features: [
			"Track up to 50 contracts",
			"CSV exports for reviews",
		],
		cta: "Get started",
		emphasized: true,
	},
	{
		name: "Scale",
		price: "$10",
		cadence: "/user /month",
		description: "For organizations and businesses that need to track unlimited contracts, and get early access to new features.",
		highlight: "FOR BUSINESSES",
		features: [
			"Everything in Growth",
			"Unlimited contracts and vendors",
			"Exclusive early updates",
		],
		cta: "Get started",
		emphasized: false,
	},
];

export default function PricingSection() {
	const router = useRouter();

	return (
		<section id="pricing" className="max-w-5xl mx-auto px-8 pb-28">
			<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
				<div className="max-w-xl">
					<p
						className="text-xs uppercase tracking-widest mb-3"
						style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif" }}
					>
						Pricing
					</p>
					<h2
						className="text-4xl md:text-5xl leading-tight mb-4"
						style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
					>
						Choose the rollout
						<br />
						that fits your team.
					</h2>
					<p
						className="text-sm leading-relaxed max-w-md"
						style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}
					>
						Start free, upgrade when renewal workflows get shared across finance, procurement, and operations.
					</p>
				</div>

				<div
					className="rounded-full border border-neutral-300 px-4 py-2 self-start md:self-auto"
					style={{ backgroundColor: "rgba(255,255,255,0.55)", fontFamily: "'Helvetica Neue', sans-serif" }}
				>
					<p className="text-xs uppercase tracking-widest" style={{ color: "#777" }}>
						Monthly billing • No annual lock-in
					</p>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				{PRICING_PLANS.map((plan) => (
					<article
						key={plan.name}
						className="rounded-[28px] border p-6 md:p-7 flex flex-col"
						style={
							plan.emphasized
								? {
										backgroundColor: "#1a1a1a",
										borderColor: "#1a1a1a",
										color: "#f0ede6",
										boxShadow: "0 18px 40px rgba(26, 26, 26, 0.16)",
									}
								: {
										backgroundColor: "rgba(255,255,255,0.72)",
										borderColor: "#ddd6c9",
										color: "#111",
									}
						}
					>
						<div className="flex items-start justify-between gap-3 mb-6">
							<div>
								<p
									className="text-xs uppercase tracking-widest mb-3"
									style={{
										color: plan.emphasized ? "rgba(240, 237, 230, 0.68)" : "#8a857d",
										fontFamily: "'Helvetica Neue', sans-serif",
									}}
								>
									{plan.highlight}
								</p>
								<h3
									className="text-3xl"
									style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
								>
									{plan.name}
								</h3>
							</div>

							<span
								className="rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
								style={{
									borderColor: plan.emphasized ? "rgba(240, 237, 230, 0.22)" : "#d6d0c6",
									color: plan.emphasized ? "#f0ede6" : "#555",
									fontFamily: "'Helvetica Neue', sans-serif",
								}}
							>
								{plan.price === "$0" ? "Starter" : "Team plan"}
							</span>
						</div>

						<div className="mb-5">
							<div className="flex items-end gap-2">
								<p
									className="text-5xl leading-none"
									style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
								>
									{plan.price}
								</p>
								<p
									className="text-sm pb-1"
									style={{
										color: plan.emphasized ? "rgba(240, 237, 230, 0.72)" : "#777",
										fontFamily: "'Helvetica Neue', sans-serif",
									}}
								>
									{plan.cadence}
								</p>
							</div>
							<p
								className="text-sm leading-relaxed mt-4"
								style={{
									color: plan.emphasized ? "rgba(240, 237, 230, 0.8)" : "#666",
									fontFamily: "'Helvetica Neue', sans-serif",
								}}
							>
								{plan.description}
							</p>
						</div>

						<div className="space-y-3 mb-7 flex-1">
							{plan.features.map((feature) => (
								<div key={feature} className="flex items-start gap-3">
									<span
										className="mt-1.5 h-2 w-2 rounded-full shrink-0"
										style={{ backgroundColor: plan.emphasized ? "#f0ede6" : "#1a1a1a" }}
									/>
									<p
										className="text-sm leading-relaxed"
										style={{
											color: plan.emphasized ? "rgba(240, 237, 230, 0.88)" : "#444",
											fontFamily: "'Helvetica Neue', sans-serif",
										}}
									>
										{feature}
									</p>
								</div>
							))}
						</div>

						<button
							onClick={() => router.push("/auth/signup")}
							className="w-full rounded-full px-4 py-3 text-sm transition-opacity hover:opacity-85 cursor-pointer"
							style={{
								backgroundColor: plan.emphasized ? "#f0ede6" : "#1a1a1a",
								color: plan.emphasized ? "#111" : "#f0ede6",
								fontFamily: "'Helvetica Neue', sans-serif",
							}}
						>
							{plan.cta}
						</button>
					</article>
				))}
			</div>
		</section>
	);
}

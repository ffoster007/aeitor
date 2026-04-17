"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LifeBuoy, Mail, MessageCircleMore } from "lucide-react";

const HELP_EMAIL = "mailto:phugbzzkerza@gmail.com";
const DISCORD_INVITE = "https://discord.gg/QVnHXT5ve2";

function HelpItem({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<a
			href={href}
			target={href.startsWith("http") ? "_blank" : undefined}
			rel={href.startsWith("http") ? "noreferrer" : undefined}
			className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
		>
			{icon}
			{label}
		</a>
	);
}

export default function HelpAndFeedback() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!isOpen) return;

		const onClickOutside = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", onClickOutside);
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("mousedown", onClickOutside);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen]);

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-haspopup="menu"
				aria-expanded={isOpen}
				className="flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-[11px] text-[var(--text-soft)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] cursor-pointer"
			>
				<LifeBuoy size={14} strokeWidth={1.8} />
				<span className="hidden sm:inline">Help &amp; Feedback</span>
				<ChevronDown
					size={12}
					strokeWidth={2}
					className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			<div
				role="menu"
				className={`absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl transition-all duration-150 ease-out ${
					isOpen
						? "pointer-events-auto translate-y-0 scale-100 opacity-100"
						: "pointer-events-none -translate-y-1 scale-95 opacity-0"
				}`}
			>
				<div className="border-b border-[var(--border)] px-4 py-2.5">
					<p className="text-xs font-medium text-[var(--text-primary)]">Help &amp; Feedback</p>
					<p className="mt-0.5 text-[11px] text-[var(--text-soft)]">Choose a contact channel</p>
				</div>

				<div className="py-1.5">
					<HelpItem
						href={HELP_EMAIL}
						icon={<Mail size={14} strokeWidth={1.8} />}
						label="Email"
					/>
					<HelpItem
						href={DISCORD_INVITE}
						icon={<MessageCircleMore size={14} strokeWidth={1.8} />}
						label="Discord"
					/>
				</div>
			</div>
		</div>
	);
}

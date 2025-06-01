"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";

interface NavigationItem {
	href: string;
	labelKey: string;
	description?: string;
	icon?: React.ReactNode;
}

function Navigation() {
	const { t } = useI18n();
	const pathname = usePathname();
	const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// 点击外部区域关闭下拉菜单
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDevToolsOpen(false);
			}
		}

		if (isDevToolsOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDevToolsOpen]);

	// 图片工具组
	const imageTools: NavigationItem[] = [
		{
			href: "/",
			labelKey: "nav_animation",
			description: "animation_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5V4m0 0v16l-4-3-4 3V4m0 0H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
					<circle cx="9" cy="9" r="1" />
					<circle cx="15" cy="9" r="1" />
					<circle cx="12" cy="15" r="1" />
				</svg>
			),
		},
		{
			href: "/compress",
			labelKey: "nav_compress",
			description: "compress_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			),
		},
	];

	return (
		<nav className="flex items-center space-x-1">
			{/* 图片工具 - 平铺展示 */}
			{imageTools.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						"flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
						pathname === item.href 
							? "bg-accent text-accent-foreground shadow-sm" 
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<span className="transition-transform duration-300 ease-in-out group-hover:scale-110">
						{item.icon}
					</span>
					<span className="transition-all duration-300 ease-in-out">{t(item.labelKey)}</span>
				</Link>
			))}
		</nav>
	);
}

export default Navigation;
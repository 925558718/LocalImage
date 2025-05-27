"use client";

import Logo from "./Logo";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";

function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* 左侧：Logo */}
					<div className="flex items-center">
						<Logo />
					</div>

					{/* 中间：导航 */}
					<div className="flex-1 flex justify-center">
						<Navigation />
					</div>

					{/* 右侧：主题切换 */}
					<div className="flex items-center">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;

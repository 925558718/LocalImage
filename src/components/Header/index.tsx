"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../shadcn";
import { useEffect, useState } from "react";

function Header() {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="absolute top-0 px-6 py-2 flex justify-between w-full">
			{mounted ? (
				<Button
					variant="outline"
					className="ml-auto"
					size="icon"
					onClick={() => setTheme(theme === "light" ? "dark" : "light")}
				>
					{theme === "light" ? (
						<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					) : (
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					)}
				</Button>
			) : (
				<div style={{ width: 32, height: 32 }} />
			)}
		</div>
	);
}

export default Header;

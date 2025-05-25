"use client"
import { useI18n } from "@/hooks/useI18n";

function Footer() {
	const { t } = useI18n();
	return (
		<div className="fixed bottom-0 left-0 w-full text-center py-4 bg-background/80 backdrop-blur-sm border-t z-10">
			<p>
				{t("suggestion")}
				<a
					href="mailto:yugwhite@outlook.com"
					target="_blank"
					rel="noreferrer"
					className="underline mx-1"
				>
					yugwhite@outlook.com
				</a>
			</p>
		</div>
	);
}

export default Footer;

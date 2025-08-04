"use client";

import { useTranslations } from "next-intl";
import Compress from "@/components/compress";
import PageTitle from "@/components/PageTitle";

function Page() {
	const t = useTranslations();
	return (
		<>
			<PageTitle
				title={t("nav_convert")}
				description={t("compress_desc")}
				features={[
					{ text: t("high_quality"), color: "blue" },
					{ text: t("fast_processing"), color: "green" },
					{ text: t("privacy_protection"), color: "purple" },
				]}
				className="mb-12"
			/>

			{/* 内容区域 */}
			<div className="w-full max-w-6xl">
				<Compress />
			</div>
		</>
	);
}

export default Page;

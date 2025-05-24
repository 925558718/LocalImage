"use client";

import { useEffect, useState } from "react";
import ffmpeg from "@/lib/ffmpeg";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Compress from "@/components/compress";
import { useI18n } from "@/hooks/useI18n";
function Page() {
	const { t } = useI18n();
	const [isLoading, setIsloading] = useState(true);
	useEffect(() => {
		ffmpeg.load().then((res) => {
			setIsloading(false);
		});
	}, []);
	return (
		<div className="w-full h-full flex flex-col items-center min-h-[100vh]">
			<div className="min-h-[40vh] flex items-center justify-center flex-col">
				<div className="text-[40px] uppercase">{t("name")}</div>
				<div className="font-OS text-[12px] opacity-60">{t("desc")}</div>
			</div>
			{isLoading ? (
				<div className="flex justify-center items-center w-[300px] h-[300px]">
					<DotLottieReact
						src="/anim/waiting.json"
						loop
						autoplay
						width={50}
						height={50}
					/>
					{t("load_ffmpeg")}
				</div>
			) : (
				<Compress />
			)}
		</div>
	);
}

export default Page;

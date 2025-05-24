"use client";

import { useEffect, useState } from "react";
import ffmpeg from "@/lib/ffmpeg";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import ImageTrans from "@/components/ImageTrans";
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
		<div className="w-full h-full flex justify-center items-center min-h-[100vh]">
			{isLoading ? (
				<div className="flex justify-center items-center w-[300px] h-[300px]">
					<DotLottieReact
						src="/anim/waiting.json"
						loop
						autoplay
						width={50}
						height={50}
					/>
					{t("hello")}
				</div>
			) : (
				<ImageTrans />
			)}
		</div>
	);
}

export default Page;

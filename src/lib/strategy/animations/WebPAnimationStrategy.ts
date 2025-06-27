import { FFmpeg } from "@ffmpeg/ffmpeg";
import { AnimationStrategy } from "./AnimationStrategy";

/**
 * WebP动画创建策略
 * 负责将图片序列转换为WebP动画
 */
export class WebPAnimationStrategy implements AnimationStrategy {
	async createAnimation(
		ffmpeg: FFmpeg,
		{
			inputPattern,
			outputName,
			frameRate,
			quality,
		}: {
			images?: File[];
			inputPattern?: string;
			outputName: string;
			frameRate: number;
			quality: number;
			videoCodec?: string;
		},
	): Promise<Uint8Array> {
		if (!inputPattern) throw new Error("WebP动画需要帧文件模式");

		// 使用专门的WebP动画编解码器
		const args = [
			"-framerate",
			String(frameRate),
			"-i",
			inputPattern,
			"-c:v",
			"libwebp_anim", // 使用专门的WebP动画编解码器
			"-quality",
			String(quality),
			"-lossless",
			"0",
			"-loop",
			"0",
			"-preset",
			"default",
			"-method",
			"6",
			"-y", // 覆盖输出文件
			outputName,
		];

		console.log(`[动画合成] WebP动画命令: ffmpeg ${args.join(" ")}`);

		try {
			await ffmpeg.exec(args);

			// 立即检查文件是否生成
			const checkFiles = await ffmpeg.listDir("/");
			const outputExists = checkFiles.some((f) => f.name === outputName);
			console.log(
				`[动画合成] WebP动画执行后文件检查: ${outputExists ? "成功" : "失败"}`,
			);

			if (!outputExists) {
				throw new Error("WebP动画方法执行后文件未生成");
			}
		} catch (error) {
			console.warn("[动画合成] WebP动画方法失败:", error);

			// 备用方法：使用libwebp编解码器
			const fallbackArgs = [
				"-framerate",
				String(frameRate),
				"-i",
				inputPattern,
				"-c:v",
				"libwebp", // 备用编解码器
				"-quality",
				String(quality),
				"-lossless",
				"0",
				"-loop",
				"0",
				"-y", // 覆盖输出文件
				outputName,
			];

			console.log(`[动画合成] WebP备用命令: ffmpeg ${fallbackArgs.join(" ")}`);

			try {
				await ffmpeg.exec(fallbackArgs);

				// 再次检查文件是否生成
				const checkFiles2 = await ffmpeg.listDir("/");
				const outputExists2 = checkFiles2.some((f) => f.name === outputName);
				console.log(
					`[动画合成] WebP备用执行后文件检查: ${outputExists2 ? "成功" : "失败"}`,
				);

				if (!outputExists2) {
					throw new Error("WebP备用方法执行后文件仍未生成");
				}
			} catch (fallbackError) {
				console.error("[动画合成] WebP备用方法也失败:", fallbackError);
				throw new Error(
					`WebP动画生成失败: ${fallbackError instanceof Error ? fallbackError.message : "未知错误"}`,
				);
			}
		}

		const result = (await ffmpeg.readFile(outputName)) as Uint8Array;
		return result;
	}
}

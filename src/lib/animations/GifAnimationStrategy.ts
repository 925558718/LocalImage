import { FFmpeg } from "@ffmpeg/ffmpeg";
import { AnimationStrategy } from "./AnimationStrategy";

/**
 * GIF动画创建策略
 * 负责将图片序列转换为GIF动画
 */
export class GifAnimationStrategy implements AnimationStrategy {
	async createAnimation(ffmpeg: FFmpeg, {
		images,
		inputPattern,
		outputName,
		frameRate,
		quality
	}: {
		images?: File[];
		inputPattern?: string;
		outputName: string;
		frameRate: number;
		quality: number;
		videoCodec?: string;
	}): Promise<Uint8Array> {
		if (!inputPattern) throw new Error("GIF动画需要帧文件模式");

		// 生成调色板
		const paletteArgs = [
			"-framerate", String(frameRate),
			"-i", inputPattern,
			"-vf", "fps=10,scale=320:-1:flags=lanczos,palettegen",
			"-y", // 覆盖输出文件
			"palette.png"
		];
		
		console.log(`[动画合成] GIF调色板命令: ffmpeg ${paletteArgs.join(' ')}`);
		
		try {
			await ffmpeg.exec(paletteArgs);
			// 调色板文件已创建，在外部处理createdFiles
			
			// 检查调色板是否生成
			const paletteFiles = await ffmpeg.listDir('/');
			const paletteExists = paletteFiles.some(f => f.name === "palette.png");
			console.log(`[动画合成] 调色板生成检查: ${paletteExists ? '成功' : '失败'}`);
			
			if (!paletteExists) {
				throw new Error('调色板文件未生成');
			}
		} catch (error) {
			console.warn(`[动画合成] GIF调色板失败:`, error);
			throw new Error(`GIF调色板生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
		}
		
		// 生成 GIF
		const gifArgs = [
			"-framerate", String(frameRate),
			"-i", inputPattern,
			"-i", "palette.png",
			"-lavfi", "paletteuse",
			"-loop", "0",
			"-y", // 覆盖输出文件
			outputName
		];
		
		console.log(`[动画合成] GIF生成命令: ffmpeg ${gifArgs.join(' ')}`);
		
		try {
			await ffmpeg.exec(gifArgs);
			
			// 检查GIF是否生成
			const gifFiles = await ffmpeg.listDir('/');
			const gifExists = gifFiles.some(f => f.name === outputName);
			console.log(`[动画合成] GIF生成检查: ${gifExists ? '成功' : '失败'}`);
			
			if (!gifExists) {
				throw new Error('GIF标准方法执行后文件未生成');
			}
		} catch (error) {
			console.warn(`[动画合成] GIF标准方法失败:`, error);
			
			// 最简化的GIF生成方法
			const simpleGifArgs = [
				"-framerate", String(frameRate),
				"-i", inputPattern,
				"-vf", `fps=${frameRate}`,
				"-y", // 覆盖输出文件
				outputName
			];
			
			console.log(`[动画合成] GIF最简化命令: ffmpeg ${simpleGifArgs.join(' ')}`);
			
			try {
				await ffmpeg.exec(simpleGifArgs);
				
				// 最后检查GIF是否生成
				const gifFiles2 = await ffmpeg.listDir('/');
				const gifExists2 = gifFiles2.some(f => f.name === outputName);
				console.log(`[动画合成] GIF简化生成检查: ${gifExists2 ? '成功' : '失败'}`);
				
				if (!gifExists2) {
					throw new Error('GIF简化方法执行后文件仍未生成');
				}
			} catch (simpleError) {
				console.error(`[动画合成] GIF简化方法也失败:`, simpleError);
				throw new Error(`GIF动画生成失败: ${simpleError instanceof Error ? simpleError.message : '未知错误'}`);
			}
		}
		
		const result = (await ffmpeg.readFile(outputName)) as Uint8Array;
		return result;
	}
} 
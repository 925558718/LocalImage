import { FFmpeg } from "@ffmpeg/ffmpeg";
import { AnimationStrategy } from "./AnimationStrategy";

/**
 * MP4视频创建策略
 * 负责将图片序列转换为MP4视频
 */
export class MP4AnimationStrategy implements AnimationStrategy {
	async createAnimation(ffmpeg: FFmpeg, {
		inputPattern,
		outputName,
		frameRate,
		quality,
		videoCodec
	}: {
		images?: File[];
		inputPattern?: string;
		outputName: string;
		frameRate: number;
		quality: number;
		videoCodec?: string;
	}): Promise<Uint8Array> {
		if (!inputPattern) throw new Error("MP4视频需要帧文件模式");
		
		// 使用指定的编解码器或默认使用libx264
		const codec = videoCodec || "libx264";
		
		// MP4 (H.264/H.265) 质量范围: 0-51 (0=无损, 51=最差质量)
		// 将0-100映射到18-36 (常用范围)
		const crf = Math.round(51 - (quality / 100 * 33)); // 51-18=33
		console.log(`[动画合成] MP4 质量: ${quality}% -> CRF ${crf}`);
		
		const args = [
			"-framerate", String(frameRate),
			"-i", inputPattern,
			"-c:v", codec,
			"-crf", String(crf),
			"-pix_fmt", "yuv420p", // 确保兼容性
			"-movflags", "+faststart", // 优化网络播放
			"-preset", "medium", // 编码速度/质量平衡
			"-y", // 覆盖输出文件
			outputName
		];
		
		// 特定于H.265的设置
		if (codec === "libx265") {
			args.push("-tag:v", "hvc1"); // 确保Safari兼容性
		}
		
		console.log(`[动画合成] MP4 视频命令: ffmpeg ${args.join(' ')}`);
		
		try {
			await ffmpeg.exec(args);
			
			// 检查文件是否生成
			const checkFiles = await ffmpeg.listDir('/');
			const outputExists = checkFiles.some(f => f.name === outputName);
			console.log(`[动画合成] MP4 视频执行后文件检查: ${outputExists ? '成功' : '失败'}`);
			
			if (!outputExists) {
				throw new Error(`MP4 视频生成失败`);
			}
		} catch (error) {
			console.error(`[动画合成] MP4 视频生成失败:`, error);
			throw new Error(`MP4 视频生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
		}
		
		const result = (await ffmpeg.readFile(outputName)) as Uint8Array;
		return result;
	}
} 
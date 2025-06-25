import { FFmpeg } from "@ffmpeg/ffmpeg";

/**
 * 动画创建策略接口
 * 定义了所有动画生成策略必须实现的方法
 */
export interface AnimationStrategy {
	createAnimation(
		ffmpeg: FFmpeg,
		{
			images,
			inputPattern,
			outputName,
			frameRate,
			quality,
			videoCodec,
		}: {
			images?: File[];
			inputPattern?: string;
			outputName: string;
			frameRate: number;
			quality: number;
			videoCodec?: string;
		},
	): Promise<Uint8Array>;
}

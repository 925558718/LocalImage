import { AnimationStrategy } from "./AnimationStrategy";
import { GifAnimationStrategy } from "./GifAnimationStrategy";
import { MP4AnimationStrategy } from "./MP4AnimationStrategy";
import { WebPAnimationStrategy } from "./WebPAnimationStrategy";

/**
 * 获取适合指定格式的动画策略
 * @param format 输出格式 (gif/webp/mp4)
 * @returns 对应的动画策略实现
 */
export function getAnimationStrategy(format: string): AnimationStrategy {
	switch (format.toLowerCase()) {
		case "gif":
			return new GifAnimationStrategy();
		case "webp":
			return new WebPAnimationStrategy();
		case "mp4":
			return new MP4AnimationStrategy();
		default:
			throw new Error(`不支持的格式: ${format}。支持的格式: WebP, GIF, MP4`);
	}
}

// 保持向后兼容的别名
export const AnimationStrategyFactory = {
	getStrategy: getAnimationStrategy,
};

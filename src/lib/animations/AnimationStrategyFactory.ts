import { AnimationStrategy } from "./AnimationStrategy";
import { GifAnimationStrategy } from "./GifAnimationStrategy";
import { WebPAnimationStrategy } from "./WebPAnimationStrategy";
import { MP4AnimationStrategy } from "./MP4AnimationStrategy";

/**
 * 动画策略工厂
 * 根据输出格式创建相应的动画策略实例
 */
export class AnimationStrategyFactory {
	/**
	 * 获取适合指定格式的动画策略
	 * @param format 输出格式 (gif/webp/mp4)
	 * @returns 对应的动画策略实现
	 */
	static getStrategy(format: string): AnimationStrategy {
		switch (format.toLowerCase()) {
			case 'gif':
				return new GifAnimationStrategy();
			case 'webp':
				return new WebPAnimationStrategy();
			case 'mp4':
				return new MP4AnimationStrategy();
			default:
				throw new Error(`不支持的格式: ${format}。支持的格式: WebP, GIF, MP4`);
		}
	}
} 
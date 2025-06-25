import { atom } from "jotai";
import ffm_ins from "@/lib/ffmpeg";

// FFmpeg 状态原子
export const ffmpegLoadingAtom = atom(false);
export const ffmpegReadyAtom = atom(false);
export const ffmpegErrorAtom = atom<string | null>(null);

// FFmpeg 加载函数原子
export const loadFFmpegAtom = atom(null, async (get, set) => {
	const isLoading = get(ffmpegLoadingAtom);
	const isReady = get(ffmpegReadyAtom);

	// 如果已经在加载或已经准备好，直接返回
	if (isLoading || isReady) return;

	set(ffmpegLoadingAtom, true);
	set(ffmpegErrorAtom, null);

	try {
		if (!ffm_ins) {
			throw new Error("FFmpeg实例未初始化");
		}

		console.log("[全局FFmpeg] 开始加载FFmpeg...");
		const startTime = Date.now();

		await ffm_ins.load();

		const loadTime = Date.now() - startTime;
		console.log(`[全局FFmpeg] FFmpeg加载完成，耗时: ${loadTime}ms`);

		// 确保loading状态至少显示800ms，让用户看到
		if (loadTime < 800) {
			console.log(`[全局FFmpeg] 延长loading显示时间: ${800 - loadTime}ms`);
			await new Promise((resolve) => setTimeout(resolve, 800 - loadTime));
		}

		set(ffmpegReadyAtom, true);
		console.log("[全局FFmpeg] FFmpeg准备完毕");
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "未知错误";
		console.error("[全局FFmpeg] FFmpeg加载失败:", errorMessage);
		set(ffmpegErrorAtom, errorMessage);
	} finally {
		set(ffmpegLoadingAtom, false);
	}
});

// 重置FFmpeg状态原子（用于错误恢复或手动重新加载）
export const resetFFmpegAtom = atom(null, (_, set) => {
	set(ffmpegLoadingAtom, false);
	set(ffmpegReadyAtom, false);
	set(ffmpegErrorAtom, null);
});

import { describe, it, expect, beforeAll, vi } from 'vitest';
import ffm_ins from '../ffmpeg';

// Mock file creation helper
function createMockFile(name: string, size: number = 1000): File {
	const buffer = new ArrayBuffer(size);
	const uint8Array = new Uint8Array(buffer);
	// Fill with some dummy image data
	for (let i = 0; i < size; i++) {
		uint8Array[i] = Math.floor(Math.random() * 256);
	}
	
	const blob = new Blob([uint8Array], { type: 'image/png' });
	return new File([blob], name, { type: 'image/png' });
}

describe('FFmpeg 动画功能测试', () => {
	beforeAll(async () => {
		// Mock FFmpeg methods for testing
		vi.spyOn(ffm_ins, 'load').mockResolvedValue();
		vi.spyOn(ffm_ins as any, 'ffmpeg', 'get').mockReturnValue({
			writeFile: vi.fn().mockResolvedValue(undefined),
			exec: vi.fn().mockResolvedValue(undefined),
			readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
		});
	});

	describe('createAnimation 方法测试', () => {
		it('应该正确处理多张图片的动画合成', async () => {
			const testFiles = [
				createMockFile('frame1.png'),
				createMockFile('frame2.png'),
				createMockFile('frame3.png')
			];

			const result = await ffm_ins.createAnimation({
				images: testFiles,
				outputName: 'test.webp',
				frameRate: 10,
				quality: 80
			});

			expect(result).toBeInstanceOf(Uint8Array);
			expect(result.length).toBeGreaterThan(0);
		});

		it('应该正确处理GIF格式输出', async () => {
			const testFiles = [
				createMockFile('frame1.png'),
				createMockFile('frame2.png')
			];

			const result = await ffm_ins.createAnimation({
				images: testFiles,
				outputName: 'test.gif',
				frameRate: 5,
				quality: 70
			});

			expect(result).toBeInstanceOf(Uint8Array);
		});

		it('应该在没有图片时抛出错误', async () => {
			await expect(ffm_ins.createAnimation({
				images: [],
				outputName: 'test.webp'
			})).rejects.toThrow('至少需要一张图片');
		});

		it('应该在不支持的格式时抛出错误', async () => {
			const testFiles = [createMockFile('frame1.png')];

			await expect(ffm_ins.createAnimation({
				images: testFiles,
				outputName: 'test.mp4'
			})).rejects.toThrow('仅支持WebP和GIF格式');
		});

		it('应该使用正确的默认值', async () => {
			const testFiles = [createMockFile('frame1.png'), createMockFile('frame2.png')];

			// Test that default values are properly applied
			const ffmpegInstance = (ffm_ins as any).ffmpeg;
			const execSpy = vi.spyOn(ffmpegInstance, 'exec');

			await ffm_ins.createAnimation({
				images: testFiles,
				outputName: 'test.webp'
			});

			// Check that default frameRate (10) and quality (75) are used
			const execCalls = execSpy.mock.calls;
			const lastCall = execCalls[execCalls.length - 1];
			expect(lastCall[0]).toContain('10'); // frameRate
			expect(lastCall[0]).toContain('75'); // quality
		});

		it('应该正确处理自定义参数', async () => {
			const testFiles = [createMockFile('frame1.png'), createMockFile('frame2.png')];
			const ffmpegInstance = (ffm_ins as any).ffmpeg;
			const execSpy = vi.spyOn(ffmpegInstance, 'exec');

			await ffm_ins.createAnimation({
				images: testFiles,
				outputName: 'test.webp',
				frameRate: 20,
				quality: 90
			});

			const execCalls = execSpy.mock.calls;
			const lastCall = execCalls[execCalls.length - 1];
			expect(lastCall[0]).toContain('20'); // custom frameRate
			expect(lastCall[0]).toContain('90'); // custom quality
		});
	});
}); 
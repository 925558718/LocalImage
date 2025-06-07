import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FORMAT_CONVERSION_MAP, ImageFormat } from '../conversions'

// 创建一个简化的FFmpeg类用于测试
class MockFFMPEG {
  private ffmpeg: any = null
  private isLoaded = false

  constructor() {
    this.ffmpeg = {
      on: vi.fn(),
      load: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      exec: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
    }
  }

  async load() {
    if (this.isLoaded) return
    await this.ffmpeg.load()
    this.isLoaded = true
  }

  /**
   * 这是我们要测试的核心函数 - convertImage
   * 复制自原始实现，但使用mock的ffmpeg实例
   */
  async convertImage({
    input,
    outputName,
    quality = 75,
    width,
    height,
  }: {
    input: string | Uint8Array | ArrayBuffer;
    outputName: string;
    quality?: number;
    width?: number;
    height?: number;
  }): Promise<Uint8Array> {
    await this.load()
    
    // 自动判断输入格式
    const ext = outputName.split(".").pop()?.toLowerCase() || "jpg"
    let inputFileName = `input_image.${ext}`
    
    if (
      typeof input === "string" &&
      (input.endsWith(".png") ||
        input.endsWith(".jpg") ||
        input.endsWith(".jpeg") ||
        input.endsWith(".webp") ||
        input.endsWith(".avif"))
    ) {
      inputFileName = `input_image.${input.split(".").pop()}`
    } else if (typeof input === "string") {
      inputFileName = "input_image.jpg"
    }
    
    // 写入输入文件
    let fileData: Uint8Array
    if (
      typeof input === "string" &&
      (input.startsWith("http://") || input.startsWith("https://"))
    ) {
      // 模拟fetchFile
      fileData = new Uint8Array([5, 6, 7, 8])
    } else {
      fileData =
        input instanceof Uint8Array
          ? input
          : new Uint8Array(input as ArrayBuffer)
    }
    
    if (!this.ffmpeg) throw new Error("ffmpeg 未初始化")
    await this.ffmpeg.writeFile(inputFileName, fileData)

    // 构建参数
    const args = ["-i", inputFileName]
    
    // 分辨率缩放
    if (width || height) {
      let scaleArg = "scale="
      scaleArg += width ? `${width}:` : "-1:"
      scaleArg += height ? `${height}` : "-1"
      args.push("-vf", scaleArg)
    }
    
    if (ext === "jpg" || ext === "jpeg") {
      args.push("-q:v", String(Math.round((100 - quality) / 2.5))) // 0(高质量)-31(低质量)
    } else if (ext === "webp") {
      args.push("-qscale", String(quality)) // 0-100
    } else if (ext === "avif") {
      // AVIF 需要使用特定编码器和参数
      args.push("-c:v", "libaom-av1")
      args.push("-strict", "experimental")
      args.push("-crf", String(Math.round((100 - quality) * 0.63))) // 将quality转换为crf值(0-63)
      args.push("-b:v", "0") // 使用CRF而非比特率
    }
    args.push(outputName)

    await this.ffmpeg.exec(args)
    return (await this.ffmpeg.readFile(outputName)) as Uint8Array
  }

  // 暴露内部ffmpeg实例用于测试验证
  getMockFFmpeg() {
    return this.ffmpeg
  }
}

describe('FFmpeg convertImage 核心函数测试', () => {
  let ffmpegInstance: MockFFMPEG
  let mockFFmpeg: any

  beforeEach(() => {
    ffmpegInstance = new MockFFMPEG()
    mockFFmpeg = ffmpegInstance.getMockFFmpeg()
    vi.clearAllMocks()
  })

  describe('基本转换功能', () => {
    it('应该正确处理基本的WebP转换', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.webp'
      const quality = 80

      const result = await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      // 验证FFmpeg被加载
      expect(mockFFmpeg.load).toHaveBeenCalled()
      
      // 验证文件被写入
      expect(mockFFmpeg.writeFile).toHaveBeenCalledWith(
        'input_image.webp',
        input
      )
      
      // 验证FFmpeg命令被执行
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-qscale', '80',
        'output.webp'
      ])
      
      // 验证结果文件被读取
      expect(mockFFmpeg.readFile).toHaveBeenCalledWith('output.webp')
      
      // 验证返回结果
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4]))
    })

    it('应该正确处理JPEG转换和质量参数', async () => {
      const input = new ArrayBuffer(1024)
      const outputName = 'output.jpg'
      const quality = 85

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      // 验证JPEG质量转换: Math.round((100 - 85) / 2.5) = 6
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.jpg',
        '-q:v', '6',
        'output.jpg'
      ])
    })

    it('应该正确处理AVIF转换的特殊参数', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.avif'
      const quality = 50

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      // 验证AVIF特殊参数
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.avif',
        '-c:v', 'libaom-av1',
        '-strict', 'experimental',
        '-crf', '32', // Math.round((100 - 50) * 0.63) = 32
        '-b:v', '0',
        'output.avif'
      ])
    })
  })

  describe('图像尺寸调整', () => {
    it('应该正确处理宽度和高度调整', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.webp'
      const quality = 80
      const width = 800
      const height = 600

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality,
        width,
        height
      })

      // 验证缩放参数
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-vf', 'scale=800:600',
        '-qscale', '80',
        'output.webp'
      ])
    })

    it('应该正确处理仅宽度调整', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.webp'
      const width = 800

      await ffmpegInstance.convertImage({
        input,
        outputName,
        width
      })

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-vf', 'scale=800:-1',
        '-qscale', '75', // 默认质量
        'output.webp'
      ])
    })

    it('应该正确处理仅高度调整', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.webp'
      const height = 600

      await ffmpegInstance.convertImage({
        input,
        outputName,
        height
      })

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-vf', 'scale=-1:600',
        '-qscale', '75', // 默认质量
        'output.webp'
      ])
    })
  })

  describe('输入类型处理', () => {
    it('应该正确处理URL输入', async () => {
      const input = 'https://example.com/image.jpg'
      const outputName = 'output.webp'

      await ffmpegInstance.convertImage({
        input,
        outputName
      })

      // 验证输入文件名基于URL扩展名
      expect(mockFFmpeg.writeFile).toHaveBeenCalledWith(
        'input_image.jpg',
        expect.any(Uint8Array)
      )
    })

    it('应该正确处理带扩展名的字符串输入', async () => {
      const input = 'image.png'
      const outputName = 'output.webp'

      await ffmpegInstance.convertImage({
        input,
        outputName
      })

      // 验证输入文件名基于输入扩展名
      expect(mockFFmpeg.writeFile).toHaveBeenCalledWith(
        'input_image.png',
        expect.any(Uint8Array)
      )
    })

    it('应该正确处理无扩展名的字符串输入', async () => {
      const input = 'some-string'
      const outputName = 'output.webp'

      await ffmpegInstance.convertImage({
        input,
        outputName
      })

      // 验证使用默认jpg扩展名
      expect(mockFFmpeg.writeFile).toHaveBeenCalledWith(
        'input_image.jpg',
        expect.any(Uint8Array)
      )
    })
  })

  describe('质量参数转换', () => {
    it('应该正确转换JPEG质量参数', async () => {
      const testCases = [
        { quality: 100, expected: '0' },   // Math.round((100 - 100) / 2.5) = 0
        { quality: 85, expected: '6' },    // Math.round((100 - 85) / 2.5) = 6
        { quality: 50, expected: '20' },   // Math.round((100 - 50) / 2.5) = 20
        { quality: 0, expected: '40' }     // Math.round((100 - 0) / 2.5) = 40
      ]

      for (const { quality, expected } of testCases) {
        vi.clearAllMocks()
        
        await ffmpegInstance.convertImage({
          input: new Uint8Array([1, 2, 3, 4]),
          outputName: 'output.jpg',
          quality
        })

        expect(mockFFmpeg.exec).toHaveBeenCalledWith([
          '-i', 'input_image.jpg',
          '-q:v', expected,
          'output.jpg'
        ])
      }
    })

    it('应该正确转换AVIF质量参数', async () => {
      const testCases = [
        { quality: 100, expected: '0' },   // Math.round((100 - 100) * 0.63) = 0
        { quality: 50, expected: '32' },   // Math.round((100 - 50) * 0.63) = 32
        { quality: 0, expected: '63' }     // Math.round((100 - 0) * 0.63) = 63
      ]

      for (const { quality, expected } of testCases) {
        vi.clearAllMocks()
        
        await ffmpegInstance.convertImage({
          input: new Uint8Array([1, 2, 3, 4]),
          outputName: 'output.avif',
          quality
        })

        expect(mockFFmpeg.exec).toHaveBeenCalledWith([
          '-i', 'input_image.avif',
          '-c:v', 'libaom-av1',
          '-strict', 'experimental',
          '-crf', expected,
          '-b:v', '0',
          'output.avif'
        ])
      }
    })
  })

  describe('默认值和边界情况', () => {
    it('应该在未指定质量时使用默认值', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.webp'

      await ffmpegInstance.convertImage({
        input,
        outputName
      })

      // 验证使用默认质量(75)
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-qscale', '75',
        'output.webp'
      ])
    })

    it('应该正确处理PNG格式(无质量参数)', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.png'
      const quality = 80

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      // PNG不使用质量参数
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.png',
        'output.png'
      ])
    })

    it('应该正确处理所有支持的输入格式', async () => {
      const formats = ['png', 'jpg', 'jpeg', 'webp', 'avif']
      
      for (const format of formats) {
        vi.clearAllMocks()
        
        await ffmpegInstance.convertImage({
          input: `image.${format}`,
          outputName: 'output.webp'
        })

        expect(mockFFmpeg.writeFile).toHaveBeenCalledWith(
          `input_image.${format}`,
          expect.any(Uint8Array)
        )
      }
    })
  })

  describe('实际使用场景测试', () => {
    it('应该模拟压缩组件中的实际调用', async () => {
      // 模拟压缩组件中的实际调用
      const file = new ArrayBuffer(1024 * 1024) // 1MB文件
      const baseName = 'photo'
      const format = 'webp'
      const quality = 85
      const width = 800
      const height = 600
      
      const outputName = `${baseName}_compressed.${format}`

      const result = await ffmpegInstance.convertImage({
        input: file,
        outputName,
        quality,
        width: width,
        height: height
      })

      // 验证完整的转换流程
      expect(mockFFmpeg.writeFile).toHaveBeenCalledWith(
        'input_image.webp',
        expect.any(Uint8Array)
      )
      
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-vf', 'scale=800:600',
        '-qscale', '85',
        'photo_compressed.webp'
      ])
      
      expect(result).toBeInstanceOf(Uint8Array)
    })
  })

  describe('格式转换映射测试', () => {
    it('应该正确验证格式转换映射', () => {
      // 验证每个格式都有对应的转换目标
      Object.entries(FORMAT_CONVERSION_MAP).forEach(([sourceFormat, targetFormats]) => {
        expect(targetFormats).toBeInstanceOf(Array)
        expect(targetFormats.length).toBeGreaterThan(0)
        
        // 验证目标格式都是有效的
        targetFormats.forEach(format => {
          expect(Object.keys(FORMAT_CONVERSION_MAP)).toContain(format)
        })
      })
    })

    it('应该支持所有基本格式的转换', () => {
      const formats: ImageFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'avif']
      
      formats.forEach(sourceFormat => {
        const targetFormats = FORMAT_CONVERSION_MAP[sourceFormat]
        expect(targetFormats).toBeDefined()
        expect(targetFormats.length).toBeGreaterThan(0)
      })
    })
  })

  describe('转换策略测试', () => {
    it('应该使用正确的JPEG转换策略', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.jpg'
      const quality = 85

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      // 验证JPEG质量转换: Math.round((100 - 85) / 2.5) = 6
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.jpg',
        '-q:v', '6',
        'output.jpg'
      ])
    })

    it('应该使用正确的WebP转换策略', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.webp'
      const quality = 80

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.webp',
        '-qscale', '80',
        'output.webp'
      ])
    })

    it('应该使用正确的AVIF转换策略', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.avif'
      const quality = 50

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.avif',
        '-c:v', 'libaom-av1',
        '-strict', 'experimental',
        '-crf', '32', // Math.round((100 - 50) * 0.63) = 32
        '-b:v', '0',
        'output.avif'
      ])
    })

    it('应该使用默认转换策略处理PNG', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.png'
      const quality = 80

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.png',
        'output.png'
      ])
    })

    it('应该正确处理未知格式', async () => {
      const input = new Uint8Array([1, 2, 3, 4])
      const outputName = 'output.unknown'
      const quality = 80

      await ffmpegInstance.convertImage({
        input,
        outputName,
        quality
      })

      // 未知格式应该使用默认策略
      expect(mockFFmpeg.exec).toHaveBeenCalledWith([
        '-i', 'input_image.unknown',
        'output.unknown'
      ])
    })
  })
}) 
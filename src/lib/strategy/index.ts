import { FFMPEGOptions } from "../ffmpeg";
import { InputFileType } from "../fileUtils";

// 基础通用选项 - 所有策略都需要的公共属性
export interface BaseOptions {
    // 输出相关
    format?: string;              // 输出格式
    outputName?: string;          // 输出文件名
    outputSuffixName?: string;    // 输出后缀名
    // 尺寸相关
    width?: number;               // 输出宽度
    height?: number;              // 输出高度
}

// 定义不同action类型对应的options，继承BaseOptions
export interface UpscaleOptions extends BaseOptions {
    // upscale特有的选项
    algorithm?: 'lanczos' | 'bicubic' | 'bilinear' | 'neighbor';
    scaleFactor?: number;         // 放大倍数
}

export interface ConvertOptions extends BaseOptions {
    format: string;               // convert必须指定格式，覆盖BaseOptions中的可选format
    // convert特有的选项
    compressionLevel?: number;    // 压缩级别
    lossless?: boolean;          // 无损压缩
    progressive?: boolean;        // 渐进式编码 (JPEG)
}

export interface AnimationOptions extends BaseOptions {
    // animation特有的选项
    frameRate?: number;          // 帧率
    videoCodec?: string;         // 视频编解码器
    duration?: number;           // 动画时长
    loop?: boolean;              // 是否循环
    method?: number;             // webp method
    startTime?: number;          // 开始时间
    endTime?: number;            // 结束时间
}

// 创建action到options的映射类型
export type ActionOptionsMap = {
    upscale: UpscaleOptions;
    convert: ConvertOptions;
    animation: AnimationOptions;
};

export type ACTION_TYPE = keyof ActionOptionsMap;

// 泛型策略接口
export interface Strategy<T extends ACTION_TYPE = ACTION_TYPE> {
    canDo: (input: InputFileType, options: ActionOptionsMap[T]) => boolean;
    generateFFMPEGCommand: (input: InputFileType, options: ActionOptionsMap[T]) => string[];
}

// 具体的策略类型
export type UpscaleStrategy = Strategy<'upscale'>;
export type ConvertStrategy = Strategy<'convert'>;
export type AnimationStrategy = Strategy<'animation'>;

const upscale_strategy_pool: UpscaleStrategy[] = []
const convert_strategy_pool: ConvertStrategy[] = []
const animation_strategy_pool: AnimationStrategy[] = []

// 创建 action 到 strategy pool 的映射
const strategyPoolMap = {
    upscale: upscale_strategy_pool,
    convert: convert_strategy_pool,
    animation: animation_strategy_pool
} as const;

// 重载函数以支持类型安全
export function generateFFMPEGCommand(action: 'upscale', input: InputFileType, options: UpscaleOptions): string[];
export function generateFFMPEGCommand(action: 'convert', input: InputFileType, options: ConvertOptions): string[];
export function generateFFMPEGCommand(action: 'animation', input: InputFileType, options: AnimationOptions): string[];
export function generateFFMPEGCommand(
    action: ACTION_TYPE,
    input: InputFileType,
    options: UpscaleOptions | ConvertOptions | AnimationOptions
): string[] {
    const command: string[] = [];

    if (action === 'upscale') {
        const strategyPool = strategyPoolMap.upscale;
        const upscaleOptions = options as UpscaleOptions;
        for (const strategy of strategyPool) {
            if (strategy.canDo(input, upscaleOptions)) {
                command.push(...strategy.generateFFMPEGCommand(input, upscaleOptions));
            }
        }
    } else if (action === 'convert') {
        const strategyPool = strategyPoolMap.convert;
        const convertOptions = options as ConvertOptions;
        for (const strategy of strategyPool) {
            if (strategy.canDo(input, convertOptions)) {
                command.push(...strategy.generateFFMPEGCommand(input, convertOptions));
            }
        }
    } else if (action === 'animation') {
        const strategyPool = strategyPoolMap.animation;
        const animationOptions = options as AnimationOptions;
        for (const strategy of strategyPool) {
            if (strategy.canDo(input, animationOptions)) {
                command.push(...strategy.generateFFMPEGCommand(input, animationOptions));
            }
        }
    } else {
        throw new Error(`Unsupported action: ${action}`);
    }
    input.ffmpeg_command = command
    return command;
}
// 导出策略池以供注册新策略使用
export const strategyPools = {
    upscale: upscale_strategy_pool,
    convert: convert_strategy_pool,
    animation: animation_strategy_pool
} as const;

// 注册策略的辅助函数
export function registerUpscaleStrategy(strategy: UpscaleStrategy): void {
    upscale_strategy_pool.push(strategy);
}

export function registerConvertStrategy(strategy: ConvertStrategy): void {
    convert_strategy_pool.push(strategy);
}

export function registerAnimationStrategy(strategy: AnimationStrategy): void {
    animation_strategy_pool.push(strategy);
}

// 通用的选项处理辅助函数
export function generateOutputFileName(input: InputFileType, options: BaseOptions): string {
    const baseName = input.name.replace(/\.[^.]+$/, '');
    const outputFormat = options.format || input.format || 'png';

    // 如果有自定义输出名，使用它
    if (options.outputName) {
        return options.outputName.includes('.')
            ? options.outputName
            : `${options.outputName}.${outputFormat}`;
    }

    // 否则使用原文件名 + 后缀
    const suffix = options.outputSuffixName ? `_${options.outputSuffixName}` : '';
    return `${baseName}${suffix}.${outputFormat}`;
}

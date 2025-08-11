import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
// Cloudflare R2 配置
interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region?: string;
}

class CloudflareR2Uploader {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(config: R2Config) {
        this.bucketName = config.bucketName;

        // 使用 Cloudflare R2 的 S3 兼容端点
        this.s3Client = new S3Client({
            region: config.region || 'auto',
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }

    /**
     * 上传单个文件到 R2
     */
    async uploadFile(localFilePath: string, r2Key: string): Promise<void> {
        try {
            const fileContent = fs.readFileSync(localFilePath);

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: r2Key,
                Body: fileContent,
            });

            await this.s3Client.send(command);
            console.log(`✅ 上传成功: ${r2Key}`);
        } catch (error) {
            console.error(`❌ 上传失败: ${r2Key}`, error);
            throw error;
        }
    }

    /**
     * 批量上传目录中的所有文件（并发优化）
     */
    async uploadDirectory(localDir: string, r2Prefix: string = '', concurrency: number = 100): Promise<void> {
        const files = this.getAllFiles(localDir);

        console.log(`🚀 开始上传 ${files.length} 个文件到 R2... (并发数: ${concurrency})`);

        // 创建上传任务
        const uploadTasks = files.map(file => {
            const relativePath = this.getRelativePath(localDir, file);
            const r2Key = r2Prefix ? `${r2Prefix}/${relativePath}` : relativePath;
            const normalizedKey = r2Key.replace(/\\/g, '/');
            
            return () => this.uploadFile(file, normalizedKey);
        });

        // 并发执行上传任务
        await this.executeConcurrent(uploadTasks, concurrency);

        console.log(`🎉 所有文件上传完成！`);
    }

    /**
     * 并发执行任务
     */
    private async executeConcurrent<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
        const results: T[] = [];
        const executing: Promise<void>[] = [];

        for (const task of tasks) {
            const promise = task().then(result => {
                results.push(result);
                const index = executing.indexOf(promise);
                if (index > -1) executing.splice(index, 1);
            });

            executing.push(promise);

            if (executing.length >= concurrency) {
                await Promise.race(executing);
            }
        }

        await Promise.all(executing);
        return results;
    }

    /**
     * 获取相对路径并标准化为URL格式
     */
    private getRelativePath(from: string, to: string): string {
        const relativePath = path.relative(from, to);
        // 统一转换为正斜杠 (URL 格式)
        return relativePath.replace(/\\/g, '/');
    }

    /**
     * 递归获取目录中的所有文件
     */
    private getAllFiles(dir: string): string[] {
        const files: string[] = [];
        
        try {
            const entries = fs.readdirSync(dir);
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stat = fs.lstatSync(fullPath);
                
                if (stat.isDirectory()) {
                    files.push(...this.getAllFiles(fullPath));
                } else if (stat.isFile()) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`❌ 读取目录失败: ${dir}`, error);
        }

        return files;
    }

}

// 主函数
async function main() {
    // 从环境变量获取配置
    const config: R2Config = {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    };

    // 验证必需的环境变量
    if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
        console.error('❌ 缺少必需的环境变量！请检查以下变量是否设置：');
        console.error('  - CLOUDFLARE_ACCOUNT_ID');
        console.error('  - CLOUDFLARE_R2_ACCESS_KEY_ID');
        console.error('  - CLOUDFLARE_R2_SECRET_ACCESS_KEY');
        console.error('  - CLOUDFLARE_R2_BUCKET_NAME');
        process.exit(1);
    }

    const uploader = new CloudflareR2Uploader(config);

    try {
        // Next.js 静态文件目录
        const nextDir = path.join(process.cwd(), '.next');
        const publicDir = path.join(process.cwd(), 'public');
        
        console.log('📁 检查目录:', { nextDir, publicDir });
        
        // 检查目录是否存在
        const hasNext = fs.existsSync(nextDir);
        const hasPublic = fs.existsSync(publicDir);
        if (!hasNext && !hasPublic) {
            console.error('❌ 找不到 Next.js 静态文件目录');
            console.error('请先运行: npm run build');
            process.exit(1);
        }

        // 上传 .next 静态文件
        if (hasNext) {
            console.log('📦 上传 .next 目录...');
            await uploader.uploadDirectory(nextDir, '_next');
        }

        // 上传 public 静态文件
        if (hasPublic) {
            console.log('🌐 上传 public 目录...');
            await uploader.uploadDirectory(publicDir);
        }

        console.log('🎉 Next.js 静态文件上传到 Cloudflare R2 完成！');

    } catch (error) {
        console.error('❌ 上传过程中出现错误:', error);
        process.exit(1);
    }
}

main()
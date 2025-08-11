import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

console.log("uploading...")

// Cloudflare R2 客户端
const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
})

const file1 = fs.readdirSync(".next/static/", { recursive: true })
const file2 = fs.readdirSync("public/", { recursive: true })

let uploadFiles: { r2Path: string; localPath: string }[] = []

file1.forEach((each) => {
    uploadFiles.push({
        r2Path: "_next/static/" + each,
        localPath: ".next/static/" + each,
    })
})

file2.forEach((each) => {
    uploadFiles.push({
        r2Path: "/" + each,
        localPath: "public/" + each,
    })
})

uploadFiles.forEach(async (file) => {
    if (fs.lstatSync(file.localPath).isDirectory()) return
    
    const fileContent = fs.readFileSync(file.localPath)
    const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: file.r2Path,
        Body: fileContent,
    })
    
    client.send(command).catch((err) => {
        console.error(file.localPath + " upload failed")
    })
})
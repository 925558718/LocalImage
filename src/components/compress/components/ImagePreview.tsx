import { useRef } from "react";
import { useTranslations } from 'next-intl';
import Image from "next/image";

interface ImagePreviewProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAllFiles: () => void;
  onAddMoreFiles: () => void;
}

export function ImagePreview({ files, onRemoveFile, onClearAllFiles, onAddMoreFiles }: ImagePreviewProps) {
  const t = useTranslations();
  
  if (files.length === 0) return null;
  
  return (
    <div className="space-y-1 max-h-[300px] overflow-y-auto p-2 border rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{t('uploaded_files')} ({files.length})</h3>
        <button 
          className="text-xs text-destructive hover:underline" 
          onClick={onClearAllFiles}
        >
          {t('clear_all')}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => {
          // 创建文件预览URL
          const filePreview = file.type.startsWith('image/') 
            ? URL.createObjectURL(file)
            : null;
          
          return (
            <div key={`${file.name}-${index}`} className="relative group">
              <div className="h-[100px] w-[100px] rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                {filePreview ? (
                  <Image 
                    src={filePreview} 
                    alt={file.name} 
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                    onLoad={() => {
                      // 加载后释放URL避免内存泄漏
                      URL.revokeObjectURL(filePreview);
                    }}
                    unoptimized // 由于是blob URL，需要禁用优化
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity p-1 z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-xs truncate mt-1" title={file.name}>
                {file.name.length > 12 ? `${file.name.substring(0, 9)}...` : file.name}
              </div>
            </div>
          );
        })}
        
        {/* 添加更多图片的按钮 */}
        <div 
          onClick={onAddMoreFiles}
          className="h-[100px] w-[100px] rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs text-gray-500 mt-1">{t('add_more')}</span>
        </div>
      </div>
    </div>
  );
}

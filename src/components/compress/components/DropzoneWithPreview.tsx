import { useRef, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";

interface DropzoneWithPreviewProps {
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAllFiles: () => void;
}

export function DropzoneWithPreview({ 
  onFilesSelected, 
  files, 
  onRemoveFile,
  onClearAllFiles 
}: DropzoneWithPreviewProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 处理点击上传
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // 拖拽区域的渲染函数 - 移除了拖拽相关事件，因为现在在容器级别处理
  const renderDropzone = () => {
    return (
      <div 
        className={`flex flex-col items-center justify-center border-2 border-dashed ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'} rounded-lg p-6 cursor-pointer hover:border-primary transition-colors min-h-[250px] w-full`}
        onClick={handleClickUpload}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">{t('drag_drop_or_click')}</p>
          {files.length > 0 && (
            <p className="mt-2 text-sm text-primary">
              {files.length} {files.length === 1 ? t('file_selected') : t('files_selected')}
            </p>
          )}
        </div>
      </div>
    );
  };

  // 图片预览功能已直接写在主渲染函数中
  
  // 创建一个事件处理函数，处理整个容器的拖拽事件
  const handleContainerDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragover' || e.type === 'dragenter') {
      setIsDragging(true);
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setIsDragging(false);
    }
    
    // 如果是放下文件的事件，处理文件上传
    if (e.type === 'drop' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // 只处理图片文件
      const imageFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/'));
      onFilesSelected(imageFiles);
    }
  };
  
  return (
    <div
      // 为整个容器添加拖拽事件处理，无论是否有文件都可以拖拽上传
      onDragOver={handleContainerDragEvents}
      onDragEnter={handleContainerDragEvents}
      onDragLeave={handleContainerDragEvents}
      onDrop={handleContainerDragEvents}
      className={`${isDragging ? 'border-2 border-dashed border-primary bg-primary/5 rounded-lg' : ''} relative`}
    >
      {/* 固定在顶部的控制按钮 */}
      {files.length > 0 && (
        <div className="sticky top-0 z-10 flex justify-between items-center bg-background/95 backdrop-blur-sm p-3 border-b rounded-t-md shadow-sm">
          <Label className="text-base font-medium">{t('uploaded_files')} ({files.length})</Label>
          <div className="flex space-x-2">
            <Button 
              onClick={handleClickUpload}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('add_more')}
            </Button>
            <Button 
              onClick={onClearAllFiles}
              variant="destructive"
              size="sm"
            >
              {t('clear_all')}
            </Button>
          </div>
        </div>
      )}
      
      {/* 文件拖拽区域和预览区域 */}
      {files.length === 0 ? (
        renderDropzone()
      ) : (
        <div className="border rounded-md mt-0 flex flex-col min-h-[250px] relative">
          {/* 拖拽提示 - 半透明覆盖在预览区域上 */}
          <div className={`absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] pointer-events-none transition-opacity duration-200 z-20 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-background/90 p-4 rounded-lg shadow-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 font-medium">{t('drag_drop_or_click')}</p>
            </div>
          </div>
          
          {/* 静态拖拽提示区域 - 不拖拽时也显示 - 始终保持在顶部 */}
          <div className="p-3 text-center text-sm text-muted-foreground border-b bg-background/50 sticky top-0 z-10">
            <p>✨ {t('drag_drop_or_click')} ✨</p>
          </div>
          
          {/* 可滚动的图片列表区域 */}
          <div className="overflow-y-auto max-h-[250px]">
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 p-3 min-h-[220px]">
              {files.map((file, index) => {
                // 创建文件预览URL
                const filePreview = file.type.startsWith('image/') 
                  ? URL.createObjectURL(file)
                  : null;
                
                return (
                  <div key={`${file.name}-${index}`} className="relative group">
                    <div className="h-[100px] w-[100px] rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                      {filePreview ? (
                        <img 
                          src={filePreview} 
                          alt={file.name} 
                          className="object-cover w-full h-full"
                          onLoad={() => {
                            // 加载后释放URL避免内存泄漏
                            URL.revokeObjectURL(filePreview);
                          }}
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
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="text-xs truncate mt-1" title={file.name}>
                      {file.name.length > 12 ? `${file.name.substring(0, 9)}...` : file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          // 只有当有文件被选择时才更新状态
          if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            onFilesSelected(newFiles);
            
            // 清空input的value，确保可以再次上传相同的文件
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}

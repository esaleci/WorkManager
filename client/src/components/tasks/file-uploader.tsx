import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, File } from "lucide-react";

interface FileUploaderProps {
  taskId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FileUploader({ taskId, onSuccess, onCancel }: FileUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async () => {
      if (!file) return null;
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);
      
      // In a real app, you would upload the file to a server
      // For this demo, we'll just save a reference
      setTimeout(() => clearInterval(progressInterval), 2000);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            apiRequest('POST', `/api/tasks/${taskId}/attachments`, {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              filePath: `/uploads/${file.name}`,
              uploadedById: 1, // For demo, using the first user
            })
          );
        }, 2500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      toast({
        title: "File Uploaded",
        description: "Your file has been attached to the task.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload the file
  const uploadFile = () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    uploadFileMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
      />
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50 transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-neutral-300"
          }`}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 mx-auto text-neutral-400 mb-2" />
          <p className="text-neutral-600 font-medium">
            Drag and drop a file here, or click to select
          </p>
          <p className="text-neutral-400 text-sm mt-1">
            Maximum file size: 10MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center p-3 border rounded-md bg-neutral-50">
            <div className="mr-3 p-2 bg-neutral-100 rounded">
              <File className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFile(null)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploadFileMutation.isPending && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-neutral-500 text-right">
                {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={uploadFileMutation.isPending}>
          Cancel
        </Button>
        <Button 
          onClick={uploadFile} 
          disabled={!file || uploadFileMutation.isPending}
        >
          {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    </div>
  );
}

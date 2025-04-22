import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  Flag,
  Paperclip,
  AtSign,
  SmilePlus,
  UserPlus,
  Plus,
  Download,
  Play,
  Mic,
  X,
} from "lucide-react";

import FileUploader from "./file-uploader";
import VoiceRecorder from "./voice-recorder";
import { TaskStatusEnum, TaskPriorityEnum } from "@shared/schema";

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: number | null;
  onClose: () => void;
}

export function TaskDetailModal({ isOpen, taskId, onClose }: TaskDetailModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setComment("");
      setShowVoiceRecorder(false);
      setShowFileUploader(false);
    }
  }, [isOpen]);

  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['/api/tasks', taskId],
    enabled: isOpen && taskId !== null,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!taskId) return null;
      return apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!taskId) return null;
      return apiRequest('POST', `/api/tasks/${taskId}/comments`, {
        content: comment,
        userId: 1, // For demo, using the first user
      });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle status change
  const handleStatusChange = (status: string) => {
    updateTaskMutation.mutate({ status });
  };

  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    updateTaskMutation.mutate({ priority });
  };

  // Add a comment
  const handleAddComment = () => {
    if (!comment.trim()) return;
    addCommentMutation.mutate();
  };

  // Format time for display
  const formatTaskTime = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-lg text-neutral-800">Task Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6 p-4">
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-neutral-800 mb-2">{task?.title}</h1>
                  <div className="flex items-center text-sm text-neutral-600">
                    {task?.startDate && task?.endDate ? (
                      <span className="mr-4">
                        <Calendar className="w-4 h-4 inline-block mr-1" /> 
                        {formatDate(task.startDate)} at {formatTaskTime(task.startDate)} - {formatTaskTime(task.endDate)}
                      </span>
                    ) : (
                      <span className="mr-4">No date scheduled</span>
                    )}
                    <span>
                      <User className="w-4 h-4 inline-block mr-1" /> 
                      {task?.createdBy?.fullName || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Description</h3>
                  <p className="text-neutral-700">{task?.description || "No description provided."}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Attachments</h3>
                  {!task?.attachments?.length && !showFileUploader ? (
                    <div className="text-neutral-500 text-sm mb-2">No attachments yet.</div>
                  ) : (
                    <div className="space-y-2 mb-2">
                      {task?.attachments?.map((attachment) => (
                        <div 
                          key={attachment.id} 
                          className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <Paperclip className="text-primary-500 h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800">{attachment.fileName}</p>
                            <p className="text-xs text-neutral-500">
                              {attachment.fileType} • {Math.round(attachment.fileSize / 1024)} KB
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4 text-neutral-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showFileUploader ? (
                    <div className="mb-4">
                      <FileUploader 
                        taskId={taskId!} 
                        onSuccess={() => {
                          setShowFileUploader(false);
                          queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
                        }}
                        onCancel={() => setShowFileUploader(false)}
                      />
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary-500" 
                      onClick={() => setShowFileUploader(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Attachment
                    </Button>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Voice Notes</h3>
                  {!task?.voiceNotes?.length && !showVoiceRecorder ? (
                    <div className="text-neutral-500 text-sm mb-2">No voice notes yet.</div>
                  ) : (
                    <div className="space-y-2 mb-2">
                      {task?.voiceNotes?.map((voiceNote) => (
                        <div 
                          key={voiceNote.id} 
                          className="flex items-center p-2 border border-neutral-200 rounded-md hover:bg-neutral-50"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center mr-3">
                            <Mic className="text-purple-500 h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-800">{voiceNote.title}</p>
                            <p className="text-xs text-neutral-500">
                              {Math.floor(voiceNote.duration / 60)}:{(voiceNote.duration % 60).toString().padStart(2, '0')} • 
                              {new Date(voiceNote.recordedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4 text-neutral-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showVoiceRecorder ? (
                    <div className="mb-4">
                      <VoiceRecorder 
                        taskId={taskId!} 
                        onSuccess={() => {
                          setShowVoiceRecorder(false);
                          queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
                        }}
                        onCancel={() => setShowVoiceRecorder(false)}
                      />
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary-500" 
                      onClick={() => setShowVoiceRecorder(true)}
                    >
                      <Mic className="h-4 w-4 mr-1" /> Record Voice Note
                    </Button>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Comments</h3>
                  <div className="space-y-4 mb-4">
                    {task?.comments?.length === 0 ? (
                      <div className="text-neutral-500 text-sm">No comments yet.</div>
                    ) : (
                      task?.comments?.map((comment) => (
                        <div key={comment.id} className="flex">
                          <Avatar className="w-8 h-8 mr-3">
                            <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
                            <AvatarFallback>
                              {comment.user.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-neutral-50 p-3 rounded-lg">
                              <div className="flex items-baseline justify-between mb-1">
                                <h4 className="text-sm font-medium text-neutral-800">{comment.user.fullName}</h4>
                                <span className="text-xs text-neutral-500">
                                  {new Date(comment.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-700">{comment.content}</p>
                            </div>
                            <div className="flex items-center mt-1 ml-1">
                              <Button variant="ghost" size="sm" className="text-xs text-neutral-500 hover:text-neutral-700 h-auto p-1">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex">
                    <Avatar className="w-8 h-8 mr-3">
                      <AvatarImage src={task?.createdBy?.avatarUrl} />
                      <AvatarFallback>
                        {task?.createdBy?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        className="w-full p-3 placeholder-neutral-500 text-sm"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="text-neutral-500 h-9 w-9">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-neutral-500 h-9 w-9">
                            <SmilePlus className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-neutral-500 h-9 w-9">
                            <AtSign className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          onClick={handleAddComment} 
                          disabled={!comment.trim() || addCommentMutation.isPending}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Status</h3>
                  <Select defaultValue={task?.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatusEnum.TODO}>To Do</SelectItem>
                      <SelectItem value={TaskStatusEnum.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={TaskStatusEnum.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={TaskStatusEnum.ON_HOLD}>On Hold</SelectItem>
                      <SelectItem value={TaskStatusEnum.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Priority</h3>
                  <div className="flex items-center space-x-2">
                    <Button 
                      className={`px-3 py-1.5 flex-1 flex items-center justify-center ${
                        task?.priority === TaskPriorityEnum.HIGH 
                        ? 'bg-danger-500 text-white' 
                        : 'bg-neutral-200 text-neutral-700'
                      }`}
                      onClick={() => handlePriorityChange(TaskPriorityEnum.HIGH)}
                    >
                      <Flag className="mr-1 h-3 w-3" /> High
                    </Button>
                    <Button 
                      className={`px-3 py-1.5 flex-1 flex items-center justify-center ${
                        task?.priority === TaskPriorityEnum.MEDIUM 
                        ? 'bg-warning-500 text-white' 
                        : 'bg-neutral-200 text-neutral-700'
                      }`}
                      onClick={() => handlePriorityChange(TaskPriorityEnum.MEDIUM)}
                    >
                      <Flag className="mr-1 h-3 w-3" /> Medium
                    </Button>
                    <Button 
                      className={`px-3 py-1.5 flex-1 flex items-center justify-center ${
                        task?.priority === TaskPriorityEnum.LOW 
                        ? 'bg-success-500 text-white' 
                        : 'bg-neutral-200 text-neutral-700'
                      }`}
                      onClick={() => handlePriorityChange(TaskPriorityEnum.LOW)}
                    >
                      <Flag className="mr-1 h-3 w-3" /> Low
                    </Button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Assignees</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {task?.assignees?.map((assignee) => (
                      <div key={assignee.id} className="flex items-center bg-neutral-100 rounded-full px-2 py-1">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarImage src={assignee.avatarUrl} alt={assignee.fullName} />
                          <AvatarFallback>
                            {assignee.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-neutral-700">{assignee.fullName}</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 text-neutral-400 hover:text-neutral-600">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-500">
                    <UserPlus className="h-4 w-4 mr-1" /> Add People
                  </Button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Client</Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Website</Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Design</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary-500">
                    <Plus className="h-4 w-4 mr-1" /> Add Tag
                  </Button>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 mb-2">Budget</h3>
                  <div className="bg-neutral-100 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Total</span>
                      <span className="text-sm font-medium text-neutral-800">
                        ${task?.totalBudget?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-neutral-600">Paid</span>
                      <span className="text-sm font-medium text-success-500">
                        ${task?.paidAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-neutral-600">Remaining</span>
                      <span className="text-sm font-medium text-primary-500">
                        ${((task?.totalBudget || 0) - (task?.paidAmount || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 border-t border-neutral-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Import these components dynamically to avoid circular dependencies
import { Calendar, User } from "lucide-react";

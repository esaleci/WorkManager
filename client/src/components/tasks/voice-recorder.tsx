import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mic, Square, Play, Pause } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VoiceRecorderProps {
  taskId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ taskId, onSuccess, onCancel }: VoiceRecorderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [title, setTitle] = useState("Voice Note");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear up resources when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [isRecording, audioURL]);

  // Format seconds into MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // When recording stops
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Stop the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start the timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        // Resume the timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      } else {
        // Pause recording
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        // Pause the timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Add voice note mutation
  const addVoiceNoteMutation = useMutation({
    mutationFn: async () => {
      // In a real app, you would upload the audio blob to a server
      // For this demo, we'll just save a reference
      return apiRequest('POST', `/api/tasks/${taskId}/voice-notes`, {
        title,
        duration: recordingTime,
        filePath: `/uploads/voice_note_${Date.now()}.webm`,
        recordedById: 1, // For demo, using the first user
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      toast({
        title: "Voice Note Added",
        description: "Your voice note has been added to the task.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add voice note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save the voice note
  const saveVoiceNote = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your voice note.",
        variant: "destructive",
      });
      return;
    }
    
    addVoiceNoteMutation.mutate();
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-medium">Record Voice Note</h3>
      
      <div className="flex items-center justify-between">
        <div className="text-lg font-mono">{formatTime(recordingTime)}</div>
        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={pauseRecording}
                className="h-10 w-10 rounded-full"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="h-10 w-10 rounded-full"
              >
                <Square className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button
              variant={audioURL ? "outline" : "destructive"}
              size="icon"
              onClick={startRecording}
              className="h-10 w-10 rounded-full"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {isRecording && (
        <Progress value={(recordingTime % 60) * (100 / 60)} className="h-1" />
      )}
      
      {audioURL && (
        <div className="space-y-4">
          <audio src={audioURL} controls className="w-full" />
          
          <div className="space-y-2">
            <Input
              placeholder="Voice Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={saveVoiceNote}
          disabled={!audioURL || addVoiceNoteMutation.isPending}
        >
          {addVoiceNoteMutation.isPending ? "Saving..." : "Save Voice Note"}
        </Button>
      </div>
    </div>
  );
}

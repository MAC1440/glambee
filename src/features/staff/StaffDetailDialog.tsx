
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { StaffMember, Feedback } from "./Staff";
import { user } from "@/lib/placeholder-data"; // Mock logged-in user

type StaffDetailDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  staffMember: StaffMember;
};

export function StaffDetailDialog({
  isOpen,
  onOpenChange,
  staffMember,
}: StaffDetailDialogProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newFeedbackNote, setNewFeedbackNote] = useState('');
  const { toast } = useToast();

  const handleAddFeedback = () => {
    if (newFeedbackNote.trim() === '') {
        toast({ title: 'Note is empty', description: 'Please write a note before saving.', variant: 'destructive'});
        return;
    }
    const newFeedback: Feedback = {
        id: `feedback_${Date.now()}`,
        date: new Date().toISOString(),
        author: user.name, // In a real app, this would be the logged in user
        note: newFeedbackNote,
    };
    setFeedback(prev => [newFeedback, ...prev]);
    setNewFeedbackNote('');
    toast({ title: 'Feedback Added', description: 'The new note has been saved for this staff member.'});
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Details for {staffMember.name}</DialogTitle>
          <DialogDescription>
            Training notes and feedback for this team member.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
                <Label htmlFor="feedback-note">Add New Note</Label>
                <Textarea 
                    id="feedback-note"
                    placeholder="Type training note or feedback here..."
                    value={newFeedbackNote}
                    onChange={(e) => setNewFeedbackNote(e.target.value)}
                />
                    <Button onClick={handleAddFeedback}>Save Note</Button>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium">History</h4>
                {feedback.length > 0 ? (
                    feedback.map(item => (
                        <div key={item.id} className="p-4 rounded-lg border bg-muted/50">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">{item.author}</span> on <span className="font-semibold">{format(parseISO(item.date), "MMMM d, yyyy 'at' p")}</span>
                            </p>
                            <p className="mt-2">{item.note}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No feedback or training records yet for {staffMember.name}.</p>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

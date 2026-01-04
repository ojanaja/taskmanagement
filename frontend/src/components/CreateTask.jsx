import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createTask } from '../store/taskSlice';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileIcon } from "lucide-react";
import api from '@/lib/api';
import UserSelect from './UserSelect';
import { toast } from "sonner";

export function CreateTask() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch(createTask({
                title,
                description,
                status: 'PENDING',
                priority,
                assignedUserId: assignedUserId || null,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                attachments: attachments
            })).unwrap();

            toast.success("Task created successfully");

            setOpen(false);
            setTitle('');
            setDescription('');
            setDueDate('');
            setPriority('MEDIUM');
            setAssignedUserId('');
            setAttachments([]);
        } catch (error) {
            console.error("Failed to create task", error);
            toast.error("Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setErrorMessage("File size exceeds the 10MB limit. Please upload a smaller file.");
            setShowErrorDialog(true);
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const response = await api.post("/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setAttachments(prev => [...prev, response.data.fileUrl]);
        } catch (error) {
            console.error("File upload failed", error);
            setErrorMessage("Failed to upload file. Please try again.");
            setShowErrorDialog(true);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
            setTitle('');
            setDescription('');
            setDueDate('');
            setPriority('MEDIUM');
            setAssignedUserId('');
            setAttachments([]);
            setShowErrorDialog(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="default">Create Task</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to your list. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dueDate" className="text-right">
                                    Deadline
                                </Label>
                                <Input
                                    id="dueDate"
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="priority" className="text-right">
                                    Priority
                                </Label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="assignee" className="text-right">
                                    Assign To
                                </Label>
                                <div className="col-span-3">
                                    <UserSelect
                                        value={assignedUserId}
                                        onChange={setAssignedUserId}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="attachments" className="text-right pt-2">
                                    Attachments
                                </Label>
                                <div className="col-span-3 space-y-2">
                                    <Input
                                        id="attachments"
                                        type="file"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {attachments.map((url, idx) => (
                                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center bg-blue-50 px-2 py-1 rounded">
                                                    <FileIcon className="w-3 h-3 mr-1" /> File {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading || uploading}>{loading ? 'Saving...' : 'Save Task'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Upload Error</DialogTitle>
                        <DialogDescription>
                            {errorMessage}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowErrorDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

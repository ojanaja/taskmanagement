import { useEffect, useState } from "react";
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Paperclip, FileIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { CreateTask } from "./CreateTask";

const COLUMNS = [
    { id: "PENDING", title: "Pending", color: "bg-yellow-100" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100" },
    { id: "COMPLETED", title: "Completed", color: "bg-green-100" },
];

export function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    const fetchTasks = async () => {
        try {
            const response = await api.get("/tasks");
            setTasks(response.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = tasks.find((t) => t.id === active.id);
        const overId = over.id; // This could be a task ID or a container ID

        // If dropped on a container (column)
        let newStatus = overId;

        // If dropped on another task, find that task's status
        if (!COLUMNS.find(c => c.id === overId)) {
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            } else {
                // Should not happen if overId is valid
                setActiveId(null);
                return;
            }
        }

        if (activeTask.status !== newStatus) {
            // Optimistic Update
            const updatedTasks = tasks.map(t =>
                t.id === activeTask.id ? { ...t, status: newStatus } : t
            );
            setTasks(updatedTasks);

            // API Call
            try {
                await api.put(`/tasks/${activeTask.id}`, { ...activeTask, status: newStatus });
            } catch (error) {
                console.error("Failed to update task status", error);
                fetchTasks(); // Revert on failure
            }
        }

        setActiveId(null);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`)
                fetchTasks() // Refresh to remove from list
            } catch (error) {
                console.error("Failed to delete task", error)
            }
        }
    }

    const handleUpdateTask = async (id, updates) => {
        try {
            const task = tasks.find(t => t.id === id);
            const updatedTask = { ...task, ...updates };

            // Optimistic update
            setTasks(tasks.map(t => t.id === id ? updatedTask : t));

            await api.put(`/tasks/${id}`, updatedTask);
        } catch (error) {
            console.error("Failed to update task", error);
            fetchTasks(); // Revert
        }
    };

    const tasksByStatus = {
        PENDING: tasks.filter((t) => t.status === "PENDING"),
        IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
        COMPLETED: tasks.filter((t) => t.status === "COMPLETED"),
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
                <CreateTask onTaskCreated={fetchTasks} />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-start items-start">
                    {COLUMNS.map((col) => (
                        <DroppableColumn
                            key={col.id}
                            col={col}
                            tasks={tasksByStatus[col.id]}
                            handleDelete={handleDelete}
                            handleUpdateTask={handleUpdateTask}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <TaskCard task={tasks.find((t) => t.id === activeId)} isOverlay />
                    ) : null}
                </DragOverlay>

            </DndContext>
        </div>
    );
}

function TaskCard({ task, onDelete, isOverlay, handleUpdateTask }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);
    const [editDueDate, setEditDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 16) : ""); // Format for datetime-local
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleSave = () => {
        handleUpdateTask(task.id, {
            title: editTitle,
            description: editDescription,
            dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(task.title);
        setEditDescription(task.description);
        setEditDueDate(task.dueDate ? task.dueDate.slice(0, 16) : "");
        setIsEditing(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const response = await api.post("/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const newAttachment = response.data.fileUrl; // or response.data.fileName
            const currentAttachments = task.attachments || [];

            // Immediately update
            handleUpdateTask(task.id, {
                attachments: [...currentAttachments, newAttachment]
            });
        } catch (error) {
            console.error("File upload failed", error);
            alert("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleFileClick = (e, url) => {
        e.stopPropagation();
        e.preventDefault();
        setPreviewUrl(url);
    };

    if (isOverlay) {
        return (
            <Card className="shadow-xl cursor-grabbing w-full">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                    {task.description}
                </CardContent>
            </Card>
        )
    }

    if (isEditing) {
        return (
            <Card
                ref={setNodeRef}
                style={style}
                className={`relative z-50 bg-white shadow-lg`}
            >
                <CardHeader className="p-4 pb-2 space-y-2">
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-medium"
                        placeholder="Task Title"
                    />
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                    <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="text-sm min-h-[80px]"
                        placeholder="Description"
                    />

                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium">Deadline</span>
                        <Input
                            type="datetime-local"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-medium">Attachments</span>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {task.attachments?.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center bg-blue-50 px-2 py-1 rounded">
                                    <FileIcon className="w-3 h-3 mr-1" /> File {idx + 1}
                                </a>
                            ))}
                        </div>
                        <Input
                            type="file"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end gap-2 bg-gray-50/50">
                    <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                    <Button size="sm" onClick={handleSave}>Save</Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <>
            <Card
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`group cursor-grab touch-none hover:shadow-md transition-shadow bg-white ${isDragging ? 'z-50' : ''}`}
            >
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base font-medium flex justify-between items-start gap-2">
                        <span>{task.title}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                // Prevent drag
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        </Button>
                    </CardTitle>
                    <div className="text-xs text-gray-400 flex flex-col gap-1">
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        {task.dueDate && (
                            <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() ? 'text-red-500 font-bold' : 'text-orange-500'}`}>
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                    <p className="text-sm text-gray-600 line-clamp-3">{task.description}</p>

                    {task.attachments && task.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
                            {task.attachments.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => handleFileClick(e, url)}
                                    // Make it behave like a link but prevent default
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700"
                                >
                                    <Paperclip className="w-3 h-3 mr-1" />
                                    File {idx + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end border-t bg-gray-50/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                    >
                        Delete
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
                <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>File Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title="File Preview"
                            />
                        )}
                    </div>
                    <div className="flex justify-end pt-2">
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">Open in New Tab</Button>
                        </a>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function DroppableColumn({ col, tasks, handleDelete, handleUpdateTask }) {
    const { setNodeRef } = useDroppable({
        id: col.id,
    });

    return (
        <div ref={setNodeRef} className="bg-gray-50 p-4 rounded-lg min-h-[500px] flex flex-col">
            <div className={`p-3 rounded-t-lg mb-4 font-semibold ${col.color} flex justify-between items-center`}>
                <span>{col.title}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded text-sm">
                    {tasks?.length || 0}
                </span>
            </div>

            <SortableContext
                id={col.id}
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3 flex-1">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={handleDelete}
                            handleUpdateTask={handleUpdateTask}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

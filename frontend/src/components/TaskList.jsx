import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, updateTask, deleteTask, updateTaskStatusOptimistic } from "../store/taskSlice";
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
import { Calendar, Paperclip, FileIcon, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { CreateTask } from "./CreateTask";

const COLUMNS = [
    { id: 'PENDING', title: 'To Do', color: 'bg-blue-50 text-blue-700' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-purple-50 text-purple-700' },
    { id: 'COMPLETED', title: 'Done', color: 'bg-green-50 text-green-700' }
];

export function TaskList() {
    const dispatch = useDispatch();
    const { items: tasks, status } = useSelector((state) => state.tasks);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchTasks());
        }
    }, [status, dispatch]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
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
            dispatch(updateTaskStatusOptimistic({ id: activeTask.id, status: newStatus }));

            // API Call (Dispatched Action)
            // Ensure we send the full object because the backend PUT /tasks/{id} validation requires 'title' and 'description'
            dispatch(updateTask({
                id: activeTask.id,
                updates: {
                    ...activeTask,
                    status: newStatus,
                    // Ensure dates are strings if needed, though Redux usually has them as strings from API
                    dueDate: activeTask.dueDate
                }
            }));
        }

        setActiveId(null);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            dispatch(deleteTask(id));
        }
    }

    const handleUpdateTask = (id, updates) => {
        dispatch(updateTask({ id, updates }));
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
                <CreateTask />
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

    // Mock Priority for visualization
    const priority = task.title.length % 3 === 0 ? "High" : task.title.length % 2 === 0 ? "Medium" : "Low";
    const priorityColor = priority === "High" ? "bg-red-100 text-red-600" : priority === "Medium" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600";
    const priorityLabel = priority === "High" ? "Important" : priority === "Medium" ? "Review" : "Low Priority";

    if (isOverlay) {
        return (
            <div className="bg-white p-5 rounded-2xl shadow-xl cursor-grabbing w-full border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${priorityColor}`}>{priorityLabel}</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-sm">{task.title}</h4>
                <p className="text-gray-500 text-xs mb-4">{task.description}</p>
            </div>
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
                                <button key={idx} onClick={(e) => handleFileClick(e, url)} className="text-xs text-blue-500 hover:underline flex items-center bg-blue-50 px-2 py-1 rounded">
                                    <FileIcon className="w-3 h-3 mr-1" /> File {idx + 1}
                                </button>
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
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-grab group ${isDragging ? 'z-50 opacity-50' : ''}`}
                onDoubleClick={() => setIsEditing(true)}
            >
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${priorityColor}`}>
                        {priorityLabel}
                    </span>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                    </button>
                </div>

                <h4 className="font-bold text-gray-800 mb-2 text-sm leading-snug">{task.title}</h4>
                <p className="text-gray-500 text-xs mb-4 line-clamp-2">{task.description}</p>

                {task.attachments && task.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {task.attachments.slice(0, 3).map((url, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100" onClick={(e) => handleFileClick(e, url)} onPointerDown={(e) => e.stopPropagation()}>
                                <FileIcon className="w-4 h-4" />
                            </div>
                        ))}
                        {task.attachments.length > 3 && (
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 text-xs font-medium">
                                +{task.attachments.length - 3}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-full border-2 border-white" src={`https://ui-avatars.com/api/?name=User+One&background=random`} alt="User" />
                        <img className="w-6 h-6 rounded-full border-2 border-white" src={`https://ui-avatars.com/api/?name=User+Two&background=random`} alt="User" />
                    </div>

                    <div className="flex items-center gap-3 text-gray-400">
                        <div className="flex items-center gap-1 text-xs">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{task.id % 20 + 2}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{task.attachments ? task.attachments.length : 0}</span>
                        </div>
                    </div>
                </div>
            </div>

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

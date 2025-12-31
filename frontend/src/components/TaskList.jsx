import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { CreateTask } from "./CreateTask"

export function TaskList() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks')
            setTasks(response.data)
        } catch (error) {
            console.error("Failed to fetch tasks", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            try {
                await api.delete(`/tasks/${id}`)
                fetchTasks()
            } catch (error) {
                console.error("Failed to delete task", error)
            }
        }
    }

    // Simple status toggle
    const handleStatusToggle = async (task) => {
        const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        try {
            await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task", error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                <CreateTask onTaskCreated={fetchTasks} />
            </div>

            {loading ? (
                <div>Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="text-center text-muted-foreground">No tasks found. Create one to get started.</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tasks.map((task) => (
                        <Card key={task.id} className={task.status === 'COMPLETED' ? 'opacity-60' : ''}>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{task.title}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {task.status}
                                    </span>
                                </CardTitle>
                                <CardDescription>Created at {new Date(task.createdAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{task.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" size="sm" onClick={() => handleStatusToggle(task)}>
                                    {task.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Completed'}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(task.id)}>
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

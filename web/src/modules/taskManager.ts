import Task from "@/model/Task";
import { initialTasks } from "@/utils/TaskList";

let tasks: Task[] = [...initialTasks];

export function initializeTasks() {
    if (tasks.length === 0) {
        tasks.push(new Task(1, "Initial Setup", "This is the initial task", "Intern", 1, false));
    }
}

export function getActiveTasks(): Task[] {
    const firstIncompleteGroup = Math.min(
        ...tasks.filter(task => !task.completed).map(task => task.group)
    );
    return tasks.filter(task => !task.completed && task.group === firstIncompleteGroup);
}

export function getCompletedTasks(): Task[] {
    return tasks.filter(task => task.completed);
}

export function getAllTasks(): Task[] {
    return tasks;
}

export function completeTask(identifier: number | string): void {
    let task: Task | undefined;

    if (typeof identifier === 'number') {
        task = tasks.find(task => task.id === identifier);
    } else if (typeof identifier === 'string') {
        task = tasks.find(task => task.title === identifier);
    }

    if (task) {
        task.completed = true;

        const nextTaskInGroup = tasks.find(t => t.group === task.group && !t.completed);
        if (!nextTaskInGroup) {

            const nextGroupTasks = tasks.filter(t => t.group === task.group + 1 && !t.completed);
            if (nextGroupTasks.length > 0) {
                nextGroupTasks[0].completed = false;
            }
        }
    }
}


export function createTask(title: string, description: string, persona: string, group: number): void {
    const newTask = new Task(tasks.length + 1, title, description, persona, group);
    tasks.push(newTask);
}

export function updateTask(taskId: number, updatedTask: Partial<Omit<Task, 'id'>>): void {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
    }
}

export function deleteTask(taskId: number): void {
    tasks = tasks.filter(task => task.id !== taskId);
}

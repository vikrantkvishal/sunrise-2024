import type { NextApiRequest, NextApiResponse } from "next";
import {
  initializeTasks,
  getActiveTasks,
  getCompletedTasks,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask
} from "@/modules/taskManager";
import Task from "@/model/Task";

type Data = Task | Task[] | { message: string };

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  initializeTasks();

  try {
    switch (req.method) {
      case "GET": {
        const { type } = req.query;
        if (type === "active") {
          res.status(200).json(getActiveTasks());
        } else if (type === "completed") {
          res.status(200).json(getCompletedTasks());
        } else {
          res.status(200).json(getAllTasks());
        }
        break;
      }

      case "POST": {
        const { title, description, persona, group } = req.body;
        createTask(title, description, persona, group);
        res.status(201).json({ message: "Task created successfully!" });
        break;
      }

      case "PATCH": {
        const { id, completed } = req.body;
        completeTask(id);
        res.status(200).json({ message: "Task completed!" });
        break;
      }

      case "PUT": {
        const updatedTask = req.body;
        updateTask(updatedTask.id, updatedTask);
        res.status(200).json({ message: "Task updated successfully!" });
        break;
      }

      case "DELETE": {
        const { id } = req.query;
        deleteTask(Number(id));
        res.status(200).json({ message: "Task deleted successfully!" });
        break;
      }

      default:
        res.setHeader("Allow", ["GET", "POST", "PATCH", "PUT", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

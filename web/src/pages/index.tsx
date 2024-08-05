import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Container,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

type Task = {
  id: number;
  title: string;
  description: string;
  persona: string;
  group: number;
  completed: boolean;
};

export default function Home() {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPersona, setCreatePersona] = useState("");
  const [createGroup, setCreateGroup] = useState<string>("");

  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updatePersona, setUpdatePersona] = useState("");
  const [updateGroup, setUpdateGroup] = useState<string>("");

  const [updatingTask, setUpdatingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchTasks("active");
    fetchTasks("completed");
  }, []);

  const fetchTasks = async (type: string) => {
    const res = await fetch(`/api/hello?type=${type}`);
    const tasks = await res.json();
    if (type === "active") {
      setActiveTasks(tasks);
    } else {
      setCompletedTasks(tasks);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/hello", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: createTitle,
        description: createDescription,
        persona: createPersona,
        group: Number(createGroup),
      }),
    });
    if (res.ok) {
      fetchTasks("active");
      setCreateTitle("");
      setCreateDescription("");
      setCreatePersona("");
      setCreateGroup("");
      setShowCreateForm(false);
      toast.success("Task created successfully!");
    } else {
      toast.error("Failed to create task.");
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    const res = await fetch("/api/hello", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: taskId, completed: true }),
    });
    if (res.ok) {
      fetchTasks("active");
      fetchTasks("completed");
      toast.success("Task completed successfully!");
    } else {
      toast.error("Failed to complete task.");
    }
  };

  const handleUpdateTask = (task: Task) => {
    setUpdatingTask(task);
    setUpdateTitle(task.title);
    setUpdateDescription(task.description);
    setUpdatePersona(task.persona);
    setUpdateGroup(String(task.group));
  };

  const handleSubmitUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updatingTask) {
      const res = await fetch("/api/hello", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updatingTask.id,
          title: updateTitle,
          description: updateDescription,
          persona: updatePersona,
          group: Number(updateGroup),
        }),
      });
      if (res.ok) {
        fetchTasks("active");
        handleCancelUpdate();
        toast.success("Task updated successfully!");
      } else {
        toast.error("Failed to update task.");
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await fetch(`/api/hello?id=${taskId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchTasks("active");
      fetchTasks("completed");
      toast.success("Task deleted successfully!");
    } else {
      toast.error("Failed to delete task.");
    }
  };

  const handleCancelUpdate = () => {
    setUpdatingTask(null);
    setUpdateTitle("");
    setUpdateDescription("");
    setUpdatePersona("");
    setUpdateGroup("");
  };

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: "#f5f5f5" }}>
      <ToastContainer />
      <Box sx={{ backgroundColor: "#fae6ff", padding: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h2" align="center" color="primary" gutterBottom>
          Taskboard System
        </Typography>

        <Box mb={4}>
          <Typography variant="h4" gutterBottom color="#b380ff">
            Active Tasks
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {activeTasks.map((task) => (
              <Card key={task.id} sx={{ width: "30%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h5" component="div" color="primary">
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {task.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {task.persona}
                  </Typography>
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Complete
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleUpdateTask(task)}
                    >
                      Update
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" gutterBottom color="#009900">
            Completed Tasks
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {completedTasks.map((task) => (
              <Card key={task.id} sx={{ width: "30%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h5" component="div" color="primary">
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {task.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {task.persona}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          color={showCreateForm ? "error" : "primary"}
          onClick={toggleCreateForm}
          sx={{ mb: 2 }}
        >
          {showCreateForm ? "Cancel" : "Create Task"}
        </Button>

        <Dialog open={showCreateForm} onClose={toggleCreateForm}>
          <DialogTitle>Create Task</DialogTitle>
          <DialogContent>
            <form onSubmit={handleCreateTask}>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Persona"
                fullWidth
                variant="outlined"
                value={createPersona}
                onChange={(e) => setCreatePersona(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Group"
                fullWidth
                variant="outlined"
                type="number"
                value={createGroup}
                onChange={(e) => setCreateGroup(e.target.value)}
                required
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleCreateForm}>Cancel</Button>
            <Button onClick={handleCreateTask} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(updatingTask)} onClose={handleCancelUpdate}>
          <DialogTitle>Update Task</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmitUpdateTask}>
              <TextField
                autoFocus
                margin="dense"
                label="Title"
                fullWidth
                variant="outlined"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Persona"
                fullWidth
                variant="outlined"
                value={updatePersona}
                onChange={(e) => setUpdatePersona(e.target.value)}
                required
              />
              <TextField
                margin="dense"
                label="Group"
                fullWidth
                variant="outlined"
                type="number"
                value={updateGroup}
                onChange={(e) => setUpdateGroup(e.target.value)}
                required
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelUpdate}>Cancel</Button>
            <Button onClick={handleSubmitUpdateTask} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

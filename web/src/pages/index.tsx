import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Badge } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Task {
  id: number;
  title: string;
  description: string;
  persona: string;
  group: number;
  completed: boolean;
}

export default function Home() {
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [toDoTasks, setToDoTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createPersona, setCreatePersona] = useState('');
  const [createGroup, setCreateGroup] = useState<number | ''>('');
  const [updatingTask, setUpdatingTask] = useState<Task | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updatePersona, setUpdatePersona] = useState('');
  const [updateGroup, setUpdateGroup] = useState<number | ''>('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (status?: string) => {
    try {
      const res = await fetch(`/api/hello`);
      if (!res.ok) throw new Error('Network response was not ok');
      const tasks: Task[] = await res.json();
      const firstIncompleteGroup = Math.min(...tasks.filter(task => !task.completed).map(task => task.group));

      setInProgressTasks(tasks.filter(task => !task.completed && task.group === firstIncompleteGroup));
      setToDoTasks(tasks.filter(task => !task.completed && task.group !== firstIncompleteGroup));
      setCompletedTasks(tasks.filter(task => task.completed));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error fetching tasks');
    }
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTask = {
      title: createTitle,
      description: createDescription,
      persona: createPersona,
      group: Number(createGroup),
      completed: false,
    };

    try {
      const res = await fetch("/api/hello", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (res.ok) {
        fetchTasks();

        setCreateTitle("");
        setCreateDescription("");
        setCreatePersona("");
        setCreateGroup("");

        setShowCreateForm(false);
        toast.success("Task created successfully!");
      } else {
        throw new Error("Failed to create task.");
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error creating task');
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/hello`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, completed: true }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      fetchTasks();
      toast.success('Task marked as complete!');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Error completing task');
    }
  };

  const handleUpdateTask = (task: Task) => {
    setUpdatingTask(task);
    setUpdateTitle(task.title);
    setUpdateDescription(task.description);
    setUpdatePersona(task.persona);
    setUpdateGroup(task.group);
  };

  const handleSubmitUpdateTask = async () => {
    if (updatingTask) {
      const updatedTask = {
        ...updatingTask,
        title: updateTitle,
        description: updateDescription,
        persona: updatePersona,
        group: updateGroup,
      };

      try {
        const res = await fetch(`/api/hello`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTask),
        });
        if (!res.ok) throw new Error('Network response was not ok');
        setUpdatingTask(null);
        fetchTasks();
        toast.success('Task updated successfully!');
      } catch (error) {
        console.error('Error updating task:', error);
        toast.error('Error updating task');
      }
    }
  };

  const handleCancelUpdate = () => {
    setUpdatingTask(null);
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/hello?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Network response was not ok');
      fetchTasks();
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error deleting task');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: "#f5f5f5" }}>
      <ToastContainer />
      <Box sx={{ backgroundColor: "#fae6ff", padding: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h2" align="center" color="primary" gutterBottom>
          Task Board
        </Typography>

        <Box display="flex" justifyContent="space-between" mb={4}>
          <Box width="30%">
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" color="primary" gutterBottom>
                To-Do
              </Typography>
              <Badge badgeContent={toDoTasks.length} color="primary" />
            </Box>
            {toDoTasks.map((task) => (
              <Card key={task.id} sx={{ mb: 2 }}>
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

          <Box width="30%">
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" color="#b380ff" gutterBottom>
                In Progress
              </Typography>
              <Badge badgeContent={inProgressTasks.length} color="primary" />
            </Box>
            {inProgressTasks.map((task) => (
              <Card key={task.id} sx={{ mb: 2 }}>
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

          <Box width="30%">
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h5" color="#009900" gutterBottom>
                Completed Tasks
              </Typography>
              <Badge badgeContent={completedTasks.length} color="primary" />
            </Box>
            {completedTasks.map((task) => (
              <Card key={task.id} sx={{ mb: 2 }}>
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

        <Button variant="contained" color="primary" onClick={toggleCreateForm}>
          Add New Task
        </Button>

        <Dialog open={showCreateForm} onClose={toggleCreateForm}>
          <DialogTitle>Create Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="standard"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="standard"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Persona"
              fullWidth
              variant="standard"
              value={createPersona}
              onChange={(e) => setCreatePersona(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Group"
              fullWidth
              type="number"
              variant="standard"
              value={createGroup}
              onChange={(e) => setCreateGroup(Number(e.target.value))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleCreateForm}>Cancel</Button>
            <Button onClick={handleCreateTask}>Create</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!updatingTask} onClose={handleCancelUpdate}>
          <DialogTitle>Update Task</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="standard"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="standard"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Persona"
              fullWidth
              variant="standard"
              value={updatePersona}
              onChange={(e) => setUpdatePersona(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Group"
              fullWidth
              type="number"
              variant="standard"
              value={updateGroup}
              onChange={(e) => setUpdateGroup(Number(e.target.value))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelUpdate}>Cancel</Button>
            <Button onClick={handleSubmitUpdateTask}>Update</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

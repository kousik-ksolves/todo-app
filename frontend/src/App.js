import { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  // Fetch todos
  const fetchTodos = () => {
    fetch("http://localhost:5000/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add todo
  const addTodo = () => {
    if (!task.trim()) return;

    fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    })
      .then((res) => res.json())
      .then((newTodo) => {
        setTodos([...todos, newTodo]);
        setTask("");
      });
  };

  // Mark Done / Undo
  const toggleStatus = (id, completed) => {
    fetch(`http://localhost:5000/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }).then(() => {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed } : todo
        )
      );
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Todo App</h2>

      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter todo"
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={{ marginTop: "8px" }}>
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                marginRight: "10px",
              }}
            >
              {todo.task}
            </span>

            {todo.completed ? (
              <button
                onClick={() => toggleStatus(todo.id, false)}
              >
                Undo
              </button>
            ) : (
              <button
                onClick={() => toggleStatus(todo.id, true)}
              >
                Done
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

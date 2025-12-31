import { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  // Fetch todos
  const fetchTodos = () => {
    console.log("📡 Fetching todos from backend...");
    fetch("http://localhost:5000/todos")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Todos received:", data);
        setTodos(data);
      })
      .catch((err) => console.error("❌ Failed to fetch todos", err));
  };

  useEffect(() => {
    console.log("🚀 App loaded");
    fetchTodos();
  }, []);

  // Add todo
  const addTodo = () => {
    if (!task.trim()) {
      console.warn("⚠️ Empty task not allowed");
      return;
    }

    console.log("➕ Adding todo:", task);

    fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    })
      .then((res) => res.json())
      .then(() => {
        console.log("🔄 Todo added, refetching list");
        fetchTodos();          // ✅ FIX
        setTask("");
      })
      .catch((err) => console.error("❌ Failed to add todo", err));
  };

  // Mark Done / Undo
  const toggleStatus = (id, completed) => {
    console.log(
      completed
        ? `✔️ Marking todo ${id} as DONE`
        : `↩️ Undoing todo ${id}`
    );

    fetch(`http://localhost:5000/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
      .then(() => {
        console.log("🔄 Status updated, refetching todos");
        fetchTodos();          // ✅ keep DB as source of truth
      })
      .catch((err) => console.error("❌ Failed to update todo", err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Todo App</h2>

      <input
        value={task}
        onChange={(e) => {
          console.log("⌨️ Typing:", e.target.value);
          setTask(e.target.value);
        }}
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
              <button onClick={() => toggleStatus(todo.id, false)}>
                Undo
              </button>
            ) : (
              <button onClick={() => toggleStatus(todo.id, true)}>
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

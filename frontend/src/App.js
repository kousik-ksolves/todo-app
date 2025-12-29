import { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");

  // ✅ Fetch all todos from backend
  const fetchTodos = () => {
    fetch("http://localhost:5000/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // ✅ Add new todo
  const addTodo = () => {
    console.log("🟡 Button clicked, task:", task);

    if (!task.trim()) {
      console.log("❌ Empty task");
      return;
    }

    fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task }),
    })
      .then((res) => {
        console.log("🟢 Response status:", res.status);
        return res.json();
      })
      .then((newTodo) => {
        console.log("🟢 Response data:", newTodo);
        setTodos([...todos, newTodo]);
        setTask("");
      })
      .catch((err) => console.error("❌ Fetch error:", err));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Todo App</h2>

      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter todo"
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.task}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

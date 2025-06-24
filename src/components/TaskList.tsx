import "@picocss/pico/css/pico.min.css";
import "../index.css";
import { useState } from "react";
import { AutomergeUrl, useDocument } from "@automerge/react";

// Hardcoded username for demo; replace with real user system
const currentUser = "Syazwan";

export interface Task {
  title: string;
  done: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface ChangeLog {
  action: "add" | "edit" | "delete";
  title: string;
  timestamp: string;
  username: string;
}

export interface TaskList {
  title: string;
  tasks: Task[];
  changes?: ChangeLog[];
}

export function initTaskList(): TaskList {
  return {
    title: `TODO: ${new Date().toLocaleString()}`,
    tasks: [],
    changes: [],
  };
}

export const TaskList: React.FC<{
  docUrl: AutomergeUrl;
}> = ({ docUrl }) => {
  const [doc, changeDoc] = useDocument<TaskList>(docUrl, {
    suspense: true,
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddTask = () => {
    const timestamp = new Date().toISOString();
    const titleToAdd = newTaskTitle.trim() || "(empty)";
    changeDoc((d) => {
      d.tasks.unshift({
        title: titleToAdd,
        done: false,
        createdBy: currentUser,
        createdAt: timestamp,
      });
      d.changes ??= [];
      d.changes.push({
        action: "add",
        title: titleToAdd,
        timestamp,
        username: currentUser,
      });
    });
    setNewTaskTitle("");
  };

  const handleSaveEdit = (index: number) => {
    const task = doc?.tasks[index];
    if (!task) return;

    const timestamp = new Date().toISOString();
    changeDoc((d) => {
      d.tasks[index].updatedAt = timestamp;
      d.tasks[index].updatedBy = currentUser;

      d.changes ??= [];
      d.changes.push({
        action: "edit",
        title: task.title,
        timestamp,
        username: currentUser,
      });
    });
  };

  const handleDeleteTask = (index: number) => {
    const task = doc?.tasks[index];
    if (!task) return;

    const timestamp = new Date().toISOString();
    changeDoc((d) => {
      d.tasks.splice(index, 1);
      d.changes ??= [];
      d.changes.push({
        action: "delete",
        title: task.title,
        timestamp,
        username: currentUser,
      });
    });
  };

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter new task title"
          style={{ flex: 1 }}
        />
        <button type="button" onClick={handleAddTask}>
          <b>+</b> Add New Task
        </button>
      </div>

      <div id="task-list" style={{ marginTop: "1.5rem" }}>
        {doc?.tasks?.map(({ title, done }, index) => (
          <div className="task" key={index} style={{ marginBottom: "1rem" }}>
            <input
              type="checkbox"
              checked={done}
              onChange={() =>
                changeDoc((d) => {
                  d.tasks[index].done = !d.tasks[index].done;
                })
              }
            />

            <input
              type="text"
              value={title || ""}
              placeholder="Task title"
              onChange={(e) =>
                changeDoc((d) => {
                  d.tasks[index].title = e.target.value;
                })
              }
              style={{
                textDecoration: done ? "line-through" : undefined,
                marginRight: "0.5rem",
                width: "50%",
              }}
            />

            <button onClick={() => handleSaveEdit(index)}>Save Edit</button>
            <button
              onClick={() => handleDeleteTask(index)}
              style={{ marginLeft: "0.5rem" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {doc?.changes && doc.changes.length > 0 && (
        <section style={{ marginTop: "2rem" }}>
          <h4>Change History</h4>
          <ul>
            {doc.changes.map((log, i) => (
              <li key={i}>
                [{formatDate(log.timestamp)}] <b>{log.username}</b> <i>{log.action}</i>{" "}
                task: "<code>{log.title}</code>"
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

import "@picocss/pico/css/pico.min.css";
import "../index.css";
import { useState, useEffect } from "react";
import { AutomergeUrl, useDocument } from "@automerge/react";

export interface ChangeLog {
  action: "add" | "edit" | "delete";
  title: string;
  timestamp: string;
  username: string;
}

export interface TextData {
  content: string;
  changes?: ChangeLog[];
}

export function initTextData(): TextData {
  return {
    content: "",
    changes: [],
  };
}

export const TaskList: React.FC<{
  docUrl: AutomergeUrl;
}> = ({ docUrl }) => {
  const [doc, changeDoc] = useDocument<TextData>(docUrl, {
    suspense: true,
  });

  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState("User");

  // Assign a random user ID per tab
  useEffect(() => {
    let user = sessionStorage.getItem("currentUser");
    if (!user) {
      user = "User_" + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem("currentUser", user);
    }
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (doc?.content !== undefined) {
      setInputText(doc.content);
    }
  }, [doc?.content]);

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

  const handleSave = () => {
    const trimmed = inputText.trim();
    const timestamp = new Date().toISOString();

    changeDoc((d) => {
      d.changes ??= [];

      if (!d.content && trimmed) {
        d.content = trimmed;
        d.changes.push({
          action: "add",
          title: trimmed,
          timestamp,
          username: currentUser,
        });
      } else if (d.content && !trimmed) {
        d.changes.push({
          action: "delete",
          title: d.content,
          timestamp,
          username: currentUser,
        });
        d.content = "";
      } else if (d.content !== trimmed) {
        d.changes.push({
          action: "edit",
          title: trimmed,
          timestamp,
          username: currentUser,
        });
        d.content = trimmed;
      }
    });
  };

  return (
  <>
    <div>
      <p>
        Logged in as: <strong>{currentUser}</strong>
      </p>

      {/* Textarea */}
      <div style={{ marginBottom: "0.5rem" }}>
        <textarea
          value={inputText}
          rows={10}
          onChange={(e) => setInputText(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Save button aligned to the right below textarea */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>

    {doc?.changes && doc.changes.length > 0 && (
      <section style={{ marginTop: "2rem" }}>
        <h4>Change History</h4>
        <ul>
          {doc.changes.map((log, i) => (
            <li key={i}>
              [{formatDate(log.timestamp)}] <b>{log.username}</b> <i>{log.action}</i>{" "}
              text: "<code>{log.title}</code>"
            </li>
          ))}
        </ul>
      </section>
    )}
  </>
);

};

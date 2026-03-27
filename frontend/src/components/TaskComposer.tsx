import { useState } from "react";

interface TaskComposerProps {
  onCreateTask: (title: string) => void;
}

export function TaskComposer({ onCreateTask }: TaskComposerProps) {
  const [title, setTitle] = useState("");

  function submit() {
    if (!title.trim()) {
      return;
    }

    onCreateTask(title.trim());
    setTitle("");
  }

  return (
    <section className="task-composer">
      <input
        value={title}
        placeholder="Add a task for this week"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submit();
          }
        }}
      />
      <button onClick={submit}>Add</button>
    </section>
  );
}

import React, { useEffect } from "react";
import { useDocument, AutomergeUrl, useRepo } from "@automerge/react";
import { RootDocument } from "../rootDoc";
import { TextData, initTextData } from "./TaskList"; // import from correct path

export const DocumentList: React.FC<{
  docUrl: AutomergeUrl;
  selectedDocument: AutomergeUrl | null;
  onSelectDocument: (docUrl: AutomergeUrl | null) => void;
}> = ({ docUrl, selectedDocument, onSelectDocument }) => {
  const repo = useRepo();
  const [doc, changeDoc] = useDocument<RootDocument>(docUrl, {
    suspense: true,
  });

  // Auto-add selected document if it's new
  useEffect(() => {
    if (selectedDocument) {
      changeDoc((d) => {
        if (!d.taskLists.includes(selectedDocument)) {
          d.taskLists.push(selectedDocument);
        }
      });
    }
  }, [selectedDocument, changeDoc]);

  // Create new document and select it
  const handleNewDocument = () => {
    const newDocHandle = repo.create<TextData>(initTextData());
    const newUrl = newDocHandle.url;

    changeDoc((d) => {
      if (!d.taskLists.includes(newUrl)) {
        d.taskLists.push(newUrl);
      }
    });

    onSelectDocument(newUrl);
  };

  return (
    <div className="document-list">
      <div className="documents">
        {doc.taskLists.map((url, index) => (
          <div
            key={url}
            className={`document-item ${url === selectedDocument ? "active" : ""}`}
            onClick={() => onSelectDocument(url)}
          >
            Document {index + 1}
          </div>
        ))}
      </div>
      <button onClick={handleNewDocument} style={{ marginTop: "1rem" }}>
        + Add Document
      </button>
    </div>
  );
};

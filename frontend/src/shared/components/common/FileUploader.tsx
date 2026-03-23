"use client";

import { useRef, useState } from "react";

type FileUploaderProps = {
  id: string;
  onFileSelect: (file: File | null) => void;
  selectedFileName?: string;
  accept?: string;
  disabled?: boolean;
};

export function FileUploader({
  id,
  onFileSelect,
  selectedFileName,
  accept,
  disabled = false,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file?: File) => {
    onFileSelect(file ?? null);
  };

  return (
    <div style={{ display: "grid", gap: "0.625rem" }}>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        className="form-input"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled}
        className="btn btn-secondary"
        style={{
          borderStyle: "dashed",
          borderWidth: "1px",
          padding: "1rem",
          background: isDragging ? "var(--accent-light)" : undefined,
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        Arraste um arquivo aqui ou clique para selecionar
      </button>
      {selectedFileName ? <span className="badge badge-blue">{selectedFileName}</span> : null}
    </div>
  );
}

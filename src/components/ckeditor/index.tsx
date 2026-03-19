"use client";

import React, { FC } from "react";
import dynamic from "next/dynamic";

// Chỉ import CKEditor từ CKEditorWrapper - không import ckeditor5 ở đây để tránh duplicate modules
const CKEditorComponent = dynamic(() => import("./CKEditorWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
      Loading editor...
    </div>
  ),
});

interface CkEditorProps {
  editorData: string;
  setEditorData: (html: string) => void;
}
const CkEditor: FC<CkEditorProps> = ({ setEditorData, editorData }) => {
  return (
    <CKEditorComponent editorData={editorData} setEditorData={setEditorData} />
  );
};

export default CkEditor;

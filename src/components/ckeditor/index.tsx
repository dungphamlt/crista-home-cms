"use client";

import React, { FC, useEffect } from "react";
import dynamic from "next/dynamic";
import "ckeditor5/ckeditor5.css";

// Dynamic import để tránh SSR
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

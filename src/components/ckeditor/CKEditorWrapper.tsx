"use client";

import React, { FC } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";

import {
  ClassicEditor,
  Alignment,
  Autoformat,
  Bold,
  Italic,
  Underline,
  Superscript,
  Subscript,
  BlockQuote,
  CloudServices,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
  Indent,
  IndentBlock,
  Link,
  List,
  Font,
  FontFamily,
  FontColor,
  FontSize,
  FontBackgroundColor,
  Mention,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TextTransformation,
  SourceEditing,
} from "ckeditor5";
import { postService } from "@/services/postService";

interface CkEditorProps {
  editorData: string;
  setEditorData: (html: string) => void;
}

const CKEditorWrapper: FC<CkEditorProps> = ({ setEditorData, editorData }) => {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={editorData}
      config={
        {
          licenseKey: "GPL",
          plugins: [
            Alignment,
            Autoformat,
            BlockQuote,
            Bold,
            Superscript,
            Subscript,
            CloudServices,
            Essentials,
            Heading,
            Image,
            ImageCaption,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            Font,
            FontFamily,
            FontColor,
            FontSize,
            FontBackgroundColor,
            List,
            Mention,
            Paragraph,
            PasteFromOffice,
            PictureEditing,
            Table,
            TableColumnResize,
            TableProperties,
            TableCellProperties,
            TableToolbar,
            TextTransformation,
            Underline,
            SourceEditing,
          ],
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "superscript",
            "subscript",
            "|",
            "link",
            "uploadImage",
            "insertTable",
            "blockQuote",
            "|",
            "fontFamily",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "alignment",
            "|",
            "outdent",
            "indent",
            "sourceEditing",
          ],
          list: {
            properties: {
              styles: true,
              startIndex: true,
              reversed: true,
            },
          },
          // extraPlugins: [
          //   // Custom upload adapter để upload ảnh lên server
          //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
          //   function (editor: any) {
          //     // Đảm bảo FileRepository đã được load trước khi set upload adapter
          //     editor.on("ready", () => {
          //       const fileRepository = editor.plugins.get("FileRepository");
          //       if (fileRepository) {
          //         fileRepository.createUploadAdapter = (
          //           // eslint-disable-next-line @typescript-eslint/no-explicit-any
          //           loader: any,
          //         ) => {
          //           return {
          //             upload: async () => {
          //               const file = await loader.file;

          //               // Validate file type
          //               if (!file.type.startsWith("image/")) {
          //                 throw new Error("File must be an image");
          //               }

          //               // Validate file size (max 10MB)
          //               if (file.size > 10 * 1024 * 1024) {
          //                 throw new Error("Image size must be less than 10MB");
          //               }

          //               try {
          //                 // Upload image to server
          //                 const response = await postService.uploadImage(
          //                   file,
          //                   "editor",
          //                 );

          //                 if (response.success && response.data) {
          //                   const imageUrl =
          //                     response.data.url ||
          //                     response.data.result?.variants?.[0];
          //                   return {
          //                     default: imageUrl,
          //                   };
          //                 } else {
          //                   throw new Error(
          //                     response.error || "Failed to upload image",
          //                   );
          //                 }
          //               } catch (error) {
          //                 console.error("Upload error:", error);
          //                 throw error;
          //               }
          //             },
          //             abort: () => {
          //               // Handle abort if needed
          //             },
          //           };
          //         };
          //       }
          //     });
          //   },
          // ],
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
              {
                model: "heading5",
                view: "h5",
                title: "Heading 5",
                class: "ck-heading_heading5",
              },
              {
                model: "heading6",
                view: "h6",
                title: "Heading 6",
                class: "ck-heading_heading6",
              },
            ],
          },
          image: {
            resizeOptions: [
              {
                name: "resizeImage:original",
                label: "Default image width",
                value: null,
              },
              {
                name: "resizeImage:25",
                label: "25% page width",
                value: "25",
              },
              {
                name: "resizeImage:33",
                label: "33% page width",
                value: "33",
              },
              {
                name: "resizeImage:40",
                label: "40% page width",
                value: "40",
              },
              {
                name: "resizeImage:50",
                label: "50% page width",
                value: "50",
              },
              {
                name: "resizeImage:75",
                label: "75% page width",
                value: "75",
              },
              {
                name: "resizeImage:100",
                label: "100% page width",
                value: "100",
              },
            ],
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "|",
              "imageStyle:inline",
              "imageStyle:wrapText",
              "imageStyle:breakText",
              "|",
              "resizeImage",
            ],
          },
          fontColor: {
            colors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
                hasBorder: true,
              },
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
            ],
          },
          fontSize: {
            options: [
              10,
              12,
              "default",
              16,
              18,
              20,
              22,
              24,
              26,
              28,
              30,
              32,
              34,
              36,
            ],
            supportAllValues: true,
          },
          fontBackgroundColor: {
            colors: [
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
            ],
          },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
          },
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableCellProperties",
              "tableProperties",
              "|",
              "alignment:left",
              "alignment:center",
              "alignment:right",
              "alignment:justify",
            ],
            tableToolbar: ["bold", "italic", "|", "alignment"],
            // tableCellProperties: {
            //   borderColors: [
            //     {
            //       color: "hsl(0, 0%, 0%)",
            //       label: "Black",
            //     },
            //     {
            //       color: "hsl(0, 0%, 30%)",
            //       label: "Dim grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 60%)",
            //       label: "Grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 90%)",
            //       label: "Light grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 100%)",
            //       label: "White",
            //     },
            //   ],
            //   backgroundColors: [
            //     {
            //       color: "hsl(0, 0%, 0%)",
            //       label: "Black",
            //     },
            //     {
            //       color: "hsl(0, 0%, 30%)",
            //       label: "Dim grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 60%)",
            //       label: "Grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 90%)",
            //       label: "Light grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 100%)",
            //       label: "White",
            //     },
            //     {
            //       color: "hsl(0, 75%, 60%)",
            //       label: "Red",
            //     },
            //     {
            //       color: "hsl(30, 75%, 60%)",
            //       label: "Orange",
            //     },
            //     {
            //       color: "hsl(60, 75%, 60%)",
            //       label: "Yellow",
            //     },
            //     {
            //       color: "hsl(90, 75%, 60%)",
            //       label: "Light green",
            //     },
            //     {
            //       color: "hsl(120, 75%, 60%)",
            //       label: "Green",
            //     },
            //   ],
            // },
            // tableProperties: {
            //   borderColors: [
            //     {
            //       color: "hsl(0, 0%, 0%)",
            //       label: "Black",
            //     },
            //     {
            //       color: "hsl(0, 0%, 30%)",
            //       label: "Dim grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 60%)",
            //       label: "Grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 90%)",
            //       label: "Light grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 100%)",
            //       label: "White",
            //     },
            //   ],
            //   backgroundColors: [
            //     {
            //       color: "hsl(0, 0%, 0%)",
            //       label: "Black",
            //     },
            //     {
            //       color: "hsl(0, 0%, 30%)",
            //       label: "Dim grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 60%)",
            //       label: "Grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 90%)",
            //       label: "Light grey",
            //     },
            //     {
            //       color: "hsl(0, 0%, 100%)",
            //       label: "White",
            //     },
            //   ],
            // },
          },
          placeholder: "Type or paste your content here!",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CKEditor EditorConfig augmentation not applied in aggregate package
        } as any
      }
      onChange={(_event, editor) => {
        const data = editor.getData();
        setEditorData(data);
      }}
    />
  );
};

export default CKEditorWrapper;

"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";

type ToolButton = {
  icon: string;
  title: string;
  isActive?: (e: Editor) => boolean;
  run: (e: Editor) => void;
};

const TOOLS: ToolButton[] = [
  {
    icon: "format_bold",
    title: "Bold",
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    icon: "format_italic",
    title: "Italic",
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    icon: "title",
    title: "Heading",
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    icon: "subtitles",
    title: "Subheading",
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    icon: "format_list_bulleted",
    title: "Bullet list",
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    icon: "format_list_numbered",
    title: "Numbered list",
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    icon: "format_quote",
    title: "Quote",
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    icon: "horizontal_rule",
    title: "Divider",
    run: (e) => e.chain().focus().setHorizontalRule().run(),
  },
];

export function ManuscriptEditor({
  name,
  defaultHTML = "",
  placeholder = "Begin writing…",
}: {
  name: string;
  defaultHTML?: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultHTML);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultHTML || "",
    editorProps: {
      attributes: {
        class: "tiptap manuscript-prose focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className="border border-secondary bg-[rgba(232,217,184,0.06)]">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap items-center gap-1 border-b border-outline-variant bg-surface px-2 py-1">
        {TOOLS.map((tool) => {
          const active = editor && tool.isActive ? tool.isActive(editor) : false;
          return (
            <button
              key={tool.icon}
              type="button"
              title={tool.title}
              onClick={() => editor && tool.run(editor)}
              className={`flex h-8 w-8 items-center justify-center transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {tool.icon}
              </span>
            </button>
          );
        })}
      </div>
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

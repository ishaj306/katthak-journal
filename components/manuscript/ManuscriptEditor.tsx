"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/manuscript/Icons";

type ToolButton = {
  label: ReactNode;
  title: string;
  isActive?: (e: Editor) => boolean;
  run: (e: Editor) => void;
};

const TOOLS: ToolButton[] = [
  {
    label: <span className="font-display text-[17px] font-bold">B</span>,
    title: "Bold",
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    label: <span className="font-display text-[17px] italic">I</span>,
    title: "Italic",
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    label: <span className="font-display text-[15px] font-semibold">H₂</span>,
    title: "Heading",
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: <span className="font-display text-[15px] font-semibold">H₃</span>,
    title: "Subheading",
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: <Icon.ListBullet size={18} />,
    title: "Bullet list",
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: <Icon.ListNumber size={18} />,
    title: "Numbered list",
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: <Icon.Quote size={18} />,
    title: "Quote",
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: <Icon.Rule size={18} />,
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
              key={tool.title}
              type="button"
              title={tool.title}
              onClick={() => editor && tool.run(editor)}
              className={`flex h-8 w-8 items-center justify-center transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              }`}
            >
              {tool.label}
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

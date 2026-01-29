'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useRef, useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Escribe aquí...' }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
      },
    },
  });

  
  // Update editor content when prop changes (e.g., after fetching from API)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const addImage = useCallback(async (file: File) => {
    if (!editor) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addImage(file);
    }
    e.target.value = '';
  };

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL del enlace:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = "p-2 rounded hover:bg-gray-200 text-sm font-medium";
  const activeClass = "bg-gray-300";

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnClass} ${editor.isActive('bold') ? activeClass : ''}`}
          title="Negrita"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnClass} ${editor.isActive('italic') ? activeClass : ''}`}
          title="Cursiva"
        >
          <em>I</em>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : ''}`}
          title="Título"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btnClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : ''}`}
          title="Subtítulo"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : ''}`}
          title="Lista"
        >
          • Lista
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : ''}`}
          title="Lista numerada"
        >
          1. Lista
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={addLink}
          className={`${btnClass} ${editor.isActive('link') ? activeClass : ''}`}
          title="Agregar enlace"
        >
          Link
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`${btnClass} disabled:opacity-50 bg-blue-100 hover:bg-blue-200`}
          title="Agregar imagen"
        >
          {isUploading ? 'Subiendo...' : 'Imagen'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${btnClass} disabled:opacity-30`}
          title="Deshacer"
        >
          Deshacer
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${btnClass} disabled:opacity-30`}
          title="Rehacer"
        >
          Rehacer
        </button>
      </div>

      <EditorContent editor={editor} className="bg-white min-h-[200px]" />
    </div>
  );
}

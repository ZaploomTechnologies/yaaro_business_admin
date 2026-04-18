'use client';

import { useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { getClientCookie } from '@/lib/cookie.client';

interface CKEditorComponentProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Remount editor when switching posts (e.g. id or 'new'). Ensures initial data is used. */
  editorKey?: string;
}

/**
 * Uses initial `value` only for data. Updates flow out via onChange only.
 * Prevents controlled-data overwriting when applying headers/formatting.
 */
export function CKEditorComponent({
  value,
  onChange,
  placeholder = 'Start typing...',
  disabled = false,
  editorKey,
}: CKEditorComponentProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const initialData = useRef<string | null>(null);
  
  // Initialize initialData once
  if (initialData.current === null) initialData.current = value;

  return (
    <div className="ckeditor-wrapper" key={editorKey}>
      <CKEditor
        editor={ClassicEditor as any}
        data={initialData.current}
        config={{
          placeholder,
          toolbar: {
            items: [
              'heading',
              '|',
              'bold',
              'italic',
              'link',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'blockQuote',
              '|',
              'undo',
              'redo',
            ],
          },
          list: {
            properties: {
              styles: true,
              startIndex: true,
              reversed: true,
            },
          },
        }}
        onChange={(_event: unknown, editor: { getData: () => string }) => {
          onChange(editor.getData());
        }}
        disabled={disabled}
      />
      <style jsx global>{`
        .ckeditor-wrapper .ck-editor__editable {
          min-height: 200px;
          background-color: transparent !important;
        }
        .ckeditor-wrapper .ck-content {
          min-height: 200px;
        }
        .ckeditor-wrapper .ck.ck-editor__main>.ck-editor__editable {
          background: white;
          color: black;
        }
        .ckeditor-wrapper .ck-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 0.75em 0 0.5em;
          line-height: 1.2;
        }
        .ckeditor-wrapper .ck-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0.75em 0 0.5em;
          line-height: 1.3;
        }
        .ckeditor-wrapper .ck-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5em 0 0.25em;
          line-height: 1.4;
        }
        .ckeditor-wrapper .ck-content ul,
        .ckeditor-wrapper .ck-content ol {
          margin: 0.75em 0;
          padding-left: 1.5em;
        }
        .ckeditor-wrapper .ck-content ul {
          list-style-type: disc;
        }
        .ckeditor-wrapper .ck-content ol {
          list-style-type: decimal;
        }
        .ckeditor-wrapper .ck-content li {
          margin: 0.25em 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

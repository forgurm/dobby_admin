import type { Editor as EditorType } from '@toast-ui/editor';

export interface EditorInstance extends EditorType {
  getInstance(): {
    setHTML(html: string): void;
    getHTML(): string;
    getMarkdown(): string;
    setMarkdown(markdown: string): void;
    insertText(text: string): void;
    getSelectedText(): string;
    replaceSelection(text: string): void;
    setHeight(height: string): void;
    focus(): void;
    blur(): void;
  };
}

export interface EditorProps {
  initialValue?: string;
  height?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onMount?: (editor: EditorInstance) => void;
} 
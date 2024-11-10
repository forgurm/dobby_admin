import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/i18n/ko-kr';
import { forwardRef, useRef, useEffect, ForwardedRef } from 'react';
import styles from '@/styles/editor.module.css';
import axiosInstance from '@/lib/axios';
import { EditorInstance, EditorProps } from '@/types/editor';

const NoticeEditor = forwardRef((props: EditorProps, _ref: ForwardedRef<Editor>) => {
  const editorRef = useRef<Editor>(null);
  const { onMount } = props;

  useEffect(() => {
    if (editorRef.current && onMount) {
      onMount(editorRef.current as unknown as EditorInstance);
    }
  }, [onMount]);

  useEffect(() => {
    if (editorRef.current) {
      const instance = (editorRef.current as unknown as EditorInstance).getInstance();
      if (instance) {
        instance.setHTML(props.initialValue || '');
      }
    }
  }, [props.initialValue]);

  const handleImageUpload = async (blob: Blob, callback: (url: string, alt: string) => void) => {
    try {
      const formData = new FormData();
      formData.append('file', blob);

      const response = await axiosInstance.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      callback(response.data.urls[0], 'image');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  return (
    <div className={styles.editorWrapper}>
      <Editor
        ref={editorRef}
        initialValue={props.initialValue}
        previewStyle="vertical"
        height={props.height || '600px'}
        placeholder={props.placeholder || "내용을 입력하세요."}
        initialEditType="wysiwyg"
        hideModeSwitch={true}
        language="ko-KR"
        hooks={{
          addImageBlobHook: handleImageUpload
        }}
        toolbarItems={[
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task', 'indent', 'outdent'],
          ['table', 'image', 'link'],
          ['code', 'codeblock']
        ]}
        onChange={props.onChange}
        useCommandShortcut={false}
        usageStatistics={false}
        viewer={false}
      />
    </div>
  );
});

NoticeEditor.displayName = 'NoticeEditor';

export default NoticeEditor; 
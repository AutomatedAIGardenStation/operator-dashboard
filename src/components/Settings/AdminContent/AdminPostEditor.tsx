import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  useIonToast,
  IonSpinner,
} from '@ionic/react';
import { useAdminContentStore } from '../../../store/adminContentStore';
import { AdminPost, CreateAdminPostRequest, UpdateAdminPostRequest } from '../../../api/types';

interface AdminPostEditorProps {
  isOpen: boolean;
  post: AdminPost | null;
  onDidDismiss: () => void;
}

export const AdminPostEditor: React.FC<AdminPostEditorProps> = ({ isOpen, post, onDidDismiss }) => {
  const { createPost, updatePost } = useAdminContentStore();
  const [presentToast] = useIonToast();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setStatus(post.status);
      } else {
        setTitle('');
        setSlug('');
        setContent('');
        setStatus('draft');
      }
      setErrors({});
    }
  }, [isOpen, post]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug = 'Slug must only contain lowercase letters, numbers, and hyphens';
    }
    if (!content.trim()) newErrors.content = 'Content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (post) {
        const updateData: UpdateAdminPostRequest = { title, slug, content, status };
        await updatePost(post.id, updateData);
        presentToast({ message: 'Post updated successfully', duration: 2000, color: 'success' });
      } else {
        const createData: CreateAdminPostRequest = { title, slug, content, status };
        await createPost(createData);
        presentToast({ message: 'Post created successfully', duration: 2000, color: 'success' });
      }
      onDidDismiss();
    } catch (err) {
      const error = err as Error;
      presentToast({
        message: error.message || 'An error occurred while saving',
        duration: 3000,
        color: 'danger',
      });
      const apiErr = err as { response?: { status?: number } };
      if (apiErr.response?.status === 409) {
         setErrors({ slug: 'Slug must be unique' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{post ? 'Edit Post' : 'New Post'}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={onDidDismiss} disabled={loading}>Cancel</IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={handleSave} disabled={loading}>
              {loading ? <IonSpinner name="dots" /> : 'Save'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonInput
              label="Title"
              labelPlacement="stacked"
              value={title}
              onIonInput={(e) => setTitle(e.detail.value!)}
              placeholder="e.g. Getting Started"
            />
          </IonItem>
          {errors.title && <div style={{ color: 'red', padding: '0 16px', fontSize: '12px' }}>{errors.title}</div>}

          <IonItem>
            <IonInput
              label="Slug"
              labelPlacement="stacked"
              value={slug}
              onIonInput={(e) => setSlug(e.detail.value!)}
              placeholder="e.g. getting-started"
            />
          </IonItem>
          {errors.slug && <div style={{ color: 'red', padding: '0 16px', fontSize: '12px' }}>{errors.slug}</div>}

          <IonItem>
            <IonTextarea
              label="Content"
              labelPlacement="stacked"
              value={content}
              onIonInput={(e) => setContent(e.detail.value!)}
              placeholder="Post content..."
              autoGrow
              rows={6}
            />
          </IonItem>
          {errors.content && <div style={{ color: 'red', padding: '0 16px', fontSize: '12px' }}>{errors.content}</div>}

          <IonItem>
            <IonSelect
              label="Status"
              labelPlacement="stacked"
              value={status}
              onIonChange={(e) => setStatus(e.detail.value)}
            >
              <IonSelectOption value="draft">Draft</IonSelectOption>
              <IonSelectOption value="published">Published</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
};

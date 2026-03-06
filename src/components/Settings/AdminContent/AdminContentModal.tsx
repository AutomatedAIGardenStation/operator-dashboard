import React, { useEffect, useState } from 'react';
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
  IonLabel,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSpinner,
  useIonAlert,
} from '@ionic/react';
import { add, create, trash } from 'ionicons/icons';
import { useAdminContentStore } from '../../../store/adminContentStore';
import { AdminPostEditor } from './AdminPostEditor';
import { AdminPost } from '../../../api/types';

interface AdminContentModalProps {
  isOpen: boolean;
  onDidDismiss: () => void;
}

export const AdminContentModal: React.FC<AdminContentModalProps> = ({ isOpen, onDidDismiss }) => {
  const { posts, loading, error, fetchPosts, deletePost } = useAdminContentStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    if (isOpen) {
      void fetchPosts();
    }
  }, [isOpen, fetchPosts]);

  const handleAdd = () => {
    setEditingPost(null);
    setEditorOpen(true);
  };

  const handleEdit = (post: AdminPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const handleDelete = (post: AdminPost) => {
    presentAlert({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${post.title}"?`,
      buttons: [
        'Cancel',
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void deletePost(post.id);
          },
        },
      ],
    });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Public Content</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDidDismiss}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading && posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <IonSpinner />
          </div>
        ) : error && posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
            No posts found.
          </div>
        ) : (
          <IonList>
            {posts.map((post) => (
              <IonItem key={post.id}>
                <IonLabel>
                  <h2>{post.title}</h2>
                  <p>/{post.slug}</p>
                </IonLabel>
                <IonBadge
                  slot="end"
                  color={post.status === 'published' ? 'success' : 'medium'}
                >
                  {post.status}
                </IonBadge>
                <IonButton fill="clear" slot="end" onClick={() => handleEdit(post)}>
                  <IonIcon icon={create} />
                </IonButton>
                <IonButton fill="clear" color="danger" slot="end" onClick={() => handleDelete(post)}>
                  <IonIcon icon={trash} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAdd}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AdminPostEditor
          isOpen={editorOpen}
          post={editingPost}
          onDidDismiss={() => setEditorOpen(false)}
        />
      </IonContent>
    </IonModal>
  );
};

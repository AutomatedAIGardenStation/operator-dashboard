import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
} from '@ionic/react';

import { useHistory } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const history = useHistory();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder login functionality for now
    localStorage.setItem('token', 'placeholder_token');
    history.push('/dashboard');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>GardenStation</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        <IonCard style={{ maxWidth: 400, margin: '2rem auto' }}>
          <IonCardHeader>
            <IonCardTitle>Login</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleLogin}>
              <IonItem>
                <IonInput id="email" label="Email" labelPlacement="floating" type="email" required />
              </IonItem>
              <IonItem>
                <IonInput id="password" label="Password" labelPlacement="floating" type="password" required />
              </IonItem>
              <IonButton expand="block" type="submit" className="ion-margin-top">
                Sign In
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

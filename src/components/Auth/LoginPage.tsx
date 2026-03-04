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

export const LoginPage: React.FC = () => {
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
            <IonItem>
              <IonInput id="email" label="Email" labelPlacement="floating" type="email" disabled />
            </IonItem>
            <IonItem>
              <IonInput id="password" label="Password" labelPlacement="floating" type="password" disabled />
            </IonItem>
            <IonButton expand="block" className="ion-margin-top" disabled>
              Sign In
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

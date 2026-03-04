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
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { add } from 'ionicons/icons';

export const PlantsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Plants</IonTitle>
          <IonButton slot="end" fill="clear">
            <IonIcon icon={add} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>Chamber A</IonCardSubtitle>
                  <IonCardTitle>Tomatoes</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Growth stage, health status, and care schedule will be shown here.</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>Chamber B</IonCardSubtitle>
                  <IonCardTitle>Lettuce</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Growth stage, health status, and care schedule will be shown here.</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardSubtitle>Chamber C</IonCardSubtitle>
                  <IonCardTitle>Herbs</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Growth stage, health status, and care schedule will be shown here.</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

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
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
} from '@ionic/react';

export const ControlsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Controls</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Actuators</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>Water Pump</IonLabel>
                <IonToggle slot="end" disabled />
              </IonItem>
              <IonItem>
                <IonLabel>Grow Lights</IonLabel>
                <IonToggle slot="end" disabled />
              </IonItem>
              <IonItem>
                <IonLabel>Ventilation Fan</IonLabel>
                <IonToggle slot="end" disabled />
              </IonItem>
              <IonItem>
                <IonLabel>Nutrient Dosing</IonLabel>
                <IonToggle slot="end" disabled />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Automation Rules</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Automation schedules and rules will be configured here.</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

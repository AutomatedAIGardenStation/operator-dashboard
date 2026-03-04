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
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/react';

export const MonitoringPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Monitoring</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSegment value="live">
          <IonSegmentButton value="live">
            <IonLabel>Live</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="history">
            <IonLabel>History</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Sensor Readings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Live sensor data and charts will be displayed here.</p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Environmental Conditions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Temperature, humidity, light, and soil moisture readings will appear here.</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

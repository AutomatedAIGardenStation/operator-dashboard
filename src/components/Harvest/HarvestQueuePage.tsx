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
  IonBadge,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { add } from 'ionicons/icons';

export const HarvestQueuePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Harvest Queue</IonTitle>
          <IonButton slot="end" fill="clear">
            <IonIcon icon={add} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Pending Jobs</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>Tomatoes - Chamber A</h2>
                  <p>Scheduled harvest pending</p>
                </IonLabel>
                <IonBadge color="warning" slot="end">Pending</IonBadge>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <h2>Lettuce - Chamber B</h2>
                  <p>Ready for harvest</p>
                </IonLabel>
                <IonBadge color="success" slot="end">Ready</IonBadge>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Completed</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Harvest history will be displayed here.</p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

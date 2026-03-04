import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonItemGroup,
  IonItemDivider,
} from '@ionic/react';

export const SettingsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Notifications</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonLabel>Push Notifications</IonLabel>
              <IonToggle slot="end" disabled />
            </IonItem>
            <IonItem>
              <IonLabel>Alert Threshold Warnings</IonLabel>
              <IonToggle slot="end" disabled />
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Display</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonLabel>Temperature Unit</IonLabel>
              <IonSelect value="celsius" disabled>
                <IonSelectOption value="celsius">Celsius</IonSelectOption>
                <IonSelectOption value="fahrenheit">Fahrenheit</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle slot="end" disabled />
            </IonItem>
          </IonItemGroup>

          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Account</IonLabel>
            </IonItemDivider>
            <IonItem button disabled>
              <IonLabel>Profile</IonLabel>
            </IonItem>
            <IonItem button disabled>
              <IonLabel color="danger">Logout</IonLabel>
            </IonItem>
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

import React, { useEffect } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import { useSensorStore } from '../../store/sensorStore';
import { useActuatorStore } from '../../store/actuatorStore';
import { SensorCard } from './SensorCard';
import { ActuatorBadge } from './ActuatorBadge';

export const DashboardPage: React.FC = () => {
  const { connected, readings, lastUpdated, connect, disconnect } = useSensorStore();
  const actuatorConnect = useActuatorStore(state => state.connect);
  const actuatorDisconnect = useActuatorStore(state => state.disconnect);

  useEffect(() => {
    connect();
    actuatorConnect();
    return () => {
      disconnect();
      actuatorDisconnect();
    };
  }, [connect, disconnect, actuatorConnect, actuatorDisconnect]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {!connected && (
          <IonItem color="danger" style={{ marginBottom: '16px' }} data-testid="disconnected-banner">
            <IonIcon icon={warningOutline} slot="start" />
            <IonLabel>⚠ Disconnected</IonLabel>
          </IonItem>
        )}

        <div style={{ marginBottom: '16px', color: 'gray', fontSize: '0.9em' }}>
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
        </div>

        <IonGrid>
          <IonRow>
            <IonCol size="6" sizeMd="4">
              <SensorCard title="Temperature" value={readings?.temp} unit="°C" />
            </IonCol>
            <IonCol size="6" sizeMd="4">
              <SensorCard title="Humidity" value={readings?.humidity} unit="%" />
            </IonCol>
            <IonCol size="6" sizeMd="4">
              <SensorCard title="pH Level" value={readings?.ph} />
            </IonCol>
            <IonCol size="6" sizeMd="4">
              <SensorCard title="EC" value={readings?.ec} unit="mS/cm" />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <SensorCard
                title="Tank Level"
                type="progress"
                value={readings?.tank_level_pct}
                unit="%"
                progress={readings?.tank_level_pct}
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <SensorCard
                title="Soil Moisture"
                type="array"
                unit="%"
                arrayValues={readings?.soil_moisture || []}
              />
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Actuators Status</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {readings?.actuator_status && Object.keys(readings.actuator_status).length > 0 ? (
                      Object.entries(readings.actuator_status).map(([key, active]) => (
                        <ActuatorBadge key={key} name={key} active={active as boolean} />
                      ))
                    ) : (
                      <p>No actuators available</p>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

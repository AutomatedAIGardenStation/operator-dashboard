import React, { useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonSkeletonText,
} from '@ionic/react';
import { useMonitoringStore } from '../../store/monitoringStore';
import { SensorChart } from './SensorChart';

export const MonitoringPage: React.FC = () => {
  const { zone, range, history, loading, setZone, setRange, fetchHistory } = useMonitoringStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleZoneChange = (e: CustomEvent) => {
    setZone(e.detail.value);
  };

  const handleRangeChange = (e: CustomEvent) => {
    setRange(e.detail.value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Monitoring</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Chamber Zone</IonLabel>
          <IonSelect data-testid="zone-select" value={zone} onIonChange={handleZoneChange}>
            <IonSelectOption value={1}>Zone 1</IonSelectOption>
            <IonSelectOption value={2}>Zone 2</IonSelectOption>
            <IonSelectOption value={3}>Zone 3</IonSelectOption>
            <IonSelectOption value={4}>Zone 4</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonSegment data-testid="range-segment" value={range} onIonChange={handleRangeChange} style={{ margin: '16px 0' }}>
          <IonSegmentButton value="1h">
            <IonLabel>1h</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="6h">
            <IonLabel>6h</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="24h">
            <IonLabel>24h</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div data-testid="loading-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <IonSkeletonText animated style={{ height: '300px', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <SensorChart
              title="Temperature & Humidity"
              data={history}
              dataKeys={[
                { key: 'temp', name: 'Temperature (°C)', color: '#ff7300', yAxisId: 'left' },
                { key: 'humidity', name: 'Humidity (%)', color: '#387908', yAxisId: 'right' },
              ]}
            />
            <SensorChart
              title="Soil Moisture"
              data={history}
              dataKeys={[
                { key: 'soil_moisture', name: 'Soil Moisture (%)', color: '#8884d8', yAxisId: 'left' },
              ]}
            />
            <SensorChart
              title="EC & pH"
              data={history}
              dataKeys={[
                { key: 'ec', name: 'EC (mS/cm)', color: '#82ca9d', yAxisId: 'left' },
                { key: 'ph', name: 'pH', color: '#ffc658', yAxisId: 'right' },
              ]}
            />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

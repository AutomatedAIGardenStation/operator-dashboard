import React, { useState, useRef, useEffect } from 'react';
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonRange,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import * as actuators from '../../api/actuators';

export const ControlsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const [waterZone, setWaterZone] = useState<number>(1);
  const [lightChannels, setLightChannels] = useState<number[]>([0, 0, 0, 0]);
  const [fanSpeed, setFanSpeed] = useState<number>(0);

  const showToast = (message: string, color: 'success' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
  };

  const handleError = (error: any) => {
    // Only log errors in development/production if not in test
    if (import.meta.env.MODE !== 'test') {
      console.error(error);
    }
    showToast('Failed to execute command', 'danger');
  };

  const handleWaterStart = async () => {
    try {
      setLoading(true);
      await actuators.waterStart(waterZone);
      showToast(`Started watering zone ${waterZone}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWaterStopAll = async () => {
    try {
      setLoading(true);
      await actuators.waterStopAll();
      showToast('Stopped all watering');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const lightDebounceTimers = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});

  const handleLightChange = (channelIndex: number, pct: number) => {
    const newChannels = [...lightChannels];
    newChannels[channelIndex] = pct;
    setLightChannels(newChannels);

    if (lightDebounceTimers.current[channelIndex]) {
      clearTimeout(lightDebounceTimers.current[channelIndex]);
    }

    lightDebounceTimers.current[channelIndex] = setTimeout(async () => {
      try {
        await actuators.setLight(channelIndex + 1, pct);
      } catch (error) {
        handleError(error);
      }
    }, 300);
  };

  const fanDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFanChange = (pct: number) => {
    setFanSpeed(pct);

    if (fanDebounceTimer.current) {
      clearTimeout(fanDebounceTimer.current);
    }

    fanDebounceTimer.current = setTimeout(async () => {
      try {
        await actuators.setFan(pct);
      } catch (error) {
        handleError(error);
      }
    }, 300);
  };

  useEffect(() => {
    const timers = lightDebounceTimers.current;
    return () => {
      // Clear all timers on unmount
      Object.values(timers).forEach(clearTimeout);
      if (fanDebounceTimer.current) {
        clearTimeout(fanDebounceTimer.current);
      }
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Controls</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Watering</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Zone</IonLabel>
              <IonSelect
                value={waterZone}
                onIonChange={(e) => setWaterZone(e.detail.value)}
              >
                <IonSelectOption value={1}>Zone 1</IonSelectOption>
                <IonSelectOption value={2}>Zone 2</IonSelectOption>
                <IonSelectOption value={3}>Zone 3</IonSelectOption>
                <IonSelectOption value={4}>Zone 4</IonSelectOption>
              </IonSelect>
            </IonItem>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <IonButton expand="block" onClick={handleWaterStart} disabled={loading}>
                Start
              </IonButton>
              <IonButton expand="block" color="danger" onClick={handleWaterStopAll} disabled={loading}>
                Stop All
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>LED Channels</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {lightChannels.map((pct, index) => (
                <IonItem key={index}>
                  <IonLabel position="stacked">Channel {index + 1} ({pct}%)</IonLabel>
                  <IonRange
                    min={0}
                    max={100}
                    step={1}
                    value={pct}
                    onIonChange={(e) => handleLightChange(index, e.detail.value as number)}
                  />
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Ventilation</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Fan Speed ({fanSpeed}%)</IonLabel>
              <IonRange
                min={0}
                max={100}
                step={1}
                value={fanSpeed}
                onIonChange={(e) => handleFanChange(e.detail.value as number)}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3000}
          color={toastColor}
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};
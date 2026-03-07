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
import { getStatus } from '../../api/system';
import { getSocket } from '../../hooks/useWebSocket';
import { useCapabilitiesStore } from '../../store/capabilitiesStore';
import { GantryPanel } from './GantryPanel';
import { ToolPanel } from './ToolPanel';
import { ValvePanel } from './ValvePanel';
import { DosingPanel } from './DosingPanel';
import { PumpPanel } from './PumpPanel';

export const ControlsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [systemState, setSystemState] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [fetchFailed, setFetchFailed] = useState(false);

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

    const fetchStatus = async () => {
      try {
        const { status } = await getStatus();
        setSystemState(status);
        setFetchFailed(false);
      } catch (e) {
        console.error('Failed to fetch initial system status', e);
        setSystemState('UNKNOWN');
        setFetchFailed(true);
      }
    };
    void fetchStatus();

    const socket = getSocket();
    const handleSystemStatus = (data: { status: string }) => {
      setSystemState(data.status);
    };

    if (socket) {
      socket.on('system.status', handleSystemStatus);
    }

    return () => {
      // Clear all timers on unmount
      Object.values(timers).forEach(clearTimeout);
      if (fanDebounceTimer.current) {
        clearTimeout(fanDebounceTimer.current);
      }
      if (socket) {
        socket.off('system.status', handleSystemStatus);
      }
    };
  }, []);

  const isControlsDisabled = systemState !== 'MANUAL_CONTROL' && systemState !== 'MONITORING';
  const isCapabilityMissing = useCapabilitiesStore((state) => state.isCapabilityMissing);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Controls</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {fetchFailed && (
          <IonCard color="danger" data-testid="offline-banner" style={{ marginBottom: '1rem' }}>
            <IonCardContent style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IonLabel style={{ fontWeight: 'bold' }}>Offline / Degraded</IonLabel>
              <IonLabel>- Unable to communicate with the system. Controls are disabled.</IonLabel>
            </IonCardContent>
          </IonCard>
        )}

        {loading && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {!isCapabilityMissing('POST /actuators/water/start') && (
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
              <IonButton expand="block" onClick={handleWaterStart} disabled={isControlsDisabled || loading}>
                Start
              </IonButton>
              <IonButton expand="block" color="danger" onClick={handleWaterStopAll} disabled={isControlsDisabled || loading}>
                Stop All
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>
        )}

        {!isCapabilityMissing('PUT /actuators/light') && (
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
                    disabled={isControlsDisabled}
                    onIonChange={(e) => handleLightChange(index, e.detail.value as number)}
                  />
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
        )}

        {!isCapabilityMissing('PUT /actuators/fan') && (
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
                disabled={isControlsDisabled}
                onIonChange={(e) => handleFanChange(e.detail.value as number)}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>
        )}

        {!isCapabilityMissing('POST /gantry/move') && (
          <GantryPanel disabled={isControlsDisabled} onSuccess={showToast} onError={(msg) => showToast(msg, 'danger')} />
        )}
        {!isCapabilityMissing('POST /tools/dock') && (
          <ToolPanel disabled={isControlsDisabled} onSuccess={showToast} onError={(msg) => showToast(msg, 'danger')} />
        )}
        {!isCapabilityMissing('POST /valves/set') && (
          <ValvePanel disabled={isControlsDisabled} onSuccess={showToast} onError={(msg) => showToast(msg, 'danger')} />
        )}
        {!isCapabilityMissing('POST /dosing/recipe') && (
          <DosingPanel disabled={isControlsDisabled} onSuccess={showToast} onError={(msg) => showToast(msg, 'danger')} />
        )}
        {!isCapabilityMissing('POST /pump/run') && (
          <PumpPanel disabled={isControlsDisabled} onSuccess={showToast} onError={(msg) => showToast(msg, 'danger')} />
        )}

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
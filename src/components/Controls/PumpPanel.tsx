import React, { useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
} from '@ionic/react';
import { runPump } from '../../api/dosing';

interface PumpPanelProps {
  disabled: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const PumpPanel: React.FC<PumpPanelProps> = ({ disabled, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [durationMs, setDurationMs] = useState<number>(0);

  const handleRunPump = async () => {
    setLoading(true);
    try {
      await runPump({ duration_ms: durationMs });
      onSuccess(`Running pump for ${durationMs}ms`);
    } catch {
      onError('Failed to run pump');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Manifold Pump</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem>
          <IonLabel position="stacked">Duration (ms)</IonLabel>
          <IonInput
            type="number"
            value={durationMs}
            disabled={disabled || loading}
            onIonInput={(e) => setDurationMs(Number(e.detail.value))}
          />
        </IonItem>

        <div style={{ marginTop: '1rem' }}>
          <IonButton expand="block" onClick={handleRunPump} disabled={disabled || loading}>
            {loading ? <IonSpinner name="dots" /> : 'Run Pump'}
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

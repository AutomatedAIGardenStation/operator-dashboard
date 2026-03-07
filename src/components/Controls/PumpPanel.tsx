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
import { useConfirmAction } from '../../hooks/useConfirmAction';

interface PumpPanelProps {
  disabled: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const PumpPanel: React.FC<PumpPanelProps> = ({ disabled, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const confirmAction = useConfirmAction();
  const [durationMs, setDurationMs] = useState<number>(0);

  const handleRunPump = async () => {
    confirmAction(async () => {
      setLoading(true);
      try {
        await runPump({ duration_ms: durationMs });
        onSuccess(`Running pump for ${durationMs}ms`);
      } catch {
        onError('Failed to run pump');
      } finally {
        setLoading(false);
      }
    }, {
      header: 'Confirm Pump',
      message: `Are you sure you want to run the manifold pump for ${durationMs}ms?`,
      color: 'danger',
      confirmText: 'Run Pump',
    });
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

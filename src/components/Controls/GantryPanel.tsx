import React, { useEffect, useState } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { getSocket } from '../../hooks/useWebSocket';
import { moveGantry, homeGantry, getGantryPosition } from '../../api/gantry';
import type { GantryPosition } from '../../api/types';
import { useConfirmAction } from '../../hooks/useConfirmAction';

interface GantryPanelProps {
  disabled: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const GantryPanel: React.FC<GantryPanelProps> = ({ disabled, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const confirmAction = useConfirmAction();
  const [position, setPosition] = useState<GantryPosition>({ x: 0, y: 0, z: 0 });
  const [targetX, setTargetX] = useState<number>(0);
  const [targetY, setTargetY] = useState<number>(0);
  const [targetZ, setTargetZ] = useState<number>(0);

  useEffect(() => {
    const fetchInitialPosition = async () => {
      try {
        const pos = await getGantryPosition();
        setPosition(pos);
        setTargetX(pos.x);
        setTargetY(pos.y);
        setTargetZ(pos.z);
      } catch (e) {
        console.error('Failed to fetch initial gantry position', e);
      }
    };
    void fetchInitialPosition();

    const socket = getSocket();
    if (!socket) return;

    function handlePosition(data: GantryPosition) {
      setPosition((prev) => ({ ...prev, ...data }));
    }

    socket.on('gantry.position', handlePosition);

    return () => {
      socket.off('gantry.position', handlePosition);
    };
  }, []);

  const handleMove = async () => {
    confirmAction(async () => {
      setLoading(true);
      try {
        await moveGantry({ x: targetX, y: targetY, z: targetZ });
        onSuccess(`Moving gantry to X:${targetX} Y:${targetY} Z:${targetZ}`);
      } catch {
        onError('Failed to move gantry');
      } finally {
        setLoading(false);
      }
    }, {
      header: 'Confirm Move',
      message: `Are you sure you want to move the gantry to X:${targetX} Y:${targetY} Z:${targetZ}?`,
    });
  };

  const handleHome = async () => {
    confirmAction(async () => {
      setLoading(true);
      try {
        await homeGantry();
        onSuccess('Homing gantry axes');
      } catch {
        onError('Failed to home gantry');
      } finally {
        setLoading(false);
      }
    }, {
      header: 'Confirm Home Axes',
      message: 'Are you sure you want to home the gantry axes? This may interrupt current operations.',
      color: 'danger',
      confirmText: 'Home Axes',
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Gantry Controls</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Current Position:</strong>
          <div>
            X: {position.x.toFixed(2)} mm | Y: {position.y.toFixed(2)} mm | Z: {position.z.toFixed(2)} mm
            {position.status && ` | Status: ${position.status}`}
          </div>
        </div>

        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol size="4">
              <IonItem>
                <IonLabel position="stacked">Target X</IonLabel>
                <IonInput
                  type="number"
                  value={targetX}
                  disabled={disabled || loading}
                  onIonInput={(e) => setTargetX(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
            <IonCol size="4">
              <IonItem>
                <IonLabel position="stacked">Target Y</IonLabel>
                <IonInput
                  type="number"
                  value={targetY}
                  disabled={disabled || loading}
                  onIonInput={(e) => setTargetY(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
            <IonCol size="4">
              <IonItem>
                <IonLabel position="stacked">Target Z</IonLabel>
                <IonInput
                  type="number"
                  value={targetZ}
                  disabled={disabled || loading}
                  onIonInput={(e) => setTargetZ(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <IonButton expand="block" onClick={handleMove} disabled={disabled || loading}>
            {loading ? <IonSpinner name="dots" /> : 'Move'}
          </IonButton>
          <IonButton expand="block" color="warning" onClick={handleHome} disabled={disabled || loading}>
            {loading ? <IonSpinner name="dots" /> : 'Home Axes'}
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

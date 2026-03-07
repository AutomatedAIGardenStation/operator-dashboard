import React, { useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSpinner,
} from '@ionic/react';
import { setValve } from '../../api/valves';
import { useConfirmAction } from '../../hooks/useConfirmAction';

interface ValvePanelProps {
  disabled: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const VALVES = [
  { id: 'NutA', label: 'Nutrient A' },
  { id: 'NutB', label: 'Nutrient B' },
  { id: 'pH_Up', label: 'pH Up' },
  { id: 'pH_Down', label: 'pH Down' },
  { id: 'CO2', label: 'CO2 Solenoid' },
];

export const ValvePanel: React.FC<ValvePanelProps> = ({ disabled, onSuccess, onError }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const confirmAction = useConfirmAction();
  const [valveStates, setValveStates] = useState<Record<string, boolean>>({});

  const handleToggle = async (valveId: string, state: boolean) => {
    const valveName = VALVES.find(v => v.id === valveId)?.label || valveId;
    confirmAction(async () => {
      setLoading(valveId);
      try {
        await setValve({ valve_id: valveId, state });
        setValveStates((prev) => ({ ...prev, [valveId]: state }));
        onSuccess(`Toggled valve ${valveId} to ${state ? 'ON' : 'OFF'}`);
      } catch {
        // revert the optimistic toggle if it failed
        setValveStates((prev) => ({ ...prev, [valveId]: !state }));
        onError(`Failed to toggle valve ${valveId}`);
      } finally {
        setLoading(null);
      }
    }, {
      header: 'Confirm Valve Toggle',
      message: `Are you sure you want to turn ${state ? 'ON' : 'OFF'} the ${valveName} valve?`,
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Valves</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {VALVES.map((v) => (
            <IonItem key={v.id}>
              <IonLabel>{v.label}</IonLabel>
              {loading === v.id ? (
                <IonSpinner name="dots" />
              ) : (
                <IonToggle
                  checked={valveStates[v.id] || false}
                  disabled={disabled}
                  onIonChange={(e) => {
                    // Prevent infinite loop from React controlled component state updates
                    if (valveStates[v.id] !== e.detail.checked) {
                      handleToggle(v.id, e.detail.checked);
                    }
                  }}
                />
              )}
            </IonItem>
          ))}
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};

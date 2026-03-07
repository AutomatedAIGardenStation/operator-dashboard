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
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { triggerDosingRecipe } from '../../api/dosing';
import { useConfirmAction } from '../../hooks/useConfirmAction';

interface DosingPanelProps {
  disabled: boolean;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const DosingPanel: React.FC<DosingPanelProps> = ({ disabled, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const confirmAction = useConfirmAction();
  const [nutA, setNutA] = useState(0);
  const [nutB, setNutB] = useState(0);
  const [phUp, setPhUp] = useState(0);
  const [phDown, setPhDown] = useState(0);

  const handleDose = async () => {
    confirmAction(async () => {
      setLoading(true);
      try {
        await triggerDosingRecipe({
          nut_a_ms: nutA,
          nut_b_ms: nutB,
          ph_up_ms: phUp,
          ph_down_ms: phDown,
        });
        onSuccess('Dosing recipe triggered');
      } catch {
        onError('Failed to trigger dosing recipe');
      } finally {
        setLoading(false);
      }
    }, {
      header: 'Confirm Dosing',
      message: `Are you sure you want to trigger a dosing recipe? NutA: ${nutA}ms, NutB: ${nutB}ms, pH Up: ${phUp}ms, pH Down: ${phDown}ms.`,
    });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Dosing Recipe</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonGrid className="ion-no-padding">
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Nutrient A (ms)</IonLabel>
                <IonInput
                  type="number"
                  value={nutA}
                  disabled={disabled || loading}
                  onIonInput={(e) => setNutA(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">Nutrient B (ms)</IonLabel>
                <IonInput
                  type="number"
                  value={nutB}
                  disabled={disabled || loading}
                  onIonInput={(e) => setNutB(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">pH Up (ms)</IonLabel>
                <IonInput
                  type="number"
                  value={phUp}
                  disabled={disabled || loading}
                  onIonInput={(e) => setPhUp(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
            <IonCol size="6">
              <IonItem>
                <IonLabel position="stacked">pH Down (ms)</IonLabel>
                <IonInput
                  type="number"
                  value={phDown}
                  disabled={disabled || loading}
                  onIonInput={(e) => setPhDown(Number(e.detail.value))}
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div style={{ marginTop: '1rem' }}>
          <IonButton expand="block" onClick={handleDose} disabled={disabled || loading}>
            {loading ? <IonSpinner name="dots" /> : 'Trigger Dose'}
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

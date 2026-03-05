import React, { useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonProgressBar,
  IonSpinner,
  IonText,
  useIonToast
} from '@ionic/react';
import { usePlantsStore } from '../../store/plantsStore';

export const HarvestQueuePage: React.FC = () => {
  const { harvestQueue, plants, loading, error, fetchHarvestQueue, triggerHarvest, fetchPlants } = usePlantsStore();
  const [presentToast] = useIonToast();

  useEffect(() => {
    fetchPlants();
    fetchHarvestQueue();
  }, [fetchPlants, fetchHarvestQueue]);

  const handleTrigger = async (id: string) => {
    try {
      await triggerHarvest(id);
      presentToast({
        message: 'Harvest triggered successfully',
        duration: 2000,
        color: 'success',
      });
    } catch (err: any) {
      presentToast({
        message: `Failed to trigger harvest: ${err.message}`,
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const getPlantName = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    return plant ? plant.name : `Plant #${plantId}`;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Harvest Queue</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading && harvestQueue.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        ) : error ? (
          <div className="ion-text-center ion-padding">
            <IonText color="danger">{error}</IonText>
          </div>
        ) : harvestQueue.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonText color="medium">No harvest jobs in the queue.</IonText>
          </div>
        ) : (
          <IonList>
            {harvestQueue.map((job) => (
              <IonItem key={job.id}>
                <IonLabel>
                  <h2>{getPlantName(job.plant_id)}</h2>
                  <p>Status: {job.status}</p>
                  <p>
                    Confidence: {(job.confidence * 100).toFixed(0)}%
                  </p>
                  <IonProgressBar
                    value={job.confidence}
                    color={job.confidence > 0.8 ? 'success' : 'warning'}
                  />
                </IonLabel>
                <div slot="end" className="ion-text-right">
                  <IonBadge color={job.status === 'ready' ? 'success' : 'medium'} className="ion-margin-bottom">
                    {job.status}
                  </IonBadge>
                  <br />
                  <IonButton
                    size="small"
                    onClick={() => handleTrigger(job.id)}
                    disabled={loading || job.status !== 'ready'}
                    data-testid="trigger-harvest-button"
                  >
                    Trigger Harvest
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

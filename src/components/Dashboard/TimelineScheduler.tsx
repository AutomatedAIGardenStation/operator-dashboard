import React, { useEffect, useMemo } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonText,
  IonIcon,
} from '@ionic/react';
import { timeOutline } from 'ionicons/icons';
import { usePlantsStore } from '../../store/plantsStore';

export const TimelineScheduler: React.FC = () => {
  const { harvestQueue, plants, fetchHarvestQueue, fetchPlants } = usePlantsStore();

  useEffect(() => {
    // Only fetch if they aren't loaded yet, or always fetch?
    // Dashboard might not load them by default. Let's fetch them.
    void fetchPlants();
    void fetchHarvestQueue();
  }, [fetchPlants, fetchHarvestQueue]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = harvestQueue.filter((job) => {
      // Only include jobs that are scheduled
      if (!job.scheduled_at) return false;
      const scheduledTime = new Date(job.scheduled_at);
      // Scheduled within the next 24 hours
      return scheduledTime >= now && scheduledTime <= tomorrow;
    });

    // Sort chronologically
    tasks.sort((a, b) => {
      return new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime();
    });

    return tasks;
  }, [harvestQueue]);

  const getPlantName = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    return plant ? plant.name : `Plant #${plantId}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>24-Hour Task Agenda</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {upcomingTasks.length === 0 ? (
          <IonText color="medium">
            <p className="ion-text-center">No tasks scheduled for the next 24 hours.</p>
          </IonText>
        ) : (
          <IonList>
            {upcomingTasks.map((job) => (
              <IonItem key={job.id}>
                <IonIcon icon={timeOutline} slot="start" color="primary" />
                <IonLabel>
                  <h2>{getPlantName(job.plant_id)} Harvest</h2>
                  <p>Priority: {job.priority || 'normal'}</p>
                </IonLabel>
                <div slot="end" className="ion-text-right">
                  <IonBadge color="primary" className="ion-margin-bottom">
                    {formatTime(job.scheduled_at!)}
                  </IonBadge>
                  <br />
                  <IonText color={job.status === 'ready' ? 'success' : 'medium'} style={{ fontSize: '0.8em' }}>
                    {job.status}
                  </IonText>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonCardContent>
    </IonCard>
  );
};

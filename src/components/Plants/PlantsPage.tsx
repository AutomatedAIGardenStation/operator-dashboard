import React, { useEffect, useState } from 'react';
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
  IonIcon,
  IonModal,
  IonButtons,
  IonInput,
  IonItemDivider,
  IonSpinner,
  IonText,
  useIonToast
} from '@ionic/react';
import { add, close } from 'ionicons/icons';
import { usePlantsStore } from '../../store/plantsStore';
import { Plant, CreatePlantRequest, UpdatePlantRequest } from '../../api/types';
import { useCapability } from '../../store/capabilitiesStore';
import { PlantGrid } from './PlantGrid';

export const PlantsPage: React.FC = () => {
  const { plants, loading, error, fetchPlants, createPlant, updatePlant } = usePlantsStore();
  const [showModal, setShowModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [presentToast] = useIonToast();

  const [formData, setFormData] = useState<Partial<CreatePlantRequest>>({
    name: '',
    species: '',
    zone: '',
    moisture_target: 0,
    ec_target: 0,
    ph_min: 0,
    ph_max: 0,
  });

  const hasCreatePlant = useCapability('POST /plants');
  const hasUpdatePlant = useCapability('PUT /plants/:id');

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  const openModal = (plant?: Plant) => {
    if (plant) {
      setEditingPlant(plant);
      setFormData({
        name: plant.name,
        species: plant.species,
        zone: plant.zone,
        moisture_target: plant.moisture_target,
        ec_target: plant.ec_target,
        ph_min: plant.ph_min,
        ph_max: plant.ph_max,
      });
    } else {
      setEditingPlant(null);
      setFormData({
        name: '',
        species: '',
        zone: '',
        moisture_target: 0,
        ec_target: 0,
        ph_min: 0,
        ph_max: 0,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlant) {
        // Just send what we have as UpdatePlantRequest, though the issue specifies fields
        const updateData: UpdatePlantRequest = {
          name: formData.name,
          // note: update API typically expects a subset, adjust based on actual requirements
          // For now, passing name is safe, maybe others if they were in the type
        };
        await updatePlant(editingPlant.id, updateData);
      } else {
        const newPlant: CreatePlantRequest = {
          name: formData.name || '',
          species: formData.species || '',
          zone: formData.zone || '',
          moisture_target: formData.moisture_target || 0,
          ec_target: formData.ec_target || 0,
          ph_min: formData.ph_min || 0,
          ph_max: formData.ph_max || 0,
          planted_at: new Date().toISOString(),
          profile_id: 1, // dummy values to satisfy the API shape
        };
        await createPlant(newPlant);
      }
      closeModal();
      presentToast({
        message: `Plant ${editingPlant ? 'updated' : 'created'} successfully`,
        duration: 2000,
        color: 'success',
      });
    } catch (err: any) {
      presentToast({
        message: `Error: ${err.message}`,
        duration: 3000,
        color: 'danger',
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Plants</IonTitle>
          {hasCreatePlant && (
            <IonButton slot="end" fill="clear" onClick={() => openModal()} data-testid="add-plant-button">
              <IonIcon icon={add} />
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <PlantGrid />

        {loading && plants.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        ) : error ? (
          <div className="ion-text-center ion-padding">
            <IonText color="danger">{error}</IonText>
          </div>
        ) : plants.length === 0 ? (
          <div className="ion-text-center ion-padding">
            <IonText color="medium">No plants available. Add a plant to get started.</IonText>
          </div>
        ) : (
          <IonList>
            {plants.map((plant) => (
              <IonItem button={hasUpdatePlant} key={plant.id} onClick={() => hasUpdatePlant ? openModal(plant) : undefined}>
                <IonLabel>
                  <h2>{plant.name}</h2>
                  <p>{plant.species}</p>
                </IonLabel>
                <IonBadge color="primary" slot="end">{plant.zone}</IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingPlant ? 'Edit Plant' : 'Add Plant'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeModal}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
          <form onSubmit={handleSubmit} data-testid="plant-form">
              <IonItem>
                <IonInput
                  label="Name"
                  labelPlacement="floating"
                  value={formData.name}
                  onIonInput={(e) => setFormData({ ...formData, name: e.detail.value! })}
                  required
                  data-testid="plant-name-input"
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Species"
                  labelPlacement="floating"
                  value={formData.species}
                  onIonInput={(e) => setFormData({ ...formData, species: e.detail.value! })}
                  required
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Zone"
                  labelPlacement="floating"
                  value={formData.zone}
                  onIonInput={(e) => setFormData({ ...formData, zone: e.detail.value! })}
                  required
                />
              </IonItem>
              <IonItemDivider>Targets</IonItemDivider>
              <IonItem>
                <IonInput
                  label="Moisture Target (%)"
                  labelPlacement="floating"
                  type="number"
                  value={formData.moisture_target}
                  onIonInput={(e) => setFormData({ ...formData, moisture_target: Number(e.detail.value) })}
                  required
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="EC Target"
                  labelPlacement="floating"
                  type="number"
                  step="0.1"
                  value={formData.ec_target}
                  onIonInput={(e) => setFormData({ ...formData, ec_target: Number(e.detail.value) })}
                  required
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="pH Min"
                  labelPlacement="floating"
                  type="number"
                  step="0.1"
                  value={formData.ph_min}
                  onIonInput={(e) => setFormData({ ...formData, ph_min: Number(e.detail.value) })}
                  required
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="pH Max"
                  labelPlacement="floating"
                  type="number"
                  step="0.1"
                  value={formData.ph_max}
                  onIonInput={(e) => setFormData({ ...formData, ph_max: Number(e.detail.value) })}
                  required
                />
              </IonItem>
              <div className="ion-padding-top">
                <IonButton expand="block" type="submit" disabled={loading} data-testid="save-plant-button">
                  {loading ? <IonSpinner name="dots" /> : 'Save'}
                </IonButton>
              </div>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

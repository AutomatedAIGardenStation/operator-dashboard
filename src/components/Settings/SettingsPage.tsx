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
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonItemGroup,
  IonItemDivider,
  IonInput,
  IonButton,
  useIonToast,
} from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import pkg from '../../../package.json';
import { updateThresholds } from '../../api/system';
import { ThresholdConfig } from '../../api/types';
import { useCapability } from '../../store/capabilitiesStore';

export const SettingsPage: React.FC = () => {
  const [presentToast] = useIonToast();

  // Notification states
  const [notifyLowTank, setNotifyLowTank] = useState(false);
  const [notifyOvercurrent, setNotifyOvercurrent] = useState(false);
  const [notifyHarvestReady, setNotifyHarvestReady] = useState(false);
  const [notifySystemFault, setNotifySystemFault] = useState(false);

  // Threshold states
  const [thresholds, setThresholds] = useState<ThresholdConfig>({
    temp_max: '',
    temp_min: '',
    moisture_low: '',
    ec_high: '',
  });

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const getPrefBool = async (key: string) => {
        const { value } = await Preferences.get({ key });
        return value === 'true';
      };

      setNotifyLowTank(await getPrefBool('notify_low_tank'));
      setNotifyOvercurrent(await getPrefBool('notify_overcurrent'));
      setNotifyHarvestReady(await getPrefBool('notify_harvest_ready'));
      setNotifySystemFault(await getPrefBool('notify_system_fault'));
    };

    void loadPreferences();
  }, []);

  const handleToggle = async (key: string, value: boolean, setter: (val: boolean) => void) => {
    setter(value);
    await Preferences.set({ key, value: String(value) });
  };

  const handleThresholdChange = (key: keyof ThresholdConfig, value: string) => {
    setThresholds((prev) => ({ ...prev, [key]: value }));
  };

  const hasUpdateConfig = useCapability('PUT /system/config');

  const saveThresholds = async () => {
    try {
      await updateThresholds(thresholds);
      presentToast({
        message: 'Thresholds saved successfully',
        duration: 2000,
        color: 'success',
      });
    } catch (error) {
      console.error('Failed to save thresholds:', error);
      presentToast({
        message: 'Failed to save thresholds',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {/* Notifications Section */}
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Notifications</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonLabel>Low Tank</IonLabel>
              <IonToggle
                slot="end"
                checked={notifyLowTank}
                onIonChange={(e) => handleToggle('notify_low_tank', e.detail.checked, setNotifyLowTank)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Overcurrent</IonLabel>
              <IonToggle
                slot="end"
                checked={notifyOvercurrent}
                onIonChange={(e) => handleToggle('notify_overcurrent', e.detail.checked, setNotifyOvercurrent)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>Harvest Ready</IonLabel>
              <IonToggle
                slot="end"
                checked={notifyHarvestReady}
                onIonChange={(e) => handleToggle('notify_harvest_ready', e.detail.checked, setNotifyHarvestReady)}
              />
            </IonItem>
            <IonItem>
              <IonLabel>System Fault</IonLabel>
              <IonToggle
                slot="end"
                checked={notifySystemFault}
                onIonChange={(e) => handleToggle('notify_system_fault', e.detail.checked, setNotifySystemFault)}
              />
            </IonItem>
          </IonItemGroup>

          {/* Thresholds Section */}
          {hasUpdateConfig && (
            <IonItemGroup>
              <IonItemDivider>
                <IonLabel>Sensor Thresholds</IonLabel>
              </IonItemDivider>
              <IonItem>
                <IonInput
                  id="temp_max"
                  label="Max Temperature"
                  labelPlacement="stacked"
                  type="number"
                  value={thresholds.temp_max}
                  onIonInput={(e) => handleThresholdChange('temp_max', e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  id="temp_min"
                  label="Min Temperature"
                  labelPlacement="stacked"
                  type="number"
                  value={thresholds.temp_min}
                  onIonInput={(e) => handleThresholdChange('temp_min', e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  id="moisture_low"
                  label="Low Moisture"
                  labelPlacement="stacked"
                  type="number"
                  value={thresholds.moisture_low}
                  onIonInput={(e) => handleThresholdChange('moisture_low', e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  id="ec_high"
                  label="High EC"
                  labelPlacement="stacked"
                  type="number"
                  value={thresholds.ec_high}
                  onIonInput={(e) => handleThresholdChange('ec_high', e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonButton expand="block" onClick={saveThresholds} style={{ width: '100%' }}>
                  Save Thresholds
                </IonButton>
              </IonItem>
            </IonItemGroup>
          )}

          {/* Display Section (existing, kept disabled as requested/present originally) */}
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Display</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonLabel>Temperature Unit</IonLabel>
              <IonSelect value="celsius" disabled>
                <IonSelectOption value="celsius">Celsius</IonSelectOption>
                <IonSelectOption value="fahrenheit">Fahrenheit</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel>Dark Mode</IonLabel>
              <IonToggle slot="end" disabled />
            </IonItem>
          </IonItemGroup>

          {/* About Section */}
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>About</IonLabel>
            </IonItemDivider>
            <IonItem>
              <IonLabel>App Version</IonLabel>
              <IonLabel slot="end" color="medium">{pkg.version}</IonLabel>
            </IonItem>
            <IonItem button href="https://docs.gardenstation.local">
              <IonLabel>Documentation Portal</IonLabel>
            </IonItem>
            <IonItem button href="https://gardenstation.local/privacy">
              <IonLabel>Privacy Policy</IonLabel>
            </IonItem>
          </IonItemGroup>

          {/* Account Section (existing, kept disabled) */}
          <IonItemGroup>
            <IonItemDivider>
              <IonLabel>Account</IonLabel>
            </IonItemDivider>
            <IonItem button disabled>
              <IonLabel>Profile</IonLabel>
            </IonItem>
            <IonItem button disabled>
              <IonLabel color="danger">Logout</IonLabel>
            </IonItem>
          </IonItemGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

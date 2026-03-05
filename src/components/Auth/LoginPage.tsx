import React, { useState } from 'react';
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
  IonItem,
  IonInput,
  IonButton,
  IonSpinner,
  useIonToast
} from '@ionic/react';

import { useHistory } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const history = useHistory();
  const login = useAuthStore(state => state.login);
  const [presentToast] = useIonToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      history.push('/dashboard');
    } catch (error: any) {
      presentToast({
        message: error?.response?.data?.message || 'Invalid credentials. Please try again.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>GardenStation</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-text-center">
        <IonCard style={{ maxWidth: 400, margin: '2rem auto' }}>
          <IonCardHeader>
            <IonCardTitle>Login</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={handleLogin}>
              <IonItem>
                <IonInput
                  id="email"
                  label="Email"
                  labelPlacement="floating"
                  type="email"
                  value={email}
                  onIonInput={e => setEmail(e.detail.value!)}
                  required
                />
              </IonItem>
              <IonItem>
                <IonInput
                  id="password"
                  label="Password"
                  labelPlacement="floating"
                  type="password"
                  value={password}
                  onIonInput={e => setPassword(e.detail.value!)}
                  required
                />
              </IonItem>
              <IonButton expand="block" type="submit" className="ion-margin-top" disabled={loading}>
                {loading ? <IonSpinner name="crescent" /> : 'Sign In'}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

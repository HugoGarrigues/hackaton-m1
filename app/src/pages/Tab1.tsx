import { camera, trash, heart } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton
} from '@ionic/react';
import './Tab1.css';
import { usePhotoGallery } from '../hooks/usePhotoGallery';

const Tab1: React.FC = () => {
  const { photos, takePhoto, deletePhoto, toggleLike } = usePhotoGallery();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Macron Pipi</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {photos.map((photo) => (
              <IonCol size="6" key={photo.filepath}>
                <IonImg src={photo.webviewPath} style={{ borderRadius: '8px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  {/* Bouton Like */}
                  <IonButton
                    fill="solid"
                    color={photo.liked ? 'danger' : 'light'}
                    expand="block"
                    onClick={() => toggleLike(photo)}
                    style={{ flex: 1, marginRight: '0.25rem' }}
                  >
                    <IonIcon icon={heart} slot="icon-only" />
                  </IonButton>

                  {/* Bouton Supprimer */}
                  <IonButton
                    color="danger"
                    expand="block"
                    onClick={() => deletePhoto(photo)}
                    style={{ flex: 1, marginLeft: '0.25rem' }}
                  >
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonButton>
                </div>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

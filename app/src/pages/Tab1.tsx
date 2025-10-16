import { camera, trash, close } from 'ionicons/icons';
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
  IonActionSheet,
  IonButton
} from '@ionic/react';
import './Tab1.css';
import { usePhotoGallery } from '../hooks/usePhotoGallery';

const Tab1: React.FC = () => {
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
        <IonContent>
          <IonGrid>
    <IonRow>
      {photos.map((photo, index) => (
        <IonCol size="6" key={photo.filepath}>
          <IonImg src={photo.webviewPath} />
          <IonButton
      color="danger"
      expand="block"
      onClick={() => deletePhoto(photo)}
      style={{ marginTop: '0.5rem' }}
    >
      Supprimer
    </IonButton>
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
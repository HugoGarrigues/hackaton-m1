import { useState } from 'react';
import { camera, trash, heart, close, chevronBack, chevronForward } from 'ionicons/icons';
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
  IonButton,
  IonModal,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonLabel
} from '@ionic/react';
import './Tab1.css';
import { usePhotoGallery, UserPhoto } from '../hooks/usePhotoGallery';

const Tab1: React.FC = () => {
  const { photos, takePhoto, deletePhoto, toggleLike } = usePhotoGallery();

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const showPrev = () => {
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  const showNext = () => {
    setCurrentIndex(prev => (prev + 1) % photos.length);
  };

  // helper to avoid crash if photos empty
  const currentPhoto = photos && photos.length ? photos[currentIndex] : null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Galerie</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={photo.filepath}>
                <div style={{ position: 'relative' }}>
                  <IonImg
                    src={photo.webviewPath}
                    onClick={() => openModal(index)}
                    style={{ cursor: 'pointer', borderRadius: 6 }}
                    alt="photo"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <IonButton
                    fill="solid"
                    color={photo.liked ? 'danger' : 'light'}
                    onClick={() => toggleLike(photo)}
                    style={{ flex: 1, marginRight: '0.25rem' }}
                  >
                    <IonIcon icon={heart} slot="icon-only" />
                  </IonButton>

                  <IonButton
                    color="danger"
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
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>

        {/* Modal plein écran pour afficher la photo en grand */}
        <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={closeModal}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
              <IonTitle>{currentPhoto ? currentPhoto.filepath : ''}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => currentPhoto && toggleLike(currentPhoto)}>
                  <IonIcon icon={heart} style={{ color: currentPhoto?.liked ? 'red' : undefined }} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="modal-content">
            <div
              className="modal-img-wrap"
              style={{
                display: 'flex',
                flexDirection: 'column', // image au dessus, texte en dessous
                alignItems: 'center',    // centre horizontalement
                justifyContent: 'center',
                height: '100%',
              }}
            >
              {currentPhoto ? (
                <>
                  <IonImg
                    className="fullscreen-img"
                    src={currentPhoto.webviewPath}
                    style={{ maxWidth: '100%', maxHeight: '80%', marginBottom: 4 }}
                  />
                  <p style={{
                    color: '#fff',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    margin: 0,
                    padding: 0
                  }}>
                    {currentPhoto.date ? new Date(currentPhoto.date).toLocaleString() : ''}
                  </p>
                </>
              ) : (
                <div>Aucune image</div>
              )}
            </div>
          </IonContent>

          <IonFooter>
            <IonToolbar>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <IonButton onClick={showPrev}>
                    <IonIcon icon={chevronBack} />
                  </IonButton>
                  <IonButton onClick={showNext}>
                    <IonIcon icon={chevronForward} />
                  </IonButton>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <IonButton color="danger" onClick={() => currentPhoto && deletePhoto(currentPhoto)}>
                    <IonIcon icon={trash} />
                    &nbsp;Supprimer
                  </IonButton>
                </div>
              </div>
            </IonToolbar>
          </IonFooter>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

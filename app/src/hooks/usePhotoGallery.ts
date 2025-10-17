import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

const PHOTO_STORAGE = 'photos';

export function usePhotoGallery() {
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  const savePicture = async (
    photo: Photo,
    fileName: string,
    location?: { lat: number; lon: number }
  ): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webPath!);
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
      liked: false,
      date: new Date().toISOString(),
      location,
    };
  };

  useEffect(() => {
    const loadSaved = async () => {
      const { value } = await Preferences.get({ key: PHOTO_STORAGE });
      const photosInPreferences = (value ? JSON.parse(value) : []) as UserPhoto[];

      for (let photo of photosInPreferences) {
        const file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });
        photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
      }
      setPhotos(photosInPreferences);
    };
    loadSaved();
  }, []);

  const deletePhoto = async (photo: UserPhoto) => {
    const newPhotos = photos.filter((p) => p.filepath !== photo.filepath);
    await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
    await Filesystem.deleteFile({ path: photo.filepath, directory: Directory.Data });
    setPhotos(newPhotos);
    try {
      window.dispatchEvent(new CustomEvent('photosUpdated', { detail: newPhotos }));
    } catch (e) {
      // ignore if window not available
    }
  };

  const toggleLike = async (photo: UserPhoto) => {
    const updatedPhotos = photos.map((p) =>
      p.filepath === photo.filepath ? { ...p, liked: !p.liked } : p
    );
    setPhotos(updatedPhotos);
    await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(updatedPhotos) });
    try {
      window.dispatchEvent(new CustomEvent('photosUpdated', { detail: updatedPhotos }));
    } catch (e) {
      // ignore
    }
  };

  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });

    let location;
    try {
      const position = await Geolocation.getCurrentPosition();
      location = { lat: position.coords.latitude, lon: position.coords.longitude };
    } catch (e) {
      console.warn('Impossible de récupérer la position GPS', e);
    }

    const fileName = Date.now() + '.jpeg';
    const savedFileImage = await savePicture(photo, fileName, location);
    const newPhotos = [savedFileImage, ...photos];
    setPhotos(newPhotos);
    await Preferences.set({ key: PHOTO_STORAGE, value: JSON.stringify(newPhotos) });
    try {
      window.dispatchEvent(new CustomEvent('photosUpdated', { detail: newPhotos }));
    } catch (e) {
      // ignore
    }
  };

  return {
    photos,
    takePhoto,
    savePicture,
    deletePhoto,
    toggleLike,
    location: Geolocation,
  };
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  liked?: boolean;
  date?: string;
  location?: { lat: number; lon: number };
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('method did not return a string');
      }
    };
    reader.readAsDataURL(blob);
  });
}

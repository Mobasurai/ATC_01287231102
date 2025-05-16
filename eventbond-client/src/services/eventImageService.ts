import api from './api';
import type { EventImage } from '../types';

/**
 * Uploads an image for a given event.
 * @param eventId The ID of the event.
 * @param formData The FormData object containing the file and optionally isPrimary flag.
 * @returns A promise that resolves to the uploaded EventImage.
 */
export const uploadEventImage = async (eventId: number, _file: File, _p0: boolean, formData: FormData): Promise<EventImage> => {
  const response = await api.post<EventImage>(`/eventImages/uploadEventImage/${eventId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Sets a specific image as the primary image for its event.
 * @param imageId The ID of the image to set as primary.
 * @returns A promise that resolves to the updated EventImage (now primary).
 */
export const setPrimaryEventImage = async (imageId: number): Promise<EventImage> => {
  const response = await api.patch<EventImage>(`/eventImages/${imageId}/set-primary`);
  return response.data;
};

/**
 * Deletes a specific event image.
 * @param imageId The ID of the image to delete.
 * @returns A promise that resolves when the image is deleted.
 */
export const deleteEventImage = async (imageId: number): Promise<void> => {
  await api.delete(`/eventImages/deleteImage/${imageId}`);
};

/**
 * Gets all images for a specific event.
 * @param eventId The ID of the event.
 * @returns A promise that resolves to an array of EventImages.
 */
export const getEventImages = async (eventId: number): Promise<EventImage[]> => {
  const response = await api.get<EventImage[]>(`/eventImages/getEventImages/${eventId}`);
  return response.data;
}; 
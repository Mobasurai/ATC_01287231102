import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EventImageUploadResponse {
  id: number;
  imageUrl: string; 
  isPrimary: boolean;
  eventId: number;
}

export interface EventImageRef {
  id: number;
  isPrimary?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EventImageService {
  private baseApiUrl = `${environment.apiUrl}/eventImages`;

  constructor(private http: HttpClient) {}

  uploadImage(
    eventId: number,
    file: File,
    isPrimary: boolean,
  ): Observable<EventImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary.toString());

    return this.http.post<EventImageUploadResponse>(
      `${this.baseApiUrl}/uploadEventImage/${eventId}`,
      formData,
    );
  }

  getImagesByEvent(eventId: number): Observable<EventImageRef[]> {
    return this.http.get<EventImageRef[]>(
      `${this.baseApiUrl}/getEventImages/${eventId}`,
    );
  }

  getImageUrl(imageId: number): string {
    return `${this.baseApiUrl}/getImage/${imageId}`;
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}/deleteImage/${imageId}`);
  }
}

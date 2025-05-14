import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Re-using the Category interface from EventService, ensure it's accessible
// or redefine/import if necessary. For now, assuming it's:
export interface Category {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/getCategories`) // Assuming endpoint is /getCategories
      .pipe(
        catchError(this.handleError)
      );
  }

  createCategory(categoryData: { name: string }): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/createCategory`, categoryData) // Assuming endpoint is /createCategory
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred in CategoryService!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

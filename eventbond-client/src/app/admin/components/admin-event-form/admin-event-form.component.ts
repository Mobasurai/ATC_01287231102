import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Event } from '../../../core/services/event.service';
import { CategoryService, Category } from '../../../core/services/category.service';
import { Subscription, Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-event-form.component.html',
  styleUrls: ['./admin-event-form.component.css']
})
export class AdminEventFormComponent implements OnInit, OnDestroy {
  eventForm: FormGroup;
  isEditMode = false;
  eventId: string | null = null;
  isLoading = false;
  error: string | null = null;
  categories$: Observable<Category[]> | undefined;
  private routeSub: Subscription | undefined;
  private categorySub: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      organizer: ['', Validators.required],
      selectedCategoryId: ['', Validators.required],
      newCategoryName: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      seatsAvailable: [0, [Validators.required, Validators.min(0)]],
      mainImageFile: [null],
      additionalImageFiles: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      if (this.eventId) {
        this.isEditMode = true;
        this.isLoading = true;
        this.eventService.getEventById(this.eventId).subscribe({
          next: (event) => {
            if (event) {
              this.eventForm.patchValue({
                name: event.title,
                date: event.startDate.split('T')[0],
                time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Assuming startDate is ISO string
                location: event.venue,
                description: event.description,
                organizer: event.organizer,
                selectedCategoryId: event.category?.id || '',
                price: event.price,
                seatsAvailable: event.seatsAvailable
              });
            } else {
              this.error = 'Event not found.';
            }
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Failed to load event details.';
            this.isLoading = false;
            console.error(err);
          }
        });
      }
    });

    this.eventForm.get('newCategoryName')?.valueChanges.subscribe(value => {
      if (value) {
        this.eventForm.get('selectedCategoryId')?.disable();
        this.eventForm.get('selectedCategoryId')?.reset('', { emitEvent: false });
      } else {
        this.eventForm.get('selectedCategoryId')?.enable();
      }
    });

    this.eventForm.get('selectedCategoryId')?.valueChanges.subscribe(value => {
      if (value) {
        this.eventForm.get('newCategoryName')?.disable();
        this.eventForm.get('newCategoryName')?.reset('', { emitEvent: false });
      } else {
        this.eventForm.get('newCategoryName')?.enable();
      }
    });
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getCategories().pipe(
      catchError(err => {
        this.error = 'Failed to load categories.';
        console.error(err);
        return of([]);
      })
    );
  }

  get additionalImageFilesArray(): FormArray {
    return this.eventForm.get('additionalImageFiles') as FormArray;
  }

  addAdditionalImageField(): void {
    this.additionalImageFilesArray.push(this.fb.control(null));
  }

  onMainImageSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.eventForm.patchValue({ mainImageFile: file });
      this.eventForm.get('mainImageFile')?.updateValueAndValidity();
    }
  }

  onAdditionalImageSelected(event: any, index: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.additionalImageFilesArray.at(index).setValue(file);
    }
  }

  removeAdditionalImageField(index: number): void {
    this.additionalImageFilesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      if (this.eventForm.get('selectedCategoryId')?.hasError('required') && !this.eventForm.get('newCategoryName')?.value) {
         this.error = 'Please select an existing category or enter a name for a new category.';
      } else {
        this.error = 'Please fill all required fields correctly.';
      }
      this.eventForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.error = null;

    const formValue = this.eventForm.value;

    this.getCategoryId(formValue.selectedCategoryId, formValue.newCategoryName).pipe(
      switchMap(categoryId => {
        if (!categoryId) {
          return throwError(() => new Error('Category ID could not be determined.'));
        }

        let isoStartDate = '';
        let isoEndDate = '';
        try {
          const combinedStartDate = `${formValue.date}T${formValue.time}:00`;
          isoStartDate = new Date(combinedStartDate).toISOString();
          isoEndDate = isoStartDate; 
        } catch (e) {
          return throwError(() => new Error('Invalid date or time value.'));
        }

        const eventPayload = {
          title: formValue.name,
          description: formValue.description,
          startDate: isoStartDate,
          endDate: isoEndDate,
          venue: formValue.location,
          price: formValue.price,
          categoryId: categoryId
        };

        const formData = new FormData();
        formData.append('eventData', JSON.stringify(eventPayload));

        const mainImage = this.eventForm.get('mainImageFile')?.value;
        if (mainImage) {
          formData.append('mainImage', mainImage);
        }

        this.additionalImageFilesArray.controls.forEach((control, index) => {
          const file = control.value;
          if (file) {
            formData.append('additionalImages', file);
          }
        });
        
        if (this.isEditMode && this.eventId) {
          return this.eventService.updateEventWithFiles(this.eventId, formData);
        } else {
          return this.eventService.createEventWithFiles(formData);
        }
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/admin/events']);
      },
      error: (err) => {
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} event. ${err.message || ''}`;
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private getCategoryId(selectedId: number | string, newName: string): Observable<number> {
    if (newName && newName.trim() !== '') {
      return this.categoryService.createCategory({ name: newName.trim() }).pipe(
        map(newCategory => newCategory.id),
        catchError(err => {
          console.error('Error creating new category:', err);
          return throwError(() => new Error('Failed to create new category.'));
        })
      );
    } else if (selectedId) {
      return of(Number(selectedId));
    } else {
      return throwError(() => new Error('No category selected or new category name provided.'));
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/events']);
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.categorySub) {
        this.categorySub.unsubscribe();
    }
  }
}

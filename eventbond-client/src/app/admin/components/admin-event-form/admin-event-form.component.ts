import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Event } from '../../../core/services/event.service';
import { CategoryService, Category } from '../../../core/services/category.service'; // Import CategoryService and Category
import { Subscription, Observable, of, throwError } from 'rxjs'; // Import Observable, of, throwError
import { switchMap, catchError, tap, map } from 'rxjs/operators'; // Import switchMap, catchError, tap, map
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
    private categoryService: CategoryService, // Inject CategoryService
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
      selectedCategoryId: ['', Validators.required], // For existing categories dropdown
      newCategoryName: [''], // For creating a new category
      price: [0, [Validators.required, Validators.min(0)]],
      seatsAvailable: [0, [Validators.required, Validators.min(0)]],
      mainImageFile: [null], // For the main image file
      additionalImageFiles: this.fb.array([]) // For additional image files
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
              // Patch basic form values
              this.eventForm.patchValue({
                name: event.title, // Changed from event.name
                date: event.startDate.split('T')[0], // Assuming startDate is ISO string
                time: new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), // Assuming startDate is ISO string
                location: event.venue, // Changed from event.location
                description: event.description,
                organizer: event.organizer,
                selectedCategoryId: event.category?.id || '', // Set selected category
                price: event.price,
                seatsAvailable: event.seatsAvailable
              });
              // TODO: Handle loading existing images for edit mode (will require fetching them and displaying previews)
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

    // When newCategoryName has a value, selectedCategoryId should be disabled/cleared and vice-versa
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
        return of([]); // Return empty array on error
      })
    );
  }

  get additionalImageFilesArray(): FormArray {
    return this.eventForm.get('additionalImageFiles') as FormArray;
  }

  addAdditionalImageField(): void {
    this.additionalImageFilesArray.push(this.fb.control(null)); // Store null initially, will hold File object
    // TODO: Add preview logic and specific file handling for each additional image
  }

  onMainImageSelected(event: any): void { // Changed type from Event to any
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.eventForm.patchValue({ mainImageFile: file });
      this.eventForm.get('mainImageFile')?.updateValueAndValidity();
      // TODO: Add preview logic if needed
    }
  }

  onAdditionalImageSelected(event: any, index: number): void { // Changed type from Event to any
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.additionalImageFilesArray.at(index).setValue(file);
      // TODO: Add preview logic if needed
    }
  }

  removeAdditionalImageField(index: number): void {
    this.additionalImageFilesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      // Check if the error is due to category selection
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

        // Prepare FormData
        const formData = new FormData();
        formData.append('eventData', JSON.stringify(eventPayload)); // Send event data as JSON string

        const mainImage = this.eventForm.get('mainImageFile')?.value;
        if (mainImage) {
          formData.append('mainImage', mainImage);
        }

        this.additionalImageFilesArray.controls.forEach((control, index) => {
          const file = control.value;
          if (file) {
            formData.append('additionalImages', file); // Backend will receive an array of files for 'additionalImages'
          }
        });
        
        if (this.isEditMode && this.eventId) {
          return this.eventService.updateEventWithFiles(this.eventId, formData); // New call with FormData
        } else {
          return this.eventService.createEventWithFiles(formData); // New call with FormData
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
    if (this.categorySub) { // Unsubscribe from categorySub if it exists
        this.categorySub.unsubscribe();
    }
  }
}

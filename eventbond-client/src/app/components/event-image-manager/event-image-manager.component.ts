import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { EventImageService, EventImageRef, EventImageUploadResponse } from '../../services/event-image.service'; // Ensure EventImageRef and EventImageUploadResponse are imported
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-image-manager',
  templateUrl: './event-image-manager.component.html',
  styleUrls: ['./event-image-manager.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class EventImageManagerComponent implements OnInit {
  @Input() eventId!: number;
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  isPrimaryImage: boolean = false;
  eventImages: EventImageRef[] = []; // Changed from EventImage[] to EventImageRef[]
  uploading: boolean = false;
  loadingImages: boolean = false;
  errorMessage: string | null = null;

  constructor(public eventImageService: EventImageService) {}

  ngOnInit(): void {
    if (!this.eventId) {
      this.errorMessage = 'Event ID is required to manage images.';
      console.error('Event ID is missing for EventImageManagerComponent');
      return;
    }
    this.loadEventImages();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    this.errorMessage = null; 
  }

  loadEventImages(): void {
    this.loadingImages = true;
    this.errorMessage = null;
    this.eventImageService.getImagesByEvent(this.eventId).subscribe({
      next: (images: EventImageRef[]) => { // Use EventImageRef[] for the list of images
        this.eventImages = images;
        this.loadingImages = false;
      },
      error: (err) => {
        console.error('Error fetching images:', err);
        this.errorMessage = 'Failed to load images. ' + (err.error?.message || err.message);
        this.loadingImages = false;
      }
    });
  }

  onUploadImage(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select an image to upload.';
      return;
    }
    if (!this.eventId) {
      this.errorMessage = 'Event ID is missing, cannot upload image.';
      return;
    }

    this.uploading = true;
    this.errorMessage = null;

    this.eventImageService.uploadImage(this.eventId, this.selectedFile, this.isPrimaryImage)
      .subscribe({
        next: (uploadedImage: EventImageUploadResponse) => { // Use EventImageUploadResponse for the upload result
          console.log('Image uploaded:', uploadedImage);
          this.loadEventImages(); 
          this.selectedFile = null;
          this.isPrimaryImage = false; 
          if (this.fileInput) {
            this.fileInput.nativeElement.value = ""; 
          }
          this.uploading = false;
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.errorMessage = 'Upload failed: ' + (err.error?.message || err.message);
          this.uploading = false;
        }
      });
  }
}

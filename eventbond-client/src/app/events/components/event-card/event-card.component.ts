import { Component, Input } from '@angular/core';
import { Event, EventImage } from '../../../core/services/event.service'; // Path to EventService models
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventImageService } from '../../../services/event-image.service'; // Import EventImageService

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input() event: Event | undefined;

  constructor(private eventImageService: EventImageService) {} // Inject EventImageService

  get primaryImageUrl(): string {
    let imageUrl: string | undefined = undefined;

    if (this.event) {
      // Priority 1: Use 'images' array if available
      if (this.event.images && this.event.images.length > 0) {
        let imageToDisplay: EventImage | undefined = this.event.images.find(img => img.isPrimary);

        if (!imageToDisplay && this.event.images[0]) { // If no primary, take the first one
          imageToDisplay = this.event.images[0];
        }

        if (imageToDisplay && typeof imageToDisplay.id === 'number') {
          // Use EventImageService to construct the URL
          imageUrl = this.eventImageService.getImageUrl(imageToDisplay.id);
        }
      }

      // Priority 2: Use 'event.imageUrl' if it's a direct, fully-qualified URL and no image found yet
      if (!imageUrl && this.event.imageUrl && (this.event.imageUrl.startsWith('http://') || this.event.imageUrl.startsWith('https://'))) {
        imageUrl = this.event.imageUrl;
      }
    }

    // Fallback placeholder if no other image source is found
    return imageUrl || 'https://via.placeholder.com/300x200.png?text=Event+Image';
  }
}

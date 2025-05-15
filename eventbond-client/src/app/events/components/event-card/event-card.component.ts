import { Component, Input } from '@angular/core';
import { Event, EventImage } from '../../../core/services/event.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventImageService } from '../../../services/event-image.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input() event: Event | undefined;

  constructor(private eventImageService: EventImageService) {}

  get primaryImageUrl(): string {
    let imageUrl: string | undefined = undefined;

    if (this.event) {
      if (this.event.images && this.event.images.length > 0) {
        let imageToDisplay: EventImage | undefined = this.event.images.find(img => img.isPrimary);

        if (!imageToDisplay && this.event.images[0]) {
          imageToDisplay = this.event.images[0];
        }

        if (imageToDisplay && typeof imageToDisplay.id === 'number') {
          imageUrl = this.eventImageService.getImageUrl(imageToDisplay.id);
        }
      }

      if (!imageUrl && this.event.imageUrl && (this.event.imageUrl.startsWith('http://') || this.event.imageUrl.startsWith('https://'))) {
        imageUrl = this.event.imageUrl;
      }
    }

    return imageUrl || 'No Image Available';
  }
}

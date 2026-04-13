import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  bagHandleOutline,
  flashOutline,
  leafOutline,
  rocketOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonToolbar,
    RouterLink,
  ],
})
export class HomePage {
  readonly arrowIcon = arrowForwardOutline;
  readonly bagIcon = bagHandleOutline;
  readonly sparklesIcon = sparklesOutline;
  readonly rocketIcon = rocketOutline;
  readonly shieldIcon = shieldCheckmarkOutline;
  readonly leafIcon = leafOutline;
  readonly flashIcon = flashOutline;

  constructor() {
    addIcons({
      arrowForwardOutline,
      bagHandleOutline,
      flashOutline,
      leafOutline,
      rocketOutline,
      shieldCheckmarkOutline,
      sparklesOutline,
    });
  }
}

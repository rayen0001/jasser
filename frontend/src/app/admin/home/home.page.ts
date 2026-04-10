import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { RouterOutlet } from '@angular/router';
import { SidbarPage } from '../sidbar/sidbar.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent,FormsModule, RouterOutlet, SidbarPage]
})
export class HomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}

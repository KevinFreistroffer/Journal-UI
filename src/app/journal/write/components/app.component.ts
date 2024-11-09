import { Component } from '@angular/core';
import { DataService } from '../services/data.service'; // Adjust path as needed

@Component({
  selector: 'app-journal-write',
  template: `
    <div>
      <input [(ngModel)]="newItem" (keyup.enter)="addItem()">
      <button (click)="addItem()">Add Item</button>

      <ul>
        <li *ngFor="let item of items; let i = index">
          {{ item }}
          <button (click)="removeItem(i)">Remove</button>
        </li>
      </ul>
    </div>
  `
})
export class AppComponent {
  items: string[] = [];
  newItem: string = '';

  constructor(private dataService: DataService) {
    this.items = this.dataService.getItems();
  }

  addItem(): void {
    if (this.newItem) {
      this.dataService.addItem(this.newItem);
      this.newItem = '';
    }
  }

  removeItem(index: number): void {
    this.dataService.removeItem(index);
  }
} 
import { Component, OnInit } from '@angular/core';
import IpSelectInputOption from '../../interfaces/ip-select-input-option';

@Component({
  selector: 'lib-test-view',
  templateUrl: './test-view.component.html',
  styleUrls: ['./test-view.component.scss'],
})
export class TestViewComponent implements OnInit {
  people = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
    { id: 3, name: 'Alice Johnson', age: 28 },
  ];

  options: IpSelectInputOption[] = this.people.map(person => ({
    value: person.id.toString(),
    label: `${person.name} (Age: ${person.age})`
  }));

  constructor() {
  }
  ngOnInit(): void {
  }
}

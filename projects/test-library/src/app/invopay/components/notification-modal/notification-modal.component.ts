import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-notification-modal',
templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent implements OnInit, OnChanges {
  dateControl = new FormControl({ value: '', disabled: true });
  brokerControl = new FormControl({ value: '', disabled: true });
  entityControl = new FormControl({ value: '', disabled: true });
  answeredControl = new FormControl({ value: '', disabled: true });
  queryControl = new FormControl({ value: '', disabled: true });
  replyControl = new FormControl('');

  ngOnInit() {
    this.updateControls();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['details']) {
      this.updateControls();
    }
  }

  private updateControls() {
    if (this.details) {
      this.dateControl.setValue(this.details.notificationDate || '');
      this.brokerControl.setValue(this.details.brokerName || '');
      this.entityControl.setValue(this.details.entity || '');
      this.answeredControl.setValue(this.details.answered || '');
      this.queryControl.setValue(this.details.query || '');
    }
  }
  @Input() open = false;
  @Input() title: string = '';
  @Input() details: any;
  @Input() responses: any[] | undefined = [];
  @Input() isReplyMode: boolean = false;
  @Input() cancelLabel = 'IP.NOTIFICATIONS.MODAL.CANCEL';
  @Input() applyLabel = 'IP.NOTIFICATIONS.MODAL.SUBMIT';
  @Input() showActions = true;
  @Input() applyDisabled = false;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() apply = new EventEmitter<void>();
  @Output() sendReply = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter();

  replyText: string = '';
  activeTab: string = 'info';

  onCloseModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openChange.emit(false);
    this.closeModal.emit();
  }

  applyModal(): void {
    if (this.isReplyMode && this.replyText.trim()) {
      this.sendReply.emit(this.replyText.trim());
      this.replyText = '';
    }
    this.apply.emit();
    this.onCloseModal();
  }
}

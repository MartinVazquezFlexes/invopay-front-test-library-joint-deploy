import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-notification-modal',
templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent {
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

  onCloseModal(): void {
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

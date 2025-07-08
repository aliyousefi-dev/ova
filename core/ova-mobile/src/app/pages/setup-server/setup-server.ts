import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsModalComponent } from '../../components/setting-modal/settings-modal.component';

@Component({
  selector: 'app-setup-server',
  imports: [FormsModule, SettingsModalComponent],
  templateUrl: './setup-server.html',
})
export class SetupServer {
  ipAddress: string = '192.168.1.10:4040'; // Variable for IP address input

  showModal = false; // Initially, set modal visibility to false

  // Method to open the modal
  openModal() {
    this.showModal = true;
  }

  // Method to close the modal
  closeModal() {
    this.showModal = false;
  }

  // Function to connect to the IP address
  connectToIP() {
    if (this.ipAddress) {
      alert(`Connecting to ${this.ipAddress}`);
      // You can replace the alert with actual logic (like redirecting or making an HTTP request)
    } else {
      alert('Please enter a valid IP address');
    }
  }
}

import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor and ngIf
import { OvacliService, User } from '../../../../../services/ovacli.service'; // Import OvacliService and User

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-user-modal.component.html',
})
export class CreateUserModalComponent {
  @Input() showModal: boolean = false; // Modal visibility control from parent
  @Input() repositoryAddress: string = ''; // Input for repository address
  @Output() modalClose = new EventEmitter<void>(); // Emit event to close modal
  @Output() userCreated = new EventEmitter<User>(); // Emit created user

  // Define available roles for the dropdown
  availableRoles: string[] = ['user', 'admin', 'editor'];

  // Updated newUser to include a password and default role
  newUser: {
    Username: string;
    Roles: string;
    Password: string;
    CreatedAt: string;
  } = {
    Username: '',
    Roles: '', // Default to empty string, let the user select
    Password: '',
    CreatedAt: '',
  };

  isCreating: boolean = false; // Show loading spinner while creating user
  errorMessage: string = ''; // Error message
  successMessage: string = ''; // Success message

  constructor(private ovacliService: OvacliService) {} // Inject OvacliService

  // Method to close the modal
  closeModal() {
    this.showModal = false;
    this.modalClose.emit(); // Emit the event to the parent component
    this.resetForm();
  }

  // Method to create a new user
  createUser() {
    if (this.isCreating) return;

    this.errorMessage = ''; // Clear previous errors
    this.successMessage = ''; // Clear previous success messages

    if (
      !this.newUser.Username ||
      !this.newUser.Roles ||
      !this.newUser.Password
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.repositoryAddress) {
      this.errorMessage = 'Repository address is not provided.';
      return;
    }

    this.isCreating = true; // Show loading spinner

    // Call the service to add the user via ovacli
    this.ovacliService
      .runOvacliUserAdd(
        this.repositoryAddress,
        this.newUser.Username,
        this.newUser.Password,
        this.newUser.Roles
      )
      .then((user: User) => {
        this.isCreating = false; // Hide loading spinner

        this.successMessage = `User '${user.Username}' created successfully!`;
        this.userCreated.emit(user); // Emit the created user to the parent component

        this.resetForm(); // Reset the form
      })
      .catch((error) => {
        this.isCreating = false; // Hide loading spinner
        this.errorMessage = `Failed to create user: ${error.message}`;
      });
  }

  // Reset the form
  resetForm() {
    this.newUser = { Username: '', Roles: '', Password: '', CreatedAt: '' }; // Reset form fields including password and role
    this.errorMessage = ''; // Reset error message
    this.successMessage = ''; // Reset success message
  }
}

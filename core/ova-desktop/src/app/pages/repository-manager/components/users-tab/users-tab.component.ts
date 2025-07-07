import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OvacliService, User } from '../../../../services/ovacli.service'; // Import User interface
import { CreateUserModalComponent } from './components/create-user-modal.component';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateUserModalComponent], // Add CreateUserModalComponent here
  templateUrl: './users-tab.component.html',
})
export class UsersTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Input to receive the repository address

  users: User[] = []; // Array to hold user data
  searchQuery: string = '';
  userCount: number = 0;
  loading: boolean = false; // For initial tab load and overall content display
  refreshing: boolean = false; // For refresh button's specific loading state

  activeTab: string = 'users'; // Default active tab set to 'users'

  showCreateUserModal: boolean = false; // Control visibility of the create user modal

  constructor(private ovacliService: OvacliService) {}

  ngOnInit() {
    if (this.repositoryAddress) {
      this.fetchUserList(true); // Pass true for initial load
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchUserList(true); // Pass true for full load when address changes
      } else {
        this.users = [];
        this.updateUserCount();
      }
    }
  }

  // Method to fetch the user list from OvacliService
  fetchUserList(initialLoad: boolean = false) {
    if (!this.repositoryAddress) {
      console.warn(
        'Cannot fetch user list: repositoryAddress is not provided.'
      );
      this.users = [];
      this.updateUserCount();
      return;
    }

    if (initialLoad) {
      this.loading = true; // Show full tab spinner for initial load/address change
    } else {
      this.refreshing = true; // Show button spinner for manual refresh
    }

    const minDelay = 500; // Minimum delay in milliseconds (e.g., 0.5 seconds)
    const startTime = Date.now();

    this.ovacliService
      .runOvacliUserList(this.repositoryAddress) // Use the new runOvacliUserList method
      .then((users) => {
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.users = users;
            this.updateUserCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.users = users;
          this.updateUserCount();
          this.loading = false;
          this.refreshing = false;
        }
      })
      .catch((err) => {
        console.error('Error fetching user list:', err);
        const elapsedTime = Date.now() - startTime;
        const remainingDelay = minDelay - elapsedTime;

        if (remainingDelay > 0) {
          setTimeout(() => {
            this.users = []; // Clear users on error
            this.updateUserCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.users = []; // Clear users on error
          this.updateUserCount();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

  // A public method specifically for the refresh button click
  refreshUsers() {
    this.fetchUserList();
  }

  // Method to open the create user modal
  openCreateUserModal() {
    this.showCreateUserModal = true;
  }

  // Handler for when a user is successfully created in the modal
  handleUserCreated(newUser: User) {
    // Re-fetch the user list to include the newly created user
    // This is more robust than just pushing to the array, as it ensures data consistency
    this.fetchUserList(false); // No need for full load spinner, just refresh
    console.log('New user created:', newUser);
  }

  // Filter users based on search query
  filteredUsers(): User[] {
    const filtered = this.users.filter(
      (user) =>
        user.Username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.Roles.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.CreatedAt.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    return filtered;
  }

  onSearchQueryChange() {
    this.updateUserCount();
  }

  private updateUserCount() {
    this.userCount = this.filteredUsers().length;
  }

  // Method to switch active tabs
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}

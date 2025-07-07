import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  ViewChild, // Import ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OvacliService, User } from '../../../../services/ovacli.service';
import { CreateUserModalComponent } from './components/create-user-modal.component';
import { ConfirmModalComponent } from '../../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateUserModalComponent,
    ConfirmModalComponent,
  ], // Add ConfirmModalComponent here
  templateUrl: './users-tab.component.html',
})
export class UsersTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = '';

  @ViewChild('confirmModal') confirmModal!: ConfirmModalComponent; // Reference to the confirmation modal

  users: User[] = [];
  searchQuery: string = '';
  userCount: number = 0;
  loading: boolean = false;
  refreshing: boolean = false;
  deleting: boolean = false;

  activeTab: string = 'users';

  showCreateUserModal: boolean = false;

  selectMode: boolean = false;
  selectedUsernames: Set<string> = new Set<string>();

  constructor(private ovacliService: OvacliService) {}

  ngOnInit() {
    if (this.repositoryAddress) {
      this.fetchUserList(true);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchUserList(true);
      } else {
        this.users = [];
        this.updateUserCount();
      }
    }
  }

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
      this.loading = true;
    } else {
      this.refreshing = true;
    }

    const minDelay = 500;
    const startTime = Date.now();

    this.ovacliService
      .runOvacliUserList(this.repositoryAddress)
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
            this.users = [];
            this.updateUserCount();
            this.loading = false;
            this.refreshing = false;
          }, remainingDelay);
        } else {
          this.users = [];
          this.updateUserCount();
          this.loading = false;
          this.refreshing = false;
        }
      });
  }

  refreshUsers() {
    this.fetchUserList();
  }

  openCreateUserModal() {
    this.showCreateUserModal = true;
  }

  handleUserCreated(newUser: User) {
    this.fetchUserList(false);
    console.log('New user created:', newUser);
  }

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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleSelectMode() {
    this.selectMode = !this.selectMode;
    if (!this.selectMode) {
      this.selectedUsernames.clear();
    }
  }

  onCheckboxChange(username: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedUsernames.add(username);
    } else {
      this.selectedUsernames.delete(username);
    }
    console.log('Selected Users:', Array.from(this.selectedUsernames));
  }

  isUserSelected(username: string): boolean {
    return this.selectedUsernames.has(username);
  }

  toggleSelectAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.filteredUsers().forEach((user) =>
        this.selectedUsernames.add(user.Username)
      );
    } else {
      this.selectedUsernames.clear();
    }
    console.log('Selected Users:', Array.from(this.selectedUsernames));
  }

  isAllFilteredUsersSelected(): boolean {
    if (this.filteredUsers().length === 0) {
      return false;
    }
    return this.filteredUsers().every((user) =>
      this.selectedUsernames.has(user.Username)
    );
  }

  // New method to open the confirmation modal
  confirmDeleteSelectedUsers() {
    if (this.selectedUsernames.size === 0) {
      return;
    }

    const userListToDelete = Array.from(this.selectedUsernames);
    const confirmationMessage =
      userListToDelete.length === 1
        ? `Are you sure you want to delete user "${userListToDelete[0]}"?`
        : `Are you sure you want to delete ${
            userListToDelete.length
          } users? \n\n${userListToDelete.join('\n')}`;

    this.confirmModal.open(confirmationMessage);
    this.deleting = true; // Set deleting to true when the modal is opened
  }

  async deleteSelectedUsers() {
    // This method is now called only when the confirm modal emits 'confirmed'
    const userListToDelete = Array.from(this.selectedUsernames);
    const failedDeletions: string[] = [];

    try {
      const results = await Promise.allSettled(
        userListToDelete.map((username) =>
          this.ovacliService.runOvacliUserRemove(
            this.repositoryAddress,
            username
          )
        )
      );

      results.forEach((result, index) => {
        const username = userListToDelete[index];
        if (result.status === 'fulfilled') {
          if (!result.value.success) {
            failedDeletions.push(
              `${username}: ${result.value.message || 'Unknown error'}`
            );
            console.error(
              `Failed to delete user '${username}':`,
              result.value.message,
              result.value.userdata
            );
          } else {
            console.log(`User '${username}' deleted successfully.`);
          }
        } else {
          failedDeletions.push(
            `${username}: ${
              result.reason?.message || 'Network or internal error'
            }`
          );
          console.error(`Error deleting user '${username}':`, result.reason);
        }
      });

      if (failedDeletions.length > 0) {
        alert(
          `Failed to delete the following users:\n${failedDeletions.join(
            '\n'
          )}\n\nPlease check the console for more details.`
        );
      } else {
        console.log('All selected users deleted successfully.');
      }

      this.selectedUsernames.clear();
      this.selectMode = false;
      this.fetchUserList(false);
    } catch (error) {
      console.error(
        'An unexpected error occurred during user deletion:',
        error
      );
      alert(
        'An unexpected error occurred during user deletion. Please check the console for details.'
      );
    } finally {
      this.deleting = false; // Reset deleting flag here
    }
  }
}

import {
  Component,
  Input,
  OnInit, // Import OnInit for initial data fetch
  OnChanges, // Import OnChanges to react to input changes
  SimpleChanges, // Import SimpleChanges for OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OvacliService } from '../../../../services/ovacli.service'; // Adjust path to your OvacliService

@Component({
  selector: 'app-general-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './general-tab.component.html',
  // Consider adding a styleUrls if you have specific CSS for this component
  // styleUrls: ['./general-tab.component.css']
})
export class GeneralTabComponent implements OnInit, OnChanges {
  @Input() repositoryAddress: string = ''; // Keep repositoryAddress as an input

  // These properties will now be populated internally
  videoCount: number = 0;
  userCount: number = 0;
  storageUsed: string = '0 GB'; // Initialize with a default value
  loading: boolean = false; // Add a loading state

  constructor(private ovacliService: OvacliService) {} // Inject OvacliService

  ngOnInit() {
    // Fetch data initially if repositoryAddress is already available
    if (this.repositoryAddress) {
      this.fetchGeneralStats();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-fetch data if the repositoryAddress input changes
    if (
      changes['repositoryAddress'] &&
      changes['repositoryAddress'].currentValue !==
        changes['repositoryAddress'].previousValue
    ) {
      if (this.repositoryAddress) {
        this.fetchGeneralStats();
      } else {
        // Clear data if repositoryAddress becomes empty or invalid
        this.videoCount = 0;
        this.userCount = 0;
        this.storageUsed = '0 GB';
      }
    }
  }

  // Method to fetch general statistics
  fetchGeneralStats() {
    if (
      !this.repositoryAddress ||
      this.repositoryAddress === 'No repository selected'
    ) {
      console.warn(
        'Cannot fetch general stats: repositoryAddress is not provided or invalid.'
      );
      this.videoCount = 0;
      this.userCount = 0;
      this.storageUsed = '0 GB';
      return;
    }

    this.loading = true; // Start loading

    // Simulate fetching data. In a real scenario, you'd make actual service calls.
    // For videoCount, you can reuse runOvacliVideoList.
    this.ovacliService
      .runOvacliVideoList(this.repositoryAddress)
      .then((videos) => {
        this.videoCount = videos.length;
        // Simulate fetching user count and storage. Replace with actual service calls.
        // If your OvacliService has methods like `getUsersCount` or `getStorageUsage`, use them here.
        this.userCount = 5; // Placeholder
        this.storageUsed = '250 GB'; // Placeholder
        this.loading = false; // End loading
      })
      .catch((error) => {
        console.error('Error fetching general stats:', error);
        this.videoCount = 0;
        this.userCount = 0;
        this.storageUsed = '0 GB';
        this.loading = false; // End loading on error
      });

    // If you have separate service calls for user count and storage, they would go here:
    // this.ovacliService.getUsersCount(this.repositoryAddress).then(count => this.userCount = count);
    // this.ovacliService.getStorageUsed(this.repositoryAddress).then(storage => this.storageUsed = storage);
  }
}

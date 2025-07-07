import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OvacliService, RepoInfo } from '../../../../services/ovacli.service'; // Import RepoInfo

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

  // These properties will now be populated from RepoInfo
  videoCount: number = 0;
  userCount: number = 0;
  storageUsed: string = '0 GB'; // Initialize with a default value
  created_at: string = 'N/A'; // New property for last updated date
  host: string = 'N/A'; // New property for host
  port: number = 0; // New property for port

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
        this.resetStats();
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
      this.resetStats();
      return;
    }

    this.loading = true; // Start loading

    this.ovacliService
      .runOvacliRepoInfo(this.repositoryAddress)
      .then((repoInfo: RepoInfo) => {
        this.videoCount = repoInfo.video_count;
        this.userCount = repoInfo.user_count;
        this.storageUsed = repoInfo.storage_used;
        this.created_at = repoInfo.created_at;
        this.host = repoInfo.host;
        this.port = repoInfo.port;
        this.loading = false; // End loading
      })
      .catch((error) => {
        console.error('Error fetching general stats:', error);
        this.resetStats(); // Reset stats on error
        this.loading = false; // End loading on error
      });
  }

  private resetStats() {
    this.videoCount = 0;
    this.userCount = 0;
    this.storageUsed = '0 GB';
    this.created_at = 'N/A';
    this.host = 'N/A';
    this.port = 0;
  }
}

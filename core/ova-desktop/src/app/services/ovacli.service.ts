import { Injectable } from '@angular/core';

export interface VideoFile {
  ID: string; // Unique ID of the video
  Path: string; // Path to the video file
}

export interface VideoFileDisk {
  Path: string;
}

export interface VideoFileDuplicate {
  hash: string;
  paths: string[];
}

// Define the interface for a User
export interface User {
  Username: string;
  Roles: string; // Roles are joined into a single string by the Go CLI
  CreatedAt: string; // Formatted as a string "YYYY-MM-DD HH:MM:SS"
}

// Define the interface for repository information
export interface RepoInfo {
  video_count: number;
  user_count: number;
  storage_used: string;
  created_at: string;
  host: string;
  port: number;
}

@Injectable({
  providedIn: 'root',
})
export class OvacliService {
  constructor() {}

  // Method to run the ovacli command with the --version argument
  runOvacliVersion(): Promise<any> {
    const args = ['version']; // Just the --version argument to check the version
    console.log('Running ovacli with args:', args);
    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli version result:', result);
        return result; // Returning the result (either success or error)
      })
      .catch((err) => {
        console.error('runOvacli error:', err);
        throw err; // Propagate the error for further handling
      });
  }

  // Method to run the ovacli command with init <folderpath> and user/pass arguments
  runOvacliInit(
    folderPath: string,
    username: string,
    password: string
  ): Promise<any> {
    // Wrap the folder path in double quotes to handle spaces in the path
    const quotedFolderPath = `"${folderPath}"`;

    // Build the arguments array with user and pass flags
    const args = [
      'init',
      quotedFolderPath,
      '--user',
      username,
      '--pass',
      password,
    ];
    console.log('Running ovacli with args:', args);

    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli init result:', result);
        return result; // Returning the result (either success or error)
      })
      .catch((err) => {
        console.error('runOvacli error:', err);
        throw err; // Propagate the error for further handling
      });
  }

  // Method to run the ovacli video list command and return the result as a list of Video objects
  runOvacliVideoList(repositoryPath: string): Promise<VideoFile[]> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the base arguments array for the 'video list' command
    const args: string[] = ['video', 'list'];

    // Add the --json flag
    args.push('--json');

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    console.log('Running ovacli video list with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli video list result:', result);

        if (result.success && result.output) {
          try {
            // Parse the result output as JSON directly
            const videos = JSON.parse(result.output);

            // If videos are found, format the data
            if (Array.isArray(videos)) {
              // Map the videos into the VideoFile[] format
              return videos.map(
                (video: any): VideoFile => ({
                  ID: video.ID,
                  Path: video.Path,
                })
              );
            } else {
              console.error('Unexpected format in video list result:', result);
              // Handle "No videos found." by returning an empty array if the CLI output is a simple string "No videos found."
              if (result.output.trim() === 'No videos found.') {
                return [];
              }
              throw new Error('Unexpected format in video list result');
            }
          } catch (err) {
            console.error('Failed to parse video list JSON:', err);
            throw err; // Propagate the error if JSON parsing fails
          }
        } else if (
          result.success &&
          result.output.trim() === 'No videos found.'
        ) {
          // Handle "No videos found." explicitly for non-JSON output cases
          return [];
        } else {
          console.error('Error in video list result:', result);
          throw new Error('Error fetching video list');
        }
      })
      .catch((err) => {
        console.error('runOvacli video list error:', err);
        throw err; // Propagate the error for further handling
      });
  }

  /**
   * Method to run the ovacli users list command and return the result as a list of User objects.
   * @param repositoryPath The path to the repository directory.
   * @returns A promise that resolves with an array of User objects.
   */
  runOvacliUserList(repositoryPath: string): Promise<User[]> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the arguments array for the 'users list' command
    const args: string[] = ['users', 'list'];

    // Add the --json flag
    args.push('--json');

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    console.log('Running ovacli users list with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args)
      .then((result) => {
        console.log('runOvacli users list result:', result);

        if (result.success && result.output) {
          try {
            const users = JSON.parse(result.output);

            if (Array.isArray(users)) {
              return users.map(
                (user: any): User => ({
                  Username: user.Username,
                  Roles: user.Roles,
                  CreatedAt: user.CreatedAt,
                })
              );
            } else {
              console.error('Unexpected format in user list result:', result);
              // Handle "No users found." if the CLI outputs a simple string for no users
              if (result.output.trim() === 'No users found.') {
                return [];
              }
              throw new Error('Unexpected format in user list result');
            }
          } catch (err) {
            console.error('Failed to parse user list JSON:', err);
            throw err;
          }
        } else if (
          result.success &&
          result.output.trim() === 'No users found.'
        ) {
          // Explicitly handle "No users found." output from CLI
          return [];
        } else {
          console.error('Error in user list result:', result);
          throw new Error('Error fetching user list');
        }
      })
      .catch((err) => {
        console.error('runOvacli users list error:', err);
        throw err;
      });
  }

  /**
   * Method to run the ovacli repo info command and return the result as a RepoInfo object.
   * @param repositoryPath The path to the repository directory.
   * @returns A promise that resolves with a RepoInfo object.
   */
  runOvacliRepoInfo(repositoryPath: string): Promise<RepoInfo> {
    const quotedRepositoryPath = `"${repositoryPath}"`;
    const args: string[] = [
      'repo',
      'info',
      '--json',
      '--repository',
      quotedRepositoryPath,
    ];

    console.log('Running ovacli repo info with args:', args);

    return window['IPCBridge']
      .runOvacli(args)
      .then((result) => {
        console.log('runOvacli repo info result:', result);

        if (result.success && result.output) {
          try {
            const repoInfo: RepoInfo = JSON.parse(result.output);
            return repoInfo;
          } catch (err) {
            console.error('Failed to parse repo info JSON:', err);
            throw err;
          }
        } else {
          console.error('Error in repo info result:', result);
          throw new Error('Error fetching repository information');
        }
      })
      .catch((err) => {
        console.error('runOvacli repo info error:', err);
        throw err;
      });
  }

  runOvacliUserAdd(
    repositoryPath: string,
    username: string,
    password: string,
    role: string
  ): Promise<User> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the arguments array for the 'users add' command
    const args: string[] = ['users', 'add'];

    // Add the --user flag
    args.push('--user', username);

    // Add the --pass flag
    args.push('--pass', password);

    // Add the --role flag
    args.push('--role', role);

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    // Add the --json flag to get the result in JSON format
    args.push('--json');

    console.log('Running ovacli users add with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args)
      .then((result) => {
        console.log('runOvacli users add result:', result);

        if (result.success && result.output) {
          try {
            // Parse the user data from the JSON output
            const user = JSON.parse(result.output);

            if (user && user.username) {
              // Return the user object based on the received data
              return {
                Username: user.username,
                Roles: user.roles,
                CreatedAt: user.createdAt,
              };
            } else {
              console.error('Unexpected format in user add result:', result);
              throw new Error('Unexpected format in user add result');
            }
          } catch (err) {
            console.error('Failed to parse user add JSON:', err);
            throw err;
          }
        } else {
          console.error('Error in user add result:', result);
          throw new Error('Error adding user');
        }
      })
      .catch((err) => {
        console.error('runOvacli users add error:', err);
        throw err;
      });
  }

  runOvacliUserRemove(
    repositoryPath: string,
    username: string
  ): Promise<{ success: boolean; message: string; userdata?: any }> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the arguments array for the 'users rm' command
    const args: string[] = ['users', 'rm'];

    // Add the --user flag
    args.push(username);

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    // Add the --json flag to get the result in JSON format
    args.push('--json');

    console.log('Running ovacli users rm with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args)
      .then((result) => {
        console.log('runOvacli users rm result:', result);

        if (result.success && result.output) {
          try {
            // Parse the result to check if the user was removed successfully
            const output = JSON.parse(result.output);

            if (output.success) {
              console.log(`User '${username}' removed successfully.`);
              return {
                success: true,
                message: `User '${username}' deleted successfully`,
                userdata: output.userdata, // Return the user data
              };
            } else {
              console.error(`Failed to remove user '${username}':`, output);
              throw new Error(`Failed to remove user '${username}'`);
            }
          } catch (err) {
            console.error('Failed to parse user remove JSON:', err);
            throw err;
          }
        } else {
          console.error('Error in user remove result:', result);
          throw new Error('Error removing user');
        }
      })
      .catch((err) => {
        console.error('runOvacli users rm error:', err);
        throw err; // Propagate the error for further handling
      });
  }

  runOvacliRepoDuplicates(
    repositoryPath: string
  ): Promise<VideoFileDuplicate[]> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the base arguments array for the 'repo duplicates' command
    const args: string[] = ['repo', 'duplicates'];

    // Add the --json flag
    args.push('--json');

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    console.log('Running ovacli repo duplicates with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli repo duplicates result:', result);

        // Ensure the result is valid
        if (result.success && result.output) {
          try {
            let output = result.output.trim();

            // Check for any potential warning message in the output
            if (output.startsWith('Warning:')) {
              console.warn('Received a warning from ovacli:', output);
              // Handle or suppress the warning
              // You can choose to throw an error or ignore it
              throw new Error('Received warning: ' + output);
            }

            // Check if output starts with a valid JSON structure
            if (!output.startsWith('{') && !output.startsWith('[')) {
              console.error('Unexpected output format:', output);
              throw new Error('Output is not valid JSON');
            }

            // Parse the result output as JSON directly
            const duplicates = JSON.parse(output);

            // If duplicates are found, return the result as an array of VideoFileDuplicate objects
            if (Array.isArray(duplicates)) {
              return duplicates.map(
                (duplicate: any): VideoFileDuplicate => ({
                  hash: duplicate.hash,
                  paths: duplicate.paths,
                })
              );
            } else {
              console.error(
                'Unexpected format in repo duplicates result:',
                result
              );
              throw new Error('Unexpected format in repo duplicates result');
            }
          } catch (err) {
            console.error('Failed to parse repo duplicates JSON:', err);
            throw err; // Propagate the error if JSON parsing fails
          }
        } else {
          console.error('Error in repo duplicates result:', result);
          throw new Error('Error fetching repo duplicates');
        }
      })
      .catch((err) => {
        console.error('runOvacli repo duplicates error:', err);
        throw err; // Propagate the error for further handling
      });
  }

  runOvacliRepoVideos(repositoryPath: string): Promise<VideoFileDisk[]> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the base arguments array for the 'repo videos' command
    const args: string[] = ['repo', 'videos'];

    // Add the --json flag to request JSON output
    args.push('-j');

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    console.log('Running ovacli repo videos with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli repo videos result:', result);

        if (result.success && result.output) {
          try {
            // Parse the result output as JSON directly
            const videos = JSON.parse(result.output);

            // If videos are found, format the data
            if (Array.isArray(videos)) {
              // Map the videos into the VideoFile[] format
              return videos.map(
                (video: any): VideoFileDisk => ({
                  Path: video['Video Path'], // Assuming the output has "Video Path" as the key
                })
              );
            } else {
              console.error('Unexpected format in repo videos result:', result);
              // Handle "No videos found." by returning an empty array if the CLI output is a simple string "No videos found."
              if (result.output.trim() === 'No videos found.') {
                return [];
              }
              throw new Error('Unexpected format in repo videos result');
            }
          } catch (err) {
            console.error('Failed to parse repo videos JSON:', err);
            throw err; // Propagate the error if JSON parsing fails
          }
        } else if (
          result.success &&
          result.output.trim() === 'No videos found.'
        ) {
          // Handle "No videos found." explicitly for non-JSON output cases
          return [];
        } else {
          console.error('Error in repo videos result:', result);
          throw new Error('Error fetching repo videos');
        }
      })
      .catch((err) => {
        console.error('runOvacli repo videos error:', err);
        throw err; // Propagate the error for further handling
      });
  }

  // Method to run the ovacli repo unindexed command and return the result as a list of VideoFileDisk objects
  runOvacliRepoUnindexed(repositoryPath: string): Promise<VideoFileDisk[]> {
    // Wrap the repository path in double quotes to handle spaces in the path
    const quotedRepositoryPath = `"${repositoryPath}"`;

    // Build the base arguments array for the 'repo unindexed' command
    const args: string[] = ['repo', 'unindexed'];

    // Add the --json flag
    args.push('--json');

    // Add the --repository flag with the provided repository path
    args.push('--repository', quotedRepositoryPath);

    console.log('Running ovacli repo unindexed with args:', args);

    // Run the command and return the result
    return window['IPCBridge']
      .runOvacli(args) // Pass the arguments to runOvacli in the main process
      .then((result) => {
        console.log('runOvacli repo unindexed result:', result);

        if (result.success && result.output) {
          try {
            // Parse the result output as JSON directly
            const unindexedVideos = JSON.parse(result.output);

            // If unindexed videos are found, format the data
            if (Array.isArray(unindexedVideos)) {
              // Map the unindexed videos into the VideoFileDisk[] format
              return unindexedVideos.map(
                (video: any): VideoFileDisk => ({
                  Path: video['Video Path'], // Assuming the field is 'Video Path' in the output
                })
              );
            } else {
              console.error(
                'Unexpected format in repo unindexed result:',
                result
              );
              // Handle empty result if no unindexed videos are found
              if (result.output.trim() === 'No unindexed videos found.') {
                return [];
              }
              throw new Error('Unexpected format in repo unindexed result');
            }
          } catch (err) {
            console.error('Failed to parse repo unindexed JSON:', err);
            throw err; // Propagate the error if JSON parsing fails
          }
        } else if (
          result.success &&
          result.output.trim() === 'No unindexed videos found.'
        ) {
          // Handle "No unindexed videos found." explicitly for non-JSON output cases
          return [];
        } else {
          console.error('Error in repo unindexed result:', result);
          throw new Error('Error fetching unindexed videos');
        }
      })
      .catch((err) => {
        console.error('runOvacli repo unindexed error:', err);
        throw err; // Propagate the error for further handling
      });
  }
}

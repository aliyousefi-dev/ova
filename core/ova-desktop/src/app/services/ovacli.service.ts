import { Injectable } from '@angular/core';

export interface VideoFile {
  ID: string; // Unique ID of the video
  Path: string; // Path to the video file
}

// Define the interface for a User
export interface User {
  Username: string;
  Roles: string; // Roles are joined into a single string by the Go CLI
  CreatedAt: string; // Formatted as a string "YYYY-MM-DD HH:MM:SS"
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
}

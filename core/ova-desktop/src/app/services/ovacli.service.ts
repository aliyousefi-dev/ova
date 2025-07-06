import { Injectable } from '@angular/core';

export interface VideoFile {
  ID: string; // Unique ID of the video
  Path: string; // Path to the video file
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

    console.log('Running ovacli with args:', args);

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
              console.error('Unexpected format in result:', result);
              throw new Error('Unexpected format in result');
            }
          } catch (err) {
            console.error('Failed to parse JSON:', err);
            throw err; // Propagate the error if JSON parsing fails
          }
        } else {
          console.error('Error in result:', result);
          throw new Error('Error fetching video list');
        }
      })
      .catch((err) => {
        console.error('runOvacli error:', err);
        throw err; // Propagate the error for further handling
      });
  }
}

// index.ts
import fs from 'fs';
import path from 'path';
import { transform } from 'src/transformers';

export function updateWorkflows(directoryPath: string) {
  const workflowsDirectoryPath = path.join(__dirname, directoryPath);

  // Read workflow files from the specified directory
  fs.readdir(workflowsDirectoryPath, (err: any, files: any[]) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(workflowsDirectoryPath, file);

      // Check if the file exists before reading it
      if (fs.existsSync(filePath)) {
        try {
          const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const nodes = workflowData.nodes;

          // Execute transformers for each node
          transform(nodes);
        } catch (parseError) {
          console.error(`Error processing file ${file}:`, parseError);
        }
      } else {
        console.error('File does not exist:', filePath);
      }
    });
  });
}

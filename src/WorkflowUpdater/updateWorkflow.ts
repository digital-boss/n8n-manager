const fs = require('fs');
const path = require('path');
import { converters } from "src/converters";
import { transform } from "src/transform";

export function updateWorkflows(dir: string, outputDir: string) {
  const workflowsDir = dir;
  const updatedNodesDir = outputDir;

  // Check if the "updatedNodes" folder exists, and if not, create it
  if (!fs.existsSync(updatedNodesDir)) {
    fs.mkdirSync(updatedNodesDir);
  }

  // Read workflow files from the specified directory
  fs.readdir(workflowsDir, (err: any, files: any[]) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(workflowsDir, file);
      
      // Check if the file exists before reading it
      if (fs.existsSync(filePath)) {
        try {
          const workflowData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const nodes = workflowData.nodes;

          // Execute transformers for each node
          transform(converters, nodes);

          // Write the updated JSON to the "updatedNodes" folder
          const updatedFilePath = path.join(updatedNodesDir, file);
          fs.writeFileSync(updatedFilePath, JSON.stringify(workflowData, null, 2));

          console.log(`File updated and saved to updatedNodes folder: ${file}`);
        } catch (parseError) {
          console.error(`Error processing file ${file}:`, parseError);
        }
      } else {
        console.error('File does not exist:', filePath);
      }
    });
  });
}

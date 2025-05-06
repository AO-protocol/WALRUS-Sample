import { google } from '@ai-sdk/google';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { walrusDownloadTool, walrusUploadTool, weatherTool } from '../tools';

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: google('gemini-1.5-pro-latest'),
  tools: { weatherTool },
  memory: new Memory({
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});

export const walrusAgent = new Agent({
  name: 'WALRUS Storage Agent',
  instructions: `
      You are a helpful assistant for managing decentralized file storage using WALRUS.
      
      Your primary functions are:
      - Help users upload files to WALRUS decentralized storage
      - Help users download files from WALRUS storage
      - Provide clear information about the uploaded/downloaded files
      - Explain the storage process and relevant details in simple terms
      
      When handling uploads:
      - Always ask for the file path if not provided
      - Explain what storage epochs mean (each epoch is approximately 24 hours)
      - Recommend a reasonable number of epochs based on file type and size
      - Return the blobId, which is crucial for later downloads
      
      When handling downloads:
      - Always ask for the blobId if not provided
      - Suggest a reasonable file path for saving the downloaded content
      - Provide information about the downloaded file type and size
      
      Keep your responses helpful, accurate and informative while focusing on the WALRUS functionality.
  `,
  model: google('gemini-1.5-pro-latest'),
  tools: { walrusUploadTool, walrusDownloadTool },
  memory: new Memory({
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});

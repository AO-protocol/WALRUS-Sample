import { createTool } from '@mastra/core/tools';
import fs from 'fs';
import { z } from 'zod';

// Import WALRUS functionality
import { downloadFile } from './walrus/download';
import { uploadFile } from './walrus/upload';

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
}

// WALRUS Upload Tool
export const walrusUploadTool = createTool({
  id: 'walrus-upload',
  description: 'Upload a file to WALRUS decentralized storage',
  inputSchema: z.object({
    filePath: z.string().describe('Path to file to upload'),
    numEpochs: z.number().describe('Storage duration in epochs'),
    sendTo: z.string().optional().describe('Optional: Address to send object to'),
  }),
  outputSchema: z.object({
    status: z.string(),
    blobId: z.string(),
    endEpoch: z.number(),
    blobUrl: z.string(),
    suiUrl: z.string(),
    suiRefType: z.string(),
    suiRef: z.string(),
  }),
  execute: async ({ context }) => {
    // Ensure the file exists
    if (!fs.existsSync(context.filePath)) {
      throw new Error(`File not found: ${context.filePath}`);
    }

    try {
      const uploadResult = await uploadFile(
        context.filePath,
        context.numEpochs,
        context.sendTo
      );
      
      return {
        status: uploadResult.status,
        blobId: uploadResult.blobId,
        endEpoch: uploadResult.endEpoch,
        blobUrl: uploadResult.blobUrl,
        suiUrl: uploadResult.suiUrl,
        suiRefType: uploadResult.suiRefType,
        suiRef: uploadResult.suiRef,
      };
    } catch (error: any) {
      throw new Error(`Error uploading file: ${error}`);
    }
  },
});

// WALRUS Download Tool
export const walrusDownloadTool = createTool({
  id: 'walrus-download',
  description: 'Download a file from WALRUS decentralized storage',
  inputSchema: z.object({
    blobId: z.string().describe('ID of the WALRUS blob to download'),
    outputPath: z.string().optional().describe('Optional: Path where to save the downloaded file'),
  }),
  outputSchema: z.object({
    filePath: z.string(),
    blobId: z.string(),
    contentType: z.string(),
    size: z.number(),
    metadata: z.any().nullable(),
  }),
  execute: async ({ context }) => {
    try {
      const downloadResult = await downloadFile(
        context.blobId,
        context.outputPath
      );
      
      return {
        filePath: downloadResult.filePath,
        blobId: downloadResult.blobId,
        contentType: downloadResult.contentType,
        size: downloadResult.size,
        metadata: downloadResult.metadata,
      };
    } catch (error : any) {
      throw new Error(`Error downloading file: ${error}`);
    }
  },
});

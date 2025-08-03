export interface Highlight {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  size: number;
}

export interface GalleryItem {
  id:string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'pptx' | 'xlsx' | 'epub';
  // content is either an array of dataURLs for paginated, image-based formats (PDF),
  // or a single string of HTML/text for other formats.
  content: string[] | string;
  textContent: string; // Full plain text content for AI context and search
  pages?: number; // Optional page/slide count
  data: string; // Keep original base64 data for potential future use
}

// This type is deprecated by GalleryItem but kept for reference if needed.
export interface FileState {
  name: string;
  type: 'pdf' | 'docx' | 'txt';
  content: any;
  text_content: string;
  pages?: number;
}

export type Tool = 'highlight' | 'pointer' | 'spotlight' | 'none';

export interface ToolState {
  activeTool: Tool;
  // Highlighter state
  color: string;
  size: number;
  // Spotlight state
  spotlightSize: number;
}

export type AiStatus = 'idle' | 'listening' | 'thinking' | 'speaking';
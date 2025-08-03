import { ToolState } from './types';

// Using RGBA to control transparency directly, ensuring readability on all backgrounds.
export const HIGHLIGHT_COLORS = [
  'rgba(255, 255, 51, 0.5)', // Neon Yellow
  'rgba(51, 255, 51, 0.5)',  // Neon Green
  'rgba(51, 255, 255, 0.5)', // Neon Cyan
  'rgba(255, 51, 255, 0.5)', // Neon Magenta
];

export const HIGHLIGHT_SIZES = [16, 24, 32, 40]; // Represents stroke width

export const SPOTLIGHT_SIZES = { min: 20, max: 400, step: 1 }; // Radius in pixels

export const ZOOM_LEVELS = {
  min: 0.25,
  max: 3.0,
  step: 0.25,
};

export const INITIAL_TOOL_STATE: ToolState = {
  activeTool: 'none',
  color: HIGHLIGHT_COLORS[0],
  size: HIGHLIGHT_SIZES[1],
  spotlightSize: 100, // Default size
};
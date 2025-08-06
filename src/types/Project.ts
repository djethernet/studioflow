export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // StudioFlow project data - serialized studio store state
  studioData?: {
    studioItems: unknown[];
    connections: unknown[];
    viewport: unknown;
    // Add other studio state as needed
  };
  // Thumbnail image URL for project preview
  thumbnailUrl?: string;
}

export type CreateProjectData = {
  name: string;
  description?: string;
  studioData?: Project['studioData'];
}
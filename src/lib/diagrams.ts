// Registry mapping diagram IDs (referenced from YAML) to Astro components.
// Add new diagrams by importing the component and registering its ID here.

import ClusterDiagram from "../components/ClusterDiagram.astro";
import ArchitectureDiagram from "../components/ArchitectureDiagram.astro";

export const diagrams: Record<string, any> = {
  cluster: ClusterDiagram,
  architecture: ArchitectureDiagram,
};

import { ResourceBar } from "@/components/ResourceBar";

interface SteamPressureDisplayProps {
  value: number;
  max: number;
}

export const SteamPressureDisplay = ({ value, max }: SteamPressureDisplayProps) => {
  return <ResourceBar label="Pressao de Vapor" value={value} max={max} tone="steam" />;
};
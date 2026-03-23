import { ResourceBar } from "@/components/ResourceBar";

interface StructuralIntegrityDisplayProps {
  value: number;
  max: number;
}

export const StructuralIntegrityDisplay = ({ value, max }: StructuralIntegrityDisplayProps) => {
  return <ResourceBar label="Integridade Estrutural" value={value} max={max} tone="integrity" />;
};
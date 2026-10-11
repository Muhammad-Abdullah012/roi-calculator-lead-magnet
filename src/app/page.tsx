import { config } from "@/lib/config";
import { CalculatorFlow } from "@/components/calculator/CalculatorFlow";

export default function HomePage() {
  return (
    <div className="grid-backdrop min-h-screen">
      <CalculatorFlow config={config} />
    </div>
  );
}

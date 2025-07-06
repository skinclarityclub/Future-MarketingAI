import { Metadata } from "next";
import DirectWorkflowControl from "@/components/workflows/direct-workflow-control";

export const metadata: Metadata = {
  title: "Direct Workflow Control - BI Dashboard",
  description: "Direct control and management of n8n workflows",
};

export default function DirectWorkflowControlPage() {
  return (
    <div className="container mx-auto py-6">
      <DirectWorkflowControl />
    </div>
  );
}

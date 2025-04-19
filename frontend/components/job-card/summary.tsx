import { ListChecks } from "lucide-react";

type Props = {
  summary: string;
};

export default function Summary(props: Props) {
  const { summary } = props;
  const { mainSummary, technicalSummary } = parseAiSummary(summary);

  // Limit the number of items displayed
  const mainSummaryLimited = mainSummary.slice(0, 2);
  const technicalSummaryLimited = technicalSummary.slice(0, 2);

  return (
    <div className="space-y-0 text-sm">
      {mainSummaryLimited.length > 0 && (
        <div>
          {/* <h4 className="font-medium text-gray-700 mb-1">Summary:</h4> */}
          <ul className="ml-3 list-outside list-disc space-y-1 text-gray-600">
            {mainSummaryLimited.map((item, index) => (
              <li key={`main-${index}`} className="list-item">
                {item.length > 200 ? item.slice(0, 200) + "..." : item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {technicalSummaryLimited.length > 0 && (
        <div>
          <div className="mx-auto my-4 w-[90%]">
            <hr />
          </div>
          {/* <h4 className="font-medium text-gray-700 mb-1">Technical requirements:</h4> */}
          <ul className="ml-3 list-outside list-disc space-y-1 text-gray-600">
            {technicalSummaryLimited.map((item, index) => (
              <li key={`tech-${index}`} className="list-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function cleanAndSplit(text: string | undefined): string[] {
  if (!text) {
    return [];
  }
  return text
    .split("\n")
    .map((line) => line.trim()) // Trim whitespace
    .map((line) => line.replace(/^[-*]\s*/, "")) // Remove leading - or *
    .filter(Boolean); // Remove empty lines
}

function parseAiSummary(summary: string): {
  mainSummary: string[];
  technicalSummary: string[];
} {
  // Split by one or more newlines to handle different spacings robustly
  const parts = summary.split(/\n\n+/);
  const nonTechnical = parts[0];
  // Join the remaining parts (if any) back with double newlines, then split/clean
  const technical = parts.length > 1 ? parts.slice(1).join("\n\n") : undefined;

  return {
    mainSummary: cleanAndSplit(nonTechnical),
    technicalSummary: cleanAndSplit(technical),
  };
}

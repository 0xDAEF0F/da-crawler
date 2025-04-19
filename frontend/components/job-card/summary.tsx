import { ListChecks } from "lucide-react";

type Props = {
  summary: string;
};

export default function Summary(props: Props) {
  const { summary } = props;
  const { mainSummary, technicalSummary } = parseAiSummary(summary);

  return (
    <div className="space-y-3 text-sm">
      {mainSummary.length > 0 && (
        <div>
          {/* <h4 className="font-medium text-gray-700 mb-1">Summary:</h4> */}
          <ul className="list-inside list-disc space-y-1 text-gray-600">
            {mainSummary.map((item, index) => (
              <li key={`main-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {technicalSummary.length > 0 && (
        <div>
          {/* <h4 className="font-medium text-gray-700 mb-1">Technical requirements:</h4> */}
          <ul className="list-inside list-disc space-y-1 text-gray-600">
            {technicalSummary.map((item, index) => (
              <li key={`tech-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function parseAiSummary(summary: string): {
  mainSummary: string[];
  technicalSummary: string[];
} {
  const hasEmptyLine = summary.includes("\n\n");
  if (hasEmptyLine) {
    const [non_technical, technical] = summary.split("\n\n");
    return {
      mainSummary: non_technical.split("\n").filter(Boolean),
      technicalSummary: technical.split("\n").filter(Boolean),
    };
  } else {
    return {
      mainSummary: [summary],
      technicalSummary: [],
    };
  }
}

import { Paper } from "@prisma/client";

interface PaperCardProps {
  paper: Paper & { authors: { name: string }[] };
}

export default function PaperCard({ paper }: PaperCardProps) {
  // TODO: Implement paper display logic


  const authorNames = paper.authors.map((a) => a.name).join(", ");



  return (
    <li className="border p-4 rounded shadow">
      <h3 className="text-xl font-semibold">{paper.title}</h3>
      <p>{paper.publishedIn}</p>
      <p>{paper.year}</p>
      <p>Authors: {authorNames}</p>
    </li>
  );
}

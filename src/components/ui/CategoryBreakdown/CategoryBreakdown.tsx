import { ResponsivePie } from "@nivo/pie";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

export interface ICategoryBreakdown {
  id: string;
  label: string;
  value: number;
  color: string;
}

// @ts-ignore
const data: {
  id: string;
  label: string;
  value: number;
  color: string;
}[] = [
  {
    id: "python",
    label: "python",
    value: 82,
    color: "hsl(244, 70%, 50%)",
  },
  {
    id: "java",
    label: "java",
    value: 217,
    color: "hsl(102, 70%, 50%)",
  },
  {
    id: "go",
    label: "go",
    value: 567,
    color: "hsl(298, 70%, 50%)",
  },
  {
    id: "make",
    label: "make",
    value: 89,
    color: "hsl(159, 70%, 50%)",
  },
  {
    id: "erlang",
    label: "erlang",
    value: 560,
    color: "hsl(187, 70%, 50%)",
  },
  {
    id: "ruby",
    label: "ruby",
    value: 123,
    color: "hsl(210, 70%, 50%)",
  },
  {
    id: "swift",
    label: "swift",
    value: 456,
    color: "hsl(270, 70%, 50%)",
  },
  {
    id: "kotlin",
    label: "kotlin",
    value: 234,
    color: "hsl(330, 70%, 50%)",
  },
  {
    id: "typescript",
    label: "typescript",
    value: 345,
    color: "hsl(30, 70%, 50%)",
  },
  {
    id: "rust",
    label: "rust",
    value: 678,
    color: "hsl(60, 70%, 50%)",
  },
  {
    id: "haskell",
    label: "haskell",
    value: 910,
    color: "hsl(90, 70%, 50%)",
  },
  {
    id: "lisp",
    label: "lisp",
    value: 111,
    color: "hsl(120, 70%, 50%)",
  },
  {
    id: "sql",
    label: "sql",
    value: 222,
    color: "hsl(150, 70%, 50%)",
  },
  {
    id: "bash",
    label: "bash",
    value: 333,
    color: "hsl(180, 70%, 50%)",
  },
  {
    id: "perl",
    label: "perl",
    value: 444,
    color: "hsl(210, 70%, 50%)",
  },
  {
    id: "php",
    label: "php",
    value: 555,
    color: "hsl(240, 70%, 50%)",
  },
  {
    id: "javascript",
    label: "javascript",
    value: 666,
    color: "hsl(270, 70%, 50%)",
  },
  {
    id: "csharp",
    label: "csharp",
    value: 777,
    color: "hsl(300, 70%, 50%)",
  },
  {
    id: "vbnet",
    label: "vbnet",
    value: 888,
    color: "hsl(330, 70%, 50%)",
  },
  {
    id: "delphi",
    label: "delphi",
    value: 999,
    color: "hsl(360, 70%, 50%)",
  },
];

const CategoryBreakdown = ({ data }: { data: ICategoryBreakdown[] }) => {
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 2]],
      }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: {
            id: "ruby",
          },
          id: "dots",
        },
        {
          match: {
            id: "c",
          },
          id: "dots",
        },
        {
          match: {
            id: "go",
          },
          id: "dots",
        },
        {
          match: {
            id: "python",
          },
          id: "dots",
        },
        {
          match: {
            id: "scala",
          },
          id: "lines",
        },
        {
          match: {
            id: "lisp",
          },
          id: "lines",
        },
        {
          match: {
            id: "elixir",
          },
          id: "lines",
        },
        {
          match: {
            id: "javascript",
          },
          id: "lines",
        },
      ]}
    />
  );
};
export default CategoryBreakdown;

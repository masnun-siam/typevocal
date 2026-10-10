// Brand name, not a translatable string.
const BRAND = "TypeVocal";

const TypeVocalTextLogo = ({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => (
  <svg
    width={width}
    height={height}
    className={className}
    viewBox="0 0 560 120"
    role="img"
    aria-label={BRAND}
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="0"
      y="90"
      fill="currentColor"
      fontFamily="inherit"
      fontSize="100"
      fontWeight="700"
    >
      {BRAND}
    </text>
  </svg>
);

export default TypeVocalTextLogo;

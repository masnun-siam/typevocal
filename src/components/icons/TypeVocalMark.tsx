const TypeVocalMark = ({
  width,
  height,
  className,
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) => (
  <svg
    width={width || 128}
    height={height || 128}
    viewBox="0 0 1024 1024"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(512 512) scale(0.7) translate(-512 -512)">
      <g stroke="#FFFFFF" strokeWidth="128" strokeLinecap="round">
        <line x1="256" y1="384" x2="256" y2="640" />
        <line x1="512" y1="320" x2="512" y2="704" />
      </g>
      <line
        x1="768"
        y1="256"
        x2="768"
        y2="768"
        stroke="#FBBF24"
        strokeWidth="128"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

export default TypeVocalMark;

export function ScenePoster(): React.JSX.Element {
  return (
    <svg
      data-scene-poster
      viewBox="0 0 800 800"
      fill="none"
      aria-label="Exploded engineering core, an original geometric study"
      role="img"
    >
      <defs>
        <linearGradient
          id="studio-metal"
          x1="160"
          y1="100"
          x2="670"
          y2="700"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BDEEFF" stopOpacity=".8" />
          <stop offset=".42" stopColor="#28383F" />
          <stop offset="1" stopColor="#67D5E7" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id="studio-aura">
          <stop stopColor="#67D5E7" stopOpacity=".16" />
          <stop offset="1" stopColor="#67D5E7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="350" fill="url(#studio-aura)" />
      <g transform="translate(400 400) rotate(-23)">
        <ellipse rx="235" ry="278" stroke="#BDEEFF" strokeOpacity=".22" />
        <ellipse rx="180" ry="230" stroke="#BDEEFF" strokeOpacity=".12" />
        {[-100, -50, 0, 50, 100].map((y, i) => (
          <g key={y} transform={`translate(0 ${y})`}>
            <path
              d="M-150 -36 0 -120 150 -36 0 52Z"
              fill="#12191E"
              fillOpacity=".85"
              stroke="url(#studio-metal)"
              strokeWidth="2"
            />
            <path d="M-150 -36V-20L0 68 150-20V-36M0 52V68" stroke="#4B6B75" />
            <path
              d="m-90-36 90-50 90 50-90 50Z"
              stroke="#67D5E7"
              strokeOpacity={0.3 + i * 0.1}
            />
            <circle cy="-36" r="6" fill="#BDEEFF" />
          </g>
        ))}
        <path
          d="M0-300V300M-270 0H270"
          stroke="#BDEEFF"
          strokeOpacity=".15"
          strokeDasharray="3 8"
        />
      </g>
    </svg>
  );
}

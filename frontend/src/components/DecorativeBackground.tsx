export function DecorativeBackground() {
  return (
    <>
      <div className="circle circle-glow" aria-hidden="true" />
      <div className="circle circle-outline" aria-hidden="true" />
      <svg className="wave" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true">
        <path
          className="wave-fill"
          d="M0 155 C180 65 270 65 450 155 S720 245 900 155 S1170 65 1440 155 V260 H0 Z"
        />
        <path
          className="wave-line"
          d="M0 155 C180 65 270 65 450 155 S720 245 900 155 S1170 65 1440 155"
        />
        <path
          className="wave-line wave-line-secondary"
          d="M0 190 C180 100 270 100 450 190 S720 280 900 190 S1170 100 1440 190"
        />
      </svg>
    </>
  );
}

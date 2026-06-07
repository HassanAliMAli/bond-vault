"use client";

import { useEffect, useRef, useState } from "react";

function FormattedCounter({
  to,
  from = 0,
  duration = 1.5,
  className = "",
}: {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const startTime = performance.now();
          const step = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.round(from + (to - from) * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, from, duration]);

  return <span ref={ref} className={className}>{displayValue.toLocaleString()}</span>;
}

export { FormattedCounter };

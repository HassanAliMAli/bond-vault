"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, animate } from "framer-motion";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

function AnimatedCounter({
  from = 0,
  to,
  duration = 1.5,
  className = "",
  prefix = "",
  suffix = "",
  formatter,
}: AnimatedCounterProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(from, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(spring, to, { duration });
    return controls.stop;
  }, [to, duration, spring, isInView]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const display = spring.get();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {isInView ? (
        <motion.span>
          {spring}
        </motion.span>
      ) : (
        <span>{from}</span>
      )}
      {suffix}
    </span>
  );
}

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

  return (
    <span ref={ref} className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}

export { AnimatedCounter, FormattedCounter };
export type { AnimatedCounterProps };

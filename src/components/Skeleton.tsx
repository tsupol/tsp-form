import { HTMLAttributes } from "react";
import clsx from "clsx";
import "../styles/skeleton.css";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
};

export const Skeleton = ({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
  style,
  ...rest
}: SkeletonProps) => {
  return (
    <div
      className={clsx(
        "skeleton",
        `skeleton-${variant}`,
        animation !== "none" && `skeleton-${animation}`,
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...rest}
    />
  );
};

Skeleton.displayName = "Skeleton";

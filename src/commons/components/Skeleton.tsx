import type { CSSProperties, JSX } from "react";
import "./skeleton.css";

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
  circle?: boolean;
};

/**
 * Bloque de placeholder con shimmer, usado para armar esqueletos de página.
 */
export function Skeleton({ className, style, circle = false }: SkeletonProps): JSX.Element {
  const classes = ["app-skeleton", circle ? "app-skeleton--circle" : "", className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} style={style} aria-hidden="true" />;
}

export type PageSkeletonVariant = "content" | "welcome" | "tasks" | "finance" | "admin";

type PageSkeletonProps = {
  variant?: PageSkeletonVariant;
};

function SkeletonRows({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className="app-page-skeleton__list">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="app-page-skeleton__row">
          <Skeleton className="app-page-skeleton__action" circle />
          <div>
            <Skeleton className="app-skeleton--title" />
            <Skeleton className="app-skeleton--subtitle" />
          </div>
          <div className="app-page-skeleton__actions">
            <Skeleton className="app-page-skeleton__action" />
            <Skeleton className="app-page-skeleton__action" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Lista de filas placeholder para reemplazar textos "Cargando…" dentro de una vista.
 */
export function ListSkeleton({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className="app-page-skeleton" role="status" aria-live="polite" aria-busy="true">
      <SkeletonRows count={count} />
    </div>
  );
}

/**
 * Esqueleto de contenido según la ventana activa (estilo YouTube mobile).
 */
export function PageSkeleton({ variant = "content" }: PageSkeletonProps): JSX.Element {
  if (variant === "welcome") {
    return (
      <div className="app-page-skeleton" role="status" aria-live="polite" aria-busy="true">
        <Skeleton className="app-skeleton--title" style={{ width: "10rem" }} />
        <div className="app-page-skeleton__list">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="app-page-skeleton__menu-card">
              <Skeleton className="app-page-skeleton__icon" />
              <div>
                <Skeleton className="app-skeleton--title" />
                <Skeleton className="app-skeleton--subtitle" />
              </div>
              <Skeleton className="app-page-skeleton__action" />
            </div>
          ))}
        </div>
        <Skeleton className="app-skeleton--title" style={{ width: "8rem", marginTop: "0.5rem" }} />
        <SkeletonRows count={3} />
      </div>
    );
  }

  if (variant === "tasks") {
    return (
      <div className="app-page-skeleton" role="status" aria-live="polite" aria-busy="true">
        <div className="app-page-skeleton__header">
          <Skeleton className="app-page-skeleton__button" />
        </div>
        <div className="app-page-skeleton__tabs app-page-skeleton__tabs--4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="app-page-skeleton__tab" />
          ))}
        </div>
        <div className="app-page-skeleton__tabs">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="app-page-skeleton__tab" />
          ))}
        </div>
        <SkeletonRows count={5} />
      </div>
    );
  }

  if (variant === "finance") {
    return (
      <div className="app-page-skeleton" role="status" aria-live="polite" aria-busy="true">
        <div className="app-page-skeleton__header">
          <Skeleton className="app-page-skeleton__button" />
        </div>
        <div className="app-page-skeleton__summary">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="app-page-skeleton__card">
              <Skeleton className="app-skeleton--line" style={{ width: "4rem" }} />
              <Skeleton className="app-skeleton--title" style={{ width: "6rem" }} />
            </div>
          ))}
        </div>
        <div className="app-page-skeleton__tabs app-page-skeleton__tabs--5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="app-page-skeleton__tab" />
          ))}
        </div>
        <SkeletonRows count={4} />
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="app-page-skeleton" role="status" aria-live="polite" aria-busy="true">
        <div className="app-page-skeleton__grid">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="app-page-skeleton__card" style={{ minHeight: "8rem" }}>
              <Skeleton className="app-skeleton--title" />
              <Skeleton className="app-skeleton--subtitle" />
              <Skeleton className="app-skeleton--subtitle" style={{ width: "60%" }} />
              <Skeleton className="app-page-skeleton__button" style={{ marginTop: "0.5rem" }} />
            </div>
          ))}
        </div>
        <div className="app-page-skeleton__card">
          <div className="app-page-skeleton__row" style={{ border: 0, padding: 0, background: "transparent" }}>
            <Skeleton className="app-page-skeleton__avatar" circle />
            <div>
              <Skeleton className="app-skeleton--title" />
              <Skeleton className="app-skeleton--subtitle" />
            </div>
          </div>
        </div>
        <SkeletonRows count={3} />
      </div>
    );
  }

  return (
    <div className="app-page-skeleton" role="status" aria-live="polite" aria-busy="true">
      <Skeleton className="app-skeleton--title" />
      <Skeleton className="app-skeleton--subtitle" />
      <SkeletonRows count={4} />
    </div>
  );
}

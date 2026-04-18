interface HeadingProps {
  title: string;
  description?: string;
}

export function Heading({ title, description }: HeadingProps) {
  return (
    <div className="min-w-0">
      <h2 className="break-words text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {description && (
        <p className="mt-1 break-words text-muted-foreground text-sm leading-relaxed">{description}</p>
      )}
    </div>
  );
}


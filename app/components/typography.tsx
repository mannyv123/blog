import clsx from "clsx";

const fontSizes = {
  h1: "font-display font-bold text-6xl",
  h2: "font-body font-bold text-5xl",
  h3: "font-body font-medium text-4xl",
  h4: "font-body font-medium text-3xl",
};

const titleColors = {
  primary: "text-gray-100 dark:text-white",
  secondary: "text-gray-300 dark:text-white",
};

type TitleProps = {
  variant?: "primary" | "secondary";
  As?: React.ElementType;
  className?: string;
  id?: string;
} & (
  | { children: React.ReactNode }
  | {
      dangerouslySetInnerHTML: {
        __html: string;
      };
    }
);

function Title({
  variant = "primary",
  As,
  size,
  className,
  ...rest
}: TitleProps & { size: keyof typeof fontSizes }) {
  const Tag = As ?? size;
  return (
    <Tag
      className={clsx(fontSizes[size], titleColors[variant], className)}
      {...rest}
    />
  );
}

export const H1 = (props: TitleProps) => {
  return <Title {...props} size="h1" />;
};

export const H2 = (props: TitleProps) => {
  return <Title {...props} size="h2" />;
};

export const H3 = (props: TitleProps) => {
  return <Title {...props} size="h3" />;
};

export const H4 = (props: TitleProps) => {
  return <Title {...props} size="h4" />;
};

type CommonProps = {
  children: React.ReactNode;
  [key: string]: any;
};

export const BlockQuote = ({ children, ...rest }: CommonProps) => (
  <div {...rest}> {children} </div>
);
export const ShortQuote = ({ children, ...rest }: CommonProps) => (
  <div {...rest}>{children}</div>
);
export const TextLink = ({ children, ...rest }: CommonProps) => (
  <div {...rest}>{children}</div>
);

export const SmallAsterisk = ({ children, ...rest }: CommonProps) => (
  <div {...rest}>{children}</div>
);

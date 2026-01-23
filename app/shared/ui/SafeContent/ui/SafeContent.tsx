
import { purify } from "../lib/purify";
import { SafeContentProps } from "../model";

export const SafeContent = ({ html, className }: SafeContentProps) => {
  if (!html) return null;

  const clean = purify.sanitize(html);
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
};

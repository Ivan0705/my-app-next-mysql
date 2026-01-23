import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(500).optional(),
  technologies: z.string().max(200),
  imageUrl: z.string().url().optional().or(z.literal("")),
  githubLink: z.string().url().optional().or(z.literal("")),
  demoLink: z.string().url().optional().or(z.literal("")),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export const validateProject = (data: unknown) => {
  return projectSchema.safeParse(data);
};

import { ArrowUpRight, Github } from 'lucide-react'

import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { ProjectScene } from '@/components/project-scenes'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { CatalogProject } from '@/data/projects'

export function ProjectPreviewCard({ project }: { project: CatalogProject }) {
  const githubUrl = project.githubUrl ?? project.href
  const hasProjectView = Boolean(
    project.to || project.homepageUrl || project.href,
  )

  return (
    <Card className="h-full gap-0 overflow-hidden py-0">
      <div className="bg-muted/50 p-3">
        <div className="h-28 overflow-hidden rounded-xl border bg-background sm:h-32">
          <ProjectScene id={project.id} />
        </div>
      </div>
      <CardHeader className="gap-2 px-5 pt-5 pb-4">
        <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm leading-relaxed sm:text-base">
          {project.description}
        </CardDescription>
      </CardHeader>
      {project.installCommand ? (
        <CardContent className="px-5 pb-5">
          <InstallCommand command={project.installCommand} />
        </CardContent>
      ) : null}
      <Separator className="mt-auto" />
      <CardFooter className="flex-wrap justify-end gap-2 px-5 py-4">
        {hasProjectView ? (
          <Button asChild size="sm">
            {project.homepageUrl && !project.to ? (
              <a href={project.homepageUrl} target="_blank" rel="noreferrer">
                View project
                <ArrowUpRight data-icon="inline-end" />
              </a>
            ) : (
              <ProjectLink project={project}>
                View project
                <ArrowUpRight data-icon="inline-end" />
              </ProjectLink>
            )}
          </Button>
        ) : null}
        {githubUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={githubUrl} target="_blank" rel="noreferrer">
              <Github data-icon="inline-start" />
              Source
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}

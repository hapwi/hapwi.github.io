import { ArrowUpRight } from 'lucide-react'

import { GitHubStarsButton } from '@/components/github-stars-button'
import { InstallCommand, ProjectLink } from '@/components/catalog-row'
import { ProjectScene } from '@/components/project-scenes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
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

export function ProjectPreviewCard({
  project,
}: {
  project: CatalogProject
}) {
  const githubUrl = project.githubUrl ?? project.href
  const hasInSiteOpen = Boolean(project.to)

  return (
    <Card className="h-full py-0">
      <div className="bg-muted/40 p-3 sm:p-4">
        <div className="h-44">
          <ProjectScene id={project.id} />
        </div>
      </div>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-10">
          {project.description}
        </CardDescription>
      </CardHeader>
      {project.installCommand ? (
        <CardContent>
          <InstallCommand command={project.installCommand} />
        </CardContent>
      ) : null}
      <Separator className="mt-auto" />
      <CardFooter className="gap-2 pb-6">
        {project.language ? (
          <Badge variant="outline">{project.language}</Badge>
        ) : null}
        <ButtonGroup className="ml-auto">
          {hasInSiteOpen ? (
            <Button asChild size="sm">
              <ProjectLink project={project}>
                Open
                <ArrowUpRight data-icon="inline-end" />
              </ProjectLink>
            </Button>
          ) : null}
          {githubUrl ? (
            <GitHubStarsButton href={githubUrl} stars={project.stars ?? 0} />
          ) : null}
        </ButtonGroup>
      </CardFooter>
    </Card>
  )
}

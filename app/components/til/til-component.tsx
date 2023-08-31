import type {TilMdxPage} from 'types'
import {useMdxComponent} from '~/utils/mdx'
import {ContentCard} from './content-card'

export function TilComponent({til}: {til: TilMdxPage}) {
  const Component = useMdxComponent(String(til.code))

  if (!til?.frontmatter) return null

  return (
    <div className="mb-24 first-of-type:mt-16 last-of-type:mb-0">
      <ContentCard
        id={til.slug}
        titleTo={`/til?offset=${til.offset}#${til.slug}`}
        title={til.frontmatter.title}
        date={til.frontmatter.date}
        tag={til.frontmatter.tag}
      >
        <Component />
      </ContentCard>
    </div>
  )
}

import {HeadersFunction, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useEffect, useMemo, useRef} from 'react'
import {ContentCard} from '~/components/til/content-card'
import {getMdxTilListGql} from '~/utils/mdx'
import {tilMapper} from '~/utils/til-list'
import LazyLoad from 'vanilla-lazyload'

import styles from '~/styles/til.css'

export async function loader() {
  const tilList = await getMdxTilListGql()
  return json({tilList})
}

export const headers: HeadersFunction = ({loaderHeaders}) => {
  return {'Cache-Control': String(loaderHeaders.get('Cache-Control'))}
}

export default function TilPage() {
  const {tilList} = useLoaderData<typeof loader>()
  const mountedRef = useRef(false)

  let tilComponents = useMemo(() => tilList.map(tilMapper), [tilList])

  useEffect(() => {
    if (!mountedRef.current) {
      new LazyLoad()
      mountedRef.current = true
    }
  }, [])

  return (
    <div
      className='
    relative ml-[10vw] mr-[10vw] mt-8 pb-8 after:absolute
    after:left-[-13vw]
    after:top-[10px]
    after:hidden
    after:h-full
    after:w-[2px]
    after:bg-gray-100
    after:content-[""]
    after:dark:bg-white
    md:ml-[18vw]
    after:md:block
    '
    >
      <div className="prose prose-light max-w-full dark:prose-dark">
        {tilComponents.map((til, i) => {
          const Component: any = tilComponents?.[i]?.component ?? null
          if (!til?.frontmatter) return null

          return (
            <div
              key={`${til.frontmatter.title}-${til.frontmatter.date}`}
              className="mb-24 first-of-type:mt-16 last-of-type:mb-0"
            >
              <ContentCard
                id={til.slug}
                title={til.frontmatter.title}
                date={til.frontmatter.date}
                tag={til.frontmatter.tag}
              >
                {Component ? <Component /> : null}
              </ContentCard>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export function links() {
  return [{rel: 'stylesheet', href: styles}]
}

import styles from '~/styles/til.css'
import { H1, H2 } from '~/components/typography'
import { NavLink, useLoaderData } from '@remix-run/react'
import { getMdxTagList } from '~/utils/mdx'
import { json } from '@remix-run/node'

export async function loader() {
  const tagList = await getMdxTagList()
  return json({ tagList })
}

export default function TilPage() {
  const { tagList } = useLoaderData<typeof loader>()
  console.log('yo', tagList)
  return (
    <div className='page-container'>
      <H1>Tags</H1>
      <div className='mt-8'>
        {Object.entries(tagList).map(([firstLtter, tags]) => {
          return (
            <div className='mb-20 last-of-type:mb-0'>
              <H2>{firstLtter}</H2>
              <ul className='md:flex md:flex-wrap'>
                {tags.map((tag) => {
                  return (
                    <li
                      key={tag.name}
                      className='
                      mb-4 md:mb-0 
                      last-of-type:mr-0 
                      mr-6 
                      first-of-type:ml-0
                      md:first-of-type:ml-6
                      md:ml-6'
                    >
                      <NavLink
                        className='linkable-tag'
                        to={`/tags/${tag.name}`}
                      >
                        {' '}
                        {`${tag.name} [${tag.value}]`}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}
import styles from '~/styles/til.css'
import { H1 } from '~/components/typography'
import { useLoaderData } from '@remix-run/react'
import { getMdxTagList } from '~/utils/mdx'
import { json } from '@remix-run/node'

export async function loader() {
  const tagList = await getMdxTagList()
  return json({ tagList })
}

export default function TilPage() {
  const data = useLoaderData<typeof loader>()
  console.log('hi', data)
  return (
    <div className='page-container'>
      <H1>Tags</H1>
    </div>
  )
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

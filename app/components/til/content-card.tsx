import {NavLink} from '@remix-run/react'
import clsx from 'clsx'
import {dotFormattedDate} from '~/utils/misc'
import {H1} from '../typography'

type Props = {
  title?: string
  date?: string
  tag?: string
  children?: React.ReactNode
  showBlackLine?: boolean
  id?: string
}

const blackLinkClasses = `
    after:hidden
    after:md:block
    after:absolute
    after:top-[10px]
    after:left-[-13vw]
    after:bg-gray-100
    after:dark:bg-white
    after:h-[2px]
    after:w-[11vw]

    before:hidden
    before:md:block
    before:content: ""
    before:absolute
    before:rounded-full
    before:h-[18px]
    before:w-[18px]
    before:top-[12px]
    before:left-[-2vw]
    before:bg-gray-100
    before:dark:bg-white
    before:translate-y-[-50%]
    before:translate-x-[-50%]
`

export const ContentCard = ({
  id,
  title,
  date,
  tag,
  children,
  showBlackLine = true,
}: Props) => {
  return (
    <div
      id={id}
      className={clsx(showBlackLine && blackLinkClasses, 'relative')}
    >
      <div className="block items-start md:flex">
        <div className="order-0 mr-6 block flex-col text-lg text-accent md:flex">
          {date ? dotFormattedDate(date) : null}
          <NavLink
            className="ml-4 mr-2 font-bold uppercase text-accent no-underline md:ml-0"
            to={`/tags/${tag}`}
          >
            {tag}
          </NavLink>
        </div>
        <NavLink className="group no-underline" to={`./#${id}`}>
          <H1 className="my-4 uppercase leading-[1em] transition-all group-hover:underline md:my-0">
            {title}
          </H1>
        </NavLink>
      </div>
      <div className="mt-2 text-lg md:text-left">{children}</div>
    </div>
  )
}
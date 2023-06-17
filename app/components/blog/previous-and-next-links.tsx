import {Link} from '@remix-run/react'
import {twMerge} from 'tailwind-merge'
import {H4} from '../typography'

type BlogLink = {
  title?: string
  to?: string
}

type Props = {
  previous: BlogLink | null
  next: BlogLink | null
}

export function PreviousAndNextLinks({previous, next}: Props) {
  return (
    <div
      className={twMerge(
        'mb-6 mt-8 flex justify-between',
        next && !previous && 'justify-end',
      )}
    >
      {previous ? (
        <div className="max-w-[48%]">
          <Link className="group" to={`/blog/${String(previous.to)}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="absolute left-[-20px] top-[3px] h-5 w-5 transition-transform group-hover:translate-x-[-5px] lg:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>

            <H4 className="text-lg md:text-lg">{previous?.title}</H4>
          </Link>
        </div>
      ) : null}
      {next ? (
        <div className="max-w-[48%]">
          <Link className="group" to={`/blog/${String(next.to)}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="absolute right-[-20px] top-[3px] h-5 w-5 transition-transform group-hover:translate-x-[4px] lg:block"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>

            <H4 className="text-right text-lg md:text-lg">{next?.title}</H4>
          </Link>
        </div>
      ) : null}
    </div>
  )
}
import React from 'react'
import * as mdxBundler from 'mdx-bundler/client'
import * as myTypo from '~/components/typography'
import type {GithubGraphqlObject, MdxPage, MdxPageAndSlug} from 'types'
import {downloadDirGql} from '~/utils/github.server'
import {queuedCompileMdxGql} from './mdx.server'
import {redisCache, redisClient} from './redis.server'
import type {CachifiedOptions} from 'cachified'
import cachified, {verboseReporter} from 'cachified'
import {CloudinaryHeroImage} from '~/components/hero-image'
import {LazyGiphy} from '~/components/lazy-iframe'
import {Callout} from '~/components/callout'

type CommonGetProps = {
  cachifiedOptions?: Partial<Pick<CachifiedOptions<any>, 'forceFresh' | 'key'>>
}

function getGithubGqlObjForMdx(entry: GithubGraphqlObject) {
  if (entry?.object?.text) {
    return {
      name: entry?.name,
      files: [entry],
    }
  }
  return {
    name: entry?.name,
    files: entry?.object?.entries ?? [],
  }
}

async function delMdxPageGql({
  contentDir,
  slug,
}: {
  contentDir: string
  slug: string
}): Promise<any> {
  return redisClient.del(`gql:${contentDir}:${slug}`)
}

async function getMdxPageGql({
  contentDir,
  slug,
  cachifiedOptions,
}: CommonGetProps & {
  contentDir: string
  slug: string
}): Promise<MdxPage | any> {
  return cachified({
    key: `gql:${contentDir}:${slug}`,
    cache: redisCache,
    getFreshValue: async () => {
      const pageFile = await downloadDirGql(`content/${contentDir}/${slug}`)

      const compiledPage = await queuedCompileMdxGql<MdxPage['frontmatter']>(
        `${contentDir}/${slug}`,
        pageFile.repository.object.entries ?? [],
      ).catch(err => {
        console.error(`Failed to compile mdx:`, {
          contentDir,
          slug,
        })
        return Promise.reject(err)
      })

      return compiledPage
    },
    reporter: verboseReporter(),
    ...cachifiedOptions,
  })
}

const mdxComponents = {
  ...myTypo,
  Callout,
  LazyGiphy,
  CloudinaryHeroImage,
}

/**
 * This should be rendered within a useMemo
 * @param code the code to get the component from
 * @returns the component
 */
function getMdxComponent(code: string) {
  const Component = mdxBundler.getMDXComponent(code)
  function KCDMdxComponent({
    components,
    ...rest
  }: Parameters<typeof Component>['0']) {
    return (
      <Component components={{...mdxComponents, ...components}} {...rest} />
    )
  }
  // thanks kent
  return KCDMdxComponent
}

type TilMdxPage = MdxPageAndSlug& { offset: number}
async function getMdxTilListGql({cachifiedOptions}: CommonGetProps = {}) {
  return cachified({
    key: `gql:til:list`,
    cache: redisCache,
    getFreshValue: async () => {
      const dirList = await downloadDirGql(`content/til`)
      const pageData =
        dirList.repository.object?.entries?.map(getGithubGqlObjForMdx) ?? []

      // have some tils that aren't in directories
      const sanitizedPageNames = pageData.map(page => {
        return {
          ...page,
          name: page.name.replace(/\.mdx$/, ''),
        }
      })

      const sortedPageData = sanitizedPageNames.sort((a, b) => {
        return b.name.toLowerCase().localeCompare(a.name.toLowerCase(), 'en')
      })

      const pages = await Promise.all(
        sortedPageData.map(pageData =>
          queuedCompileMdxGql(pageData.name, pageData.files),
        ),
      ).catch(err => {
        console.error(`Failed to compile mdx for til list`)
        return Promise.reject(err)
      })

      const nonNullPages = pages.filter(page => page !== null) as MdxPage[]

      // create array of arrays of 20 from the tilList;
      const chunkedList = []
      for (let i = 0,j = 1; i < nonNullPages.length; i += 20, j+=1) {
        const itemsToPush = nonNullPages.slice(i, i + 20)?.map(o => ({...o, offset: j}))
        chunkedList.push(itemsToPush as TilMdxPage[]) 
      }

      return {
        fullList: nonNullPages as MdxPage[],
        chunkedList,
      }
    },
    reporter: verboseReporter(),
    ...cachifiedOptions,
  })
}

async function getMdxBlogListGraphql({cachifiedOptions}: CommonGetProps = {}) {
  return cachified({
    key: 'gql:blog:list',
    cache: redisCache,
    getFreshValue: async () => {
      const dirList = await downloadDirGql('content/blog')
      const pageData =
        dirList.repository.object.entries
          ?.sort((a, b) => {
            return b.name
              .toLowerCase()
              .localeCompare(a.name.toLowerCase(), 'en')
          })
          ?.map(entry => {
            return {
              name: entry?.name,
              files: entry?.object?.entries ?? [],
            }
          }) ?? []

      const pages = await Promise.all(
        pageData.map(pageData =>
          queuedCompileMdxGql(pageData.name, pageData.files),
        ),
      )

      const allPages = pages.map((page, i) => {
        if (!page) return null
        return {
          ...mapFromMdxPageToMdxListItem(page),
          path: `blog/${pageData?.[i]?.name ?? ''}`,
        }
      }) as Omit<MdxPageAndSlug, 'code'>[]

      const draftPages = allPages.filter(el => el.frontmatter?.draft) as Omit<
        MdxPageAndSlug,
        'code'
      >[]

      const publishedPages = allPages.filter(
        el => el.frontmatter?.draft !== true,
      ) as Omit<MdxPageAndSlug, 'code'>[]

      return {
        publishedPages,
        draftPages,
      }
    },
    reporter: verboseReporter(),
    ...cachifiedOptions,
  })
}

async function getMdxTagListGql({cachifiedOptions}: CommonGetProps = {}) {
  return cachified({
    key: 'gql:tag:list',
    cache: redisCache,
    getFreshValue: async () => {
      // fetch all the content for til and blog from github
      // then go through the content and pluck out the tag field from the frontmatter;
      const contentDirList = await Promise.all([
        downloadDirGql('content/blog'),
        downloadDirGql('content/til'),
      ])

      const contentDirListFlat = contentDirList.flatMap(
        dir => dir.repository.object.entries ?? [],
      )

      // get a map where the keys are the tag name, and the value is the count it shows up
      const tags = contentDirListFlat.reduce((acc, curr) => {
        const firstMdxFile = curr?.object?.text
          ? curr
          : curr?.object?.entries?.find(any => any.name.endsWith('.mdx'))

        if (!firstMdxFile) return acc

        const tag = firstMdxFile?.object?.text
          ?.match(/tag: (.*)/)?.[1]
          ?.toLowerCase()

        if (!tag) return acc

        if (acc[tag] === undefined) {
          acc[tag] = 0
        }

        const currentCount = acc[tag] ?? 0
        acc[tag] = currentCount + 1

        return acc
      }, {} as {[key: string]: number})

      // we want to create a map where the first letter
      // is the key and the value is an array
      // of objects with the name and value
      const tagList = Object.entries(tags).reduce((acc, [name, value]) => {
        const tagObj = {name, value}

        const firstLetter = name.charAt(0).toUpperCase()
        if (!acc[firstLetter]) {
          acc[firstLetter] = []
        }
        acc?.[firstLetter]?.push(tagObj)

        acc?.[firstLetter]?.sort((a, b) =>
          new Intl.Collator().compare(a.name, b.name),
        )

        return acc
      }, {} as {[key: string]: Array<{name: string; value: number}>})

      const sortedList = Object.entries(tagList).sort((a, b) =>
        new Intl.Collator().compare(a[0], b[0]),
      )

      return {
        tagList: sortedList,
        tags: Object.keys(tags),
      }
    },
    reporter: verboseReporter(),
    ...cachifiedOptions,
  })
}

// TODO: clean this up so that it's not so repetitive
async function getMdxIndividualTagGql({
  userProvidedTag,
  cachifiedOptions,
}: CommonGetProps & {userProvidedTag: string}) {
  return cachified({
    key: `gql:tag:${userProvidedTag}`,
    cache: redisCache,
    getFreshValue: async () => {
      // fetch all the content for til and blog from github
      // then go through the content and pluck out the tag field from the frontmatter;
      const getBlogList = async () => ({
        blog:
          (await downloadDirGql('content/blog'))?.repository?.object?.entries ??
          [],
      })
      const getTilList = async () => ({
        til:
          (await downloadDirGql('content/til'))?.repository?.object?.entries ??
          [],
      })

      const contentDirList = await Promise.all([getBlogList(), getTilList()])

      let retObject = await Promise.all(
        contentDirList.map(async v => {
          const [key, list] = Object.entries?.(v)?.[0] ?? []
          if (!key) throw new Error('no key for content dir list')
          if (!list) throw new Error('no value for content dir list')

          const listItemsWithTag = list
            .sort((a, b) => {
              return b.name
                .toLowerCase()
                .localeCompare(a.name.toLowerCase(), 'en')
            })
            .filter(item => {
              const firstMdxFile = item?.object?.text
                ? item
                : item?.object?.entries?.find(any => any.name.endsWith('.mdx'))

              if (!firstMdxFile) return false
              // break out this regex
              const tag = firstMdxFile?.object?.text
                ?.match(/tag: (.*)/)?.[1]
                ?.toUpperCase()

              return tag === userProvidedTag.toUpperCase()
            })

          let retArray = await Promise.all(
            listItemsWithTag.map(async listItem => {
              const dataToPass = getGithubGqlObjForMdx(listItem)
              const data = await queuedCompileMdxGql(
                dataToPass.name,
                dataToPass?.files,
              )
              return {
                ...data,
                slug: dataToPass.name,
              }
            }),
          )

          return retArray as Array<MdxPageAndSlug>
        }),
      )

      const blogList = retObject[0] ?? []
      const tilList = retObject[1] ?? []

      return {
        blogList,
        tilList,
        retObject,
      }
    },
    reporter: verboseReporter(),
    ...cachifiedOptions,
  })
}

function mapFromMdxPageToMdxListItem(
  page: MdxPage,
): Omit<MdxPageAndSlug, 'code'> {
  const {code, ...mdxListItem} = page
  return mdxListItem
}

function useMdxComponent(code: string) {
  return React.useMemo(() => getMdxComponent(code), [code])
}

export {
  getMdxPageGql,
  getMdxTilListGql,
  getMdxBlogListGraphql,
  useMdxComponent,
  getMdxComponent,
  getMdxTagListGql,
  getMdxIndividualTagGql,
  mdxComponents,
  delMdxPageGql,
}

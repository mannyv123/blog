import {SmallAsterisk, TextLink} from './typography'

export const HeroImage = ({
  alt,
  src,
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <>
      <img alt={alt} src={src} />
      <SmallAsterisk>
        Image by{' '}
        <TextLink
          small
          href="https://pixabay.com/users/comfreak-51581/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=356024"
        >
          Comfreak
        </TextLink>{' '}
        from{' '}
        <TextLink
          small
          href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=356024"
        >
          Pixabay
        </TextLink>
      </SmallAsterisk>
    </>
  )
}
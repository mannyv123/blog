import React from "react"
import tw from "tailwind.macro"
import styled from "styled-components"
import { customMedia } from "../../utils/styling"

const MobileNavContainer = styled.div`
  ${tw`hidden`};
  ${customMedia.lessThan("md")`
    ${tw`block`};
  `}
`

const HamburgerButton = styled.button`
  ${tw`z-30 top-0 relative bg-transparent border-none border-0 cursor-pointer px-4 py-4 text-text`};
  border-style: none;
  border-radius: 4px;
`

const HamburgerLines = styled.div`
  ${tw`absolute`};
  left: 3px;
  ${props => (props.isOpen ? tw`bg-transparent` : tw`bg-accent`)};
  width: 24px;
  height: 2px;
  transition: background 300ms cubic-bezier(0.86, 0, 0.07, 1) 0s;

  &::before {
    ${tw`absolute left-0 bg-accent`};
    content: "";
    top: ${props => (props.isOpen ? "0px" : "-8px")};
    width: 24px;
    height: 2px;
    transform: ${props => (props.isOpen ? "rotate(-45deg)" : "rotate(0deg)")};
    transition: transform 300ms cubic-bezier(0.86, 0, 0.07, 1) 0s;
  }

  &::after {
    ${tw`absolute left-0 bg-accent`};
    top: 8px;
    content: "";
    width: 24px;
    height: 2px;
    transform: ${props => (props.isOpen ? "rotate(45deg)" : "rotate(0deg)")};
    transition: transform 300ms cubic-bezier(0.86, 0, 0.07, 1) 0s;
    top: ${props => (props.isOpen ? "0px" : "")};
  }
`

function MobileNav(props) {
  const { isOpen, updateMenu } = props
  return (
    <MobileNavContainer>
      <HamburgerButton onClick={() => updateMenu(!isOpen)} isOpen={isOpen}>
        <HamburgerLines isOpen={isOpen} />
      </HamburgerButton>
    </MobileNavContainer>
  )
}

export default MobileNav

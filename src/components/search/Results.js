import React from "react"
import styled from "styled-components"
import ResultCard from "./ResultCard"
import { customMedia } from "../../utils/styling"

const SList = styled.ul`
  list-style-type: none;
  position: absolute;
  padding: 0;
  opacity: 0;
  background-color: ${props => props.theme.colors.body};
  width: 500px;
  transform: translatex(-100%);
  left: 100%;
  overflow: auto;
  max-width: 98vw;
  max-height: 500px;

  ${customMedia.lessThan("md")`
    left: -25%;
    transform: translateX(-33%);
  `}
`

function Results({
  results,
  highlightIndex,
  highlightIndexSet,
  showResults,
  fromKeyboard,
  setFromKeyboard,
}) {
  if (results.length === 0 || !showResults) return null

  return (
    <SList>
      {results.map((page, index) => (
        <ResultCard
          key={page.title}
          highlighted={index === highlightIndex}
          onMouseOver={() => {
            highlightIndexSet(index)
            setFromKeyboard(false)
          }}
          onMouseLeave={() => {
            highlightIndexSet(-1)
            setFromKeyboard(false)
          }}
          fromKeyboard={fromKeyboard}
          {...page}
        />
      ))}
    </SList>
  )
}

export default Results

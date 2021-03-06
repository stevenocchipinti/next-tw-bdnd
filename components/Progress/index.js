import tw, { styled } from "twin.macro"
import { CircularProgressbar } from "react-circular-progressbar"
import { observer } from "mobx-react-lite"
import "react-circular-progressbar/dist/styles.css"

import tailwind from "../../lib/tailwind"

const Tick = props => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.86581 34.0433C13.1544 38.0796 20.1127 45.1851 23.0558 48.2333L55.2199 16.0693"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const green = tailwind.theme.colors.green[500]
const blue = tailwind.theme.colors.blue[400]
const gray = tailwind.theme.colors.gray[200]
const darkGray = tailwind.theme.colors.gray[900]

const colorForPercentage = percentage => {
  if (percentage === 1) return green
  if (percentage === 0) return gray
  return blue
}

const Container = styled.div`
  ${tw`relative`}
  ${({ onClick }) => onClick && tw`cursor-pointer`}
`

const StyledCircularProgressbar = styled(CircularProgressbar)`
  ${({ loading }) => loading && tw`animate-pulse`}
`

const Progress = observer(
  ({ node, variant = "progress", loading, onClick, ...props }) => {
    const percentage = node?.progress || 0
    const fg = colorForPercentage(percentage)
    const numOfChildren = node?.children.length || 0
    const numOfDoneChildren =
      node?.children.filter(child => child.progress == 1).length || 0

    const textVariations = {
      progress: `${numOfDoneChildren}/${numOfChildren}`,
      checkbox: "",
      meter: `${Math.round(percentage * 100)}%`,
    }

    const styleVariations = {
      progress: {
        text: { fontSize: "28px", fill: fg },
        path: { stroke: fg },
        trail: { stroke: gray },
      },
      checkbox: {
        text: { fontSize: "28px", fill: fg },
        path: { stroke: fg },
        trail: { stroke: gray },
      },
      meter: {
        text: { fill: "currentColor" },
        path: {
          transform: "rotate(-117deg)",
          transformOrigin: "center center",
          stroke: fg,
        },
        trail: {
          transform: "rotate(-117deg)",
          transformOrigin: "center center",
          stroke: darkGray,
        },
      },
    }

    const text = node ? textVariations[variant] : ""
    const buttonProps = onClick ? { role: "button", onClick } : {}

    return (
      <Container {...buttonProps}>
        <StyledCircularProgressbar
          circleRatio={variant === "meter" ? 0.65 : 1}
          value={percentage}
          text={text}
          maxValue={1}
          strokeWidth={9}
          styles={styleVariations[variant]}
          loading={loading}
          {...props}
        />
        {variant === "checkbox" && percentage === 1 && (
          <Tick tw="h-6 w-6 absolute inset-0 m-auto text-green-500" />
        )}
      </Container>
    )
  }
)

export default Progress

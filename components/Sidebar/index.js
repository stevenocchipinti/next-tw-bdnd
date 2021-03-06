import tw, { styled } from "twin.macro"
import { observer } from "mobx-react-lite"
import Link from "next/link"

import Logo from "../Logo"
import Progress from "../Progress"

const StyledLink = styled.a`
  ${tw`flex items-start w-full pt-3 px-4`}
  ${tw`opacity-70 hover:opacity-100`}
  ${tw`transition duration-300`}
`

const LogoLink = ({ children, ...props }) => (
  <Link passHref {...props}>
    <StyledLink>{children}</StyledLink>
  </Link>
)

const Title = tw.h1`flex-grow mt-4 ml-4 text-3xl`

const Nav = styled.nav`
  ${tw`flex flex-col items-center flex-shrink-0 mr-3 shadow`}
  ${tw`bg-gray-800 text-gray-200`}
  width: min(22rem, 100vw);
  scroll-snap-align: center;
`

const Sidebar = observer(({ project }) => (
  <Nav>
    <LogoLink href="/">
      <Logo tw="flex-shrink-0" />
      <Title>Taskematic</Title>
    </LogoLink>

    <Progress
      tw="h-48 w-48 m-12 flex-none"
      node={project?.root}
      variant="meter"
      loading={!project?.ready}
    />
  </Nav>
))

export default Sidebar

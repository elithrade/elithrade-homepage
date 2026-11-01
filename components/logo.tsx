import Link from 'next/link'
import Image from 'next/image'
import { Text, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'

const LogoBox = styled.span`
  font-weight: bold;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  height: 30px;
  line-height: 20px;
  padding: 10px;

  &:hover img {
    transform: rotate(20deg);
  }
`

const Logo = () => {
  const footPrintImg = `/images/footprint${useColorModeValue('', '-dark')}.png`
  return (
    <Link href="/">
      <LogoBox>
        <Image src={footPrintImg} width={20} height={20} alt="logo" />
        <Text
          color="chakra-body-text"
          fontFamily="logo"
          fontWeight="bold"
          ml={3}
        >
          Bin Hu
        </Text>
      </LogoBox>
    </Link>
  )
}

export default Logo

import { Link, LinkProps } from "react-router-dom";



interface StyledLinkProps extends LinkProps {
}
export default function StyledLink(props: StyledLinkProps) {
    return (
        <Link className='styled-link' {...props} />
    )
}
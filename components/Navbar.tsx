import Image from "next/image"
import Link from "next/link"

const Navbar = () => {
  return (
    <header>
        <nav>
            <Link href="/" className="logo">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>

                <p>DevEvents</p>
            </Link>

            <ul className="list-none">
                <Link href="/"><li>Home</li></Link>
                <Link href="/"><li>Events</li></Link>
                <Link href="/"><li>Create Event</li></Link>
            </ul>
        </nav>
    </header>
  )
}

export default Navbar
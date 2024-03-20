import Link from 'next/link'
import styles from './style.module.scss'

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/">imagize</Link>
      <nav>
        <ul className={styles.ul}>
          <li>
            <Link href="/features">features</Link>
          </li>
          <li>
            <Link href="/pricing">pricing</Link>
          </li>
          <li>
            <Link href="/docs">docs</Link>
          </li>
          <li>
            <Link href="/login">login</Link>
          </li>
          <li>
            <Link href="/sign-up" className={styles.signup}>sign up</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
import Link from 'next/link'
import styles from './style.module.scss'

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link href="/">imagize</Link>
      <nav>
        <ul className={styles.ul}>
          <li>
            <Link href="/features" className={styles.link}>features</Link>
          </li>
          <li>
            <Link href="/pricing" className={styles.link}>pricing</Link>
          </li>
          <li>
            <Link href="/about" className={styles.link}>about</Link>
          </li>
          <li>
            <Link href="/login" className={styles.link}>login</Link>
          </li>
          <li>
            <Link href="/sign-up" className={styles.signup}>sign up</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
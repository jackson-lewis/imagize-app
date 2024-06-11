'use client'

import { Account } from '@/lib/types'
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'
import styles from './style.module.scss'
import { updateAccountFormAction } from '@/lib/server-actions'
import { emailAvailability } from '@/lib/helpers'
import { useFormState } from 'react-dom'


function Field({
  name,
  label,
  value,
  setter,
  validationMessage,
  ...rest
}: {
  name: string,
  label: string,
  value: string,
  setter: Dispatch<SetStateAction<string>>,
  validationMessage?: string
  [x: string]: any
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>
      <input
        type="text"
        name={name}
        id={name}
        value={value} 
        onChange={(event) => setter(event.target.value)}
        {...rest}
      />
      {validationMessage && (
        <span>{validationMessage}</span>
      )}
    </div>
  )
}


export default function SettingsForm({
  account
}: { 
  account: Account
}) {
  const [name, setName] = useState(account.name)
  const [email, setEmail] = useState(account.email)
  const [emailError, setEmailError] = useState('')
  const [allowUpdate, setAllowUpdate] = useState(true)
  const updateAccountWithData = updateAccountFormAction.bind(null, account)

  const [state, formAction] = useFormState(updateAccountWithData, { success: false })

  async function checkEmailAvailability(event: ChangeEvent<HTMLInputElement>) {
    const emailAvailable = await emailAvailability(event.target.value)
      
    setEmailError(emailAvailable ? '' : 'Email address is already used.')
    setAllowUpdate(emailAvailable)
  }

  return (
    <form className={styles.form} action={formAction}>
      <Field
        name="name"
        label="Name"
        value={name}
        setter={setName}
      />
      <Field
        name="email"
        label="Email"
        value={email}
        setter={setEmail}
        onBlur={checkEmailAvailability}
        validationMessage={emailError}
      />
      <button disabled={!allowUpdate}>Update</button>
      {state.success && (
        <p>Account updated successfully.</p>
      )}
    </form>
  )
}

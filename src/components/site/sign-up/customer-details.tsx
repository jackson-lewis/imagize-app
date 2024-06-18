'use client'

import { Dispatch, RefObject, SetStateAction, useState } from 'react'
import styles from './style.module.scss'
import { emailAvailability } from '@/lib/helpers'
import { SignUpFormSteps } from '.'


export default function CustomerDetails({
  formRef,
  setStripeCustomerId,
  step,
  setStep
}: {
  formRef: RefObject<HTMLFormElement>
  setStripeCustomerId: Dispatch<SetStateAction<string>>
  step: SignUpFormSteps
  setStep: Dispatch<SetStateAction<SignUpFormSteps>>
}) {
  const [password1, setPassword1] = useState<string>('')
  const [password2, setPassword2] = useState<string>('')
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  })

  function validatePassword(event: React.ChangeEvent<HTMLInputElement>) {
    const password = (event.target as HTMLInputElement).value
    setPassword1(password)

    const validations = {
      length: false,
      uppercase: false,
      number: false,
      special: false
    }

    // length
    if (password.length > 8) {
      validations.length = true
    }

    // uppercase
    if (/[A-Z]+/.test(password)) {
      validations.uppercase = true
    }

    // number
    if (/[0-9]+/.test(password)) {
      validations.number = true
    }

    // special
    if (/[!@£#$%^&*\(\)\.,\?]+/.test(password)) {
      validations.special = true
    }

    setPasswordValidations(validations)
  }

  function validatePasswordMatch(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword2((event.target as HTMLInputElement).value)
  }

  async function customerDetails(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    const form = formRef.current as HTMLFormElement | null

    if (!form) {
      return
    }

    const emailAvailable = await emailAvailability(form.email.value)

    if (!emailAvailable) {
      alert('Email address is already used.')
      return
    }
    
    if (validateStep('details')) {
      const data = new FormData(form)

      await fetch('/api/~/stripe/customer', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${data.get('first_name')} ${data.get('last_name')}`.trim(),
          email: data.get('email')
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setStripeCustomerId(data.customerId)
        })

      setStep('choose_plan')
    }
  }

  function validateStep(step: SignUpFormSteps) {
    const form = formRef.current

    if (!form) {
      return false
    }

    const fieldset: HTMLFieldSetElement = form[step]
    const invalidFields = Array.from(fieldset.querySelectorAll('input')).filter(input => {
      return !input.checkValidity()
    })
    let valid = invalidFields.length === 0

    if (step === 'details') {
      const failedValidations = Object.values(passwordValidations).filter(validation => {
        return !validation
      })

      if (failedValidations.length > 0) {
        valid = false
      }

      if (password1 !== password2) {
        valid = false
      }
    }

    if (!valid) {
      alert('Check your information and try again')
    }

    return valid
  }

  return (
    <fieldset
      name="details"
      disabled={step !== 'details'}
      className={styles.fieldset}
    >
      <input type="text" name="first_name" placeholder="First Name" required />
      <input type="text" name="last_name" placeholder="Last Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="tel" name="phone" placeholder="Phone" />
      <input type="text" name="company" placeholder="Company" />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        value={password1}
        onChange={validatePassword}
      />
      <div className={styles['password-validations']}>
        <span>length: {passwordValidations.length ? 'pass' : 'fail'}</span>
        <span>uppercase: {passwordValidations.uppercase ? 'pass' : 'fail'}</span>
        <span>number: {passwordValidations.number ? 'pass' : 'fail'}</span>
        <span>special: {passwordValidations.special ? 'pass' : 'fail'}</span>
      </div>
      <input
        type="password" 
        name="password2"
        placeholder="Confirm password"
        required
        value={password2}
        onChange={validatePasswordMatch}
      />
      <span>password match: {password1 === password2 ? 'pass' : 'fail'}</span>
      <button type="button" onClick={customerDetails}>Select plan</button>
    </fieldset>
  )
}
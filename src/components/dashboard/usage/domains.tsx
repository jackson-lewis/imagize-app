'use client'

import { addDomainAction, removeDomainAction } from '@/lib/server-actions'
import { Account } from '@/lib/types'
import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'

export type AddDomainFormState = {
  success: boolean
  domain: string
}

const initialState: AddDomainFormState = {
  success: false,
  domain: ''
}

export default function Domains({
  account
}: {
  account: Account
}) {
  const [liveAccount, setLiveAccount] = useState({ ...account })
  const addDomainActionWithAccount = addDomainAction.bind(null, liveAccount)
  const [formDisabled, setFormDisabled] = useState(true)
  const [formError, setFormError] = useState('')
  const [state, formAction]: [
    AddDomainFormState,
    (data: FormData) => void
  ] = useFormState(addDomainActionWithAccount, initialState)

  useEffect(() => {
    if (state.success) {
      setLiveAccount(al => {
        return {
          ...al,
          domains: [
            ...al.domains || [],
            state.domain
          ]
        }
      })
    }
  }, [state])

  return (
    <div>
      <h2>Domains</h2>
      <p>This is the list of domains authorized on your account</p>
      {liveAccount.domains ? (
        <ul>
          {liveAccount.domains.map(domain => (
            <li key={domain}>
              {domain}
              <button
                onClick={async () => {
                  const success = await removeDomainAction(domain, liveAccount)

                  if (success) {
                    setLiveAccount(al => {
                      return {
                        ...al,
                        domains: (al.domains || []).filter(_domain => {
                          return _domain !== domain
                        })
                      }
                    })
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form action={formAction}>
        <label htmlFor="">Add a domain</label>
        <input
          type="text"
          name="domain"
          onChange={(event) => {
            if ((liveAccount.domains || [])?.indexOf(event.target.value) >= 0) {
              setFormError('This domain already exists in your account.')
              setFormDisabled(true)
            } else {
              setFormError('')
              setFormDisabled(false)
            }
          }}
        />
        {formError && (
          <p>{formError}</p>
        )}
        <button disabled={formDisabled}>Add</button>
        {state.success && (
          <p>Domain successfully added.</p>
        )}
      </form>
    </div>
  )
}
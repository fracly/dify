'use client'
import React, { useEffect, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import Toast from '../components/base/toast'
import { IS_CE_EDITION, SUPPORT_MAIL_LOGIN, apiPrefix } from '@/config'
import Button from '@/app/components/base/button'
import { login, oauth } from '@/service/common'
import Checkbox from "@/app/components/base/checkbox"
import { User01 } from '@/app/components/base/icons/src/vender/line/users'
import { Lock01 } from "@/app/components/base/icons/src/vender/line/security"
import { Eye, EyeClose } from "@/app/components/base/icons/src/vender/line/general"

const validEmailReg = /^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$/

type IState = {
  formValid: boolean
  github: boolean
  google: boolean
}

type IAction = {
  type: 'login' | 'login_failed' | 'github_login' | 'github_login_failed' | 'google_login' | 'google_login_failed'
}

function reducer(state: IState, action: IAction) {
  switch (action.type) {
    case 'login':
      return {
        ...state,
        formValid: true,
      }
    case 'login_failed':
      return {
        ...state,
        formValid: true,
      }
    case 'github_login':
      return {
        ...state,
        github: true,
      }
    case 'github_login_failed':
      return {
        ...state,
        github: false,
      }
    case 'google_login':
      return {
        ...state,
        google: true,
      }
    case 'google_login_failed':
      return {
        ...state,
        google: false,
      }
    default:
      throw new Error('Unknown action.')
  }
}

const NormalForm = () => {
  const { t } = useTranslation()
  const useEmailLogin = IS_CE_EDITION || SUPPORT_MAIL_LOGIN

  const router = useRouter()

  const [state, dispatch] = useReducer(reducer, {
    formValid: false,
    github: false,
    google: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isRemember, setIsRemember] = useState(false)

  const handleEmailPasswordLogin = async () => {
    if (!validEmailReg.test(email)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.emailInValid'),
      })
      return
    }
    try {
      setIsLoading(true)
      const res = await login({
        url: '/login',
        body: {
          email,
          password,
          remember_me: true,
        },
      })
      if (res.result === 'success') {
        localStorage.setItem('console_token', res.data)
        router.replace('/apps')
      }
      else {
        Toast.notify({
          type: 'error',
          message: res.data,
        })
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  function handleRememberChecked (){}
  const { data: github, error: github_error } = useSWR(state.github
    ? ({
      url: '/oauth/login/github',
      // params: {
      //   provider: 'github',
      // },
    })
    : null, oauth)

  const { data: google, error: google_error } = useSWR(state.google
    ? ({
      url: '/oauth/login/google',
      // params: {
      //   provider: 'google',
      // },
    })
    : null, oauth)

  useEffect(() => {
    if (github_error !== undefined)
      dispatch({ type: 'github_login_failed' })
    if (github)
      window.location.href = github.redirect_url
  }, [github, github_error])

  useEffect(() => {
    if (google_error !== undefined)
      dispatch({ type: 'google_login_failed' })
    if (google)
      window.location.href = google.redirect_url
  }, [google, google_error])

  // @ts-ignore
  return (
    <>
      <div className="w-full">
        <div className="bg-white items-center rounded-xl shadow-lg">
          {
            useEmailLogin && <>
              <h1 className="font-bold text-xl p-6 text-center">欢迎登录</h1>
              <form onSubmit={() => { }}>
                <div className='mb-5'>
                  <div className="relative mt-1 mx-4">
                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder={t('login.account') || ''}
                      className={'appearance-none block w-full rounded-sm pl-[32px] px-3 py-2 border border-gray-200 hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 caret-primary-600 sm:text-sm pl-10'}
                    />
                    <div className="absolute inset-y-0 left-2 flex items-center pr-3">
                      <User01 className='h-4 w-4 text-gray-700' />
                    </div>
                  </div>
                </div>
                <div className='mb-4'>
                  <div className="relative mt-1 mx-4">
                    <input
                      id="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter')
                          handleEmailPasswordLogin()
                      }}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={t('login.password') || ''}
                      className={'appearance-none block w-full rounded-sm pl-[32px] px-3 py-2 border border-gray-200 hover:border-gray-300 hover:shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 caret-primary-600 sm:text-sm pr-10'}
                    />
                    <div className="absolute inset-y-0 left-2 flex items-center pr-3">
                      <Lock01 className='h-4 w-4 text-gray-700' />
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 hover:cursor-pointer">
                        {showPassword ? <Eye className='h-4 w-4 text-gray-700' /> :
                          <EyeClose className='h-4 w-4 text-gray-700' /> }
                      </div>
                    </div>
                  </div>
                </div>
                <div className='mb-2'>
                  <div className="relative mt-1 mx-4 w-full">
                    <Checkbox
                      className='mt-2 hover:border-primary-500 hover:shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                      checked={isRemember}
                      onCheck={handleRememberChecked}
                    />
                    <label className='absolute text-xs top-0 left-5'>{t('login.rememberMe')}</label>
                    <Link
                      className='absolute text-primary-600 text-xs right-8 top-0'
                      href='/install'
                    >{t('login.setAdminAccount')}</Link>
                  </div>
                </div>
                <div className='mb-2'>
                  <div className="relative mt-4 mx-4">
                    <Button
                      tabIndex={0}
                      onClick={handleEmailPasswordLogin}
                      disabled={isLoading}
                      className="w-full bg-[#017BFF] !fone-medium !text-sm text-white"
                    >{t('login.signBtn')}</Button>
                  </div>
                </div>
              </form>
            </>
          }
          {/*  agree to our Terms and Privacy Policy. */}
          <div className="w-hull text-center block mt-4 pb-6 text-xs text-gray-600">
            {t('login.tosDesc')}
            &nbsp;
            <Link
              className='text-primary-600'
              target='_blank' rel='noopener noreferrer'
              href='https://dify.ai/terms'
            >{t('login.tos')}</Link>
          </div>

          {IS_CE_EDITION && <div className="w-hull text-center block mt-2 text-xs text-gray-600">

          </div>}

        </div>
      </div>
    </>
  )
}

export default NormalForm

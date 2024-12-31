import { FC } from 'react'
import Link from 'next/link'

interface ErrorMessageProps {
  title: string
  message: string
  showBackLink?: boolean
  backLink?: string
  backText?: string
}

export const ErrorMessage: FC<ErrorMessageProps> = ({
  title,
  message,
  showBackLink = true,
  backLink = '/dashboard',
  backText = '返回首頁'
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          {showBackLink && (
            <div className="mt-8">
              <Link
                href={backLink}
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                {backText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
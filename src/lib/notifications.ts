import { toast } from '../hooks/use-toast'

export interface NotificationOptions {
  title: string
  description?: string
  duration?: number
}

/**
 * Show a success notification
 */
export const showSuccessNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    className: 'bg-green-50 border-green-200 text-green-900',
  })
}

/**
 * Show an error/destructive notification
 */
export const showErrorNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'destructive',
    className: 'bg-red-50 border-red-200 text-red-900',
  })
}

/**
 * Show a warning notification
 */
export const showWarningNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  })
}

/**
 * Show an info notification
 */
export const showInfoNotification = (options: NotificationOptions) => {
  toast({
    title: options.title,
    description: options.description,
    variant: 'default',
    className: 'bg-blue-50 border-blue-200 text-blue-900',
  })
}

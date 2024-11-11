import * as React from 'react'
import { cn } from '@/lib/utils'

interface SiteLogoProps extends React.SVGProps<SVGSVGElement> {}

const SiteLogo = ({
  xmlns = 'http://www.w3.org/2000/svg',
  width = '1024',
  height = '1024',
  viewBox = '0 0 1024 1024',
  className,
  ...props
}: SiteLogoProps) => {
  return (
    <svg
      xmlns={xmlns}
      width={width}
      height={height}
      viewBox={viewBox}
      className={cn('size-8 min-w-8', className)}
      {...props}
    >
      <path
        fill="#66B814"
        d="M512 4.098C231.95 4.098 4.098 231.949 4.098 512c0 280.05 227.851 507.902 507.902 507.902 280.055 0 507.902-227.851 507.902-507.902C1019.902 231.95 792.055 4.098 512 4.098zm0 0"
      />
      <defs> 
        <pattern id="hexagon-pattern" width="10" height="8.66" patternUnits="userSpaceOnUse">
          <polygon points="5,0 10,4.33 5,8.66 0,8.66 0,4.33 5,0" fill="lightgreen" stroke="white" stroke-width="0.5" />
        </pattern>
      </defs>

    </svg>
  )
}

export { SiteLogo, type SiteLogoProps }

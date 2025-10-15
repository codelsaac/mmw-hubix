import {
  ExternalLink,
  Github,
  Twitter,
  Globe,
  type LucideProps,
} from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"

export const Icons = {
  logo: ({ className, ...props }: LucideProps) => {
    const { fill, ...imageProps } = props as any
    return (
      <div className={cn("relative", className)}>
        <Image
          src="/icon2.png"
          alt="logo"
          fill={true}
          style={{ objectFit: "contain" }}
          {...imageProps}
        />
      </div>
    )
  },
  externalLink: (props: LucideProps) => <ExternalLink {...props} />,
  gitHub: (props: LucideProps) => <Github {...props} />,
  twitter: (props: LucideProps) => <Twitter {...props} />,
  globe: (props: LucideProps) => <Globe {...props} />,
}

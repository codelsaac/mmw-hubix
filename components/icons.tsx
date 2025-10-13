import { 
  ExternalLink, 
  Github, 
  Twitter, 
  Globe,
  type LucideProps 
} from "lucide-react"
import Image from "next/image"

export const Icons = {
  logo: (props: LucideProps) => (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image 
        src="/icon2.png" 
        alt="logo" 
        fill
        style={{ objectFit: 'contain' }}
        {...props} 
      />
    </div>
  ),
  externalLink: (props: LucideProps) => <ExternalLink {...props} />,
  gitHub: (props: LucideProps) => <Github {...props} />,
  twitter: (props: LucideProps) => <Twitter {...props} />,
  globe: (props: LucideProps) => <Globe {...props} />,
}

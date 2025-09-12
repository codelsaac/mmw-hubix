import { 
  GraduationCap, 
  ExternalLink, 
  Github, 
  Twitter, 
  Globe,
  type LucideProps 
} from "lucide-react"

export const Icons = {
  logo: (props: LucideProps) => <GraduationCap {...props} />,
  externalLink: (props: LucideProps) => <ExternalLink {...props} />,
  gitHub: (props: LucideProps) => <Github {...props} />,
  twitter: (props: LucideProps) => <Twitter {...props} />,
  globe: (props: LucideProps) => <Globe {...props} />,
}

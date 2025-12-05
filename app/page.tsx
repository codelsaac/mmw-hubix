import { ResourceHubServer } from "@/components/resource-hub-server"
import { HomePageClient } from "@/components/home-page-client"

export default function HomePage() {
  return (
    <HomePageClient>
      <ResourceHubServer />
    </HomePageClient>
  )
}

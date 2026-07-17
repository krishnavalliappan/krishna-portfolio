import { createFileRoute } from "@tanstack/react-router"

import { Portfolio } from "@/features/portfolio/portfolio"

export const Route = createFileRoute("/")({ component: Portfolio })

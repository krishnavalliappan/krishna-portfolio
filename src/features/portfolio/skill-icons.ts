import {
  Braces,
  Database,
  FileSearch,
  Rss,
  SquareFunction,
  Workflow,
} from "lucide-react"
import type { ComponentType } from "react"
import { FaAws } from "react-icons/fa"
import { RiOpenaiFill } from "react-icons/ri"
import { TbApi } from "react-icons/tb"
import {
  SiDocker,
  SiExpress,
  SiFastapi,
  SiGit,
  SiGithubactions,
  SiHtml5,
  SiJavascript,
  SiLeaflet,
  SiMysql,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPinia,
  SiPostgresql,
  SiPrisma,
  SiPydantic,
  SiPython,
  SiReact,
  SiSqlalchemy,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si"

type SkillIcon = ComponentType<{
  className?: string
  "aria-hidden"?: boolean | "true" | "false"
}>

export const skillIcons: Partial<Record<string, SkillIcon>> = {
  Python: SiPython,
  TypeScript: SiTypescript,
  JavaScript: SiJavascript,
  SQL: Database,
  FastAPI: SiFastapi,
  "Express.js": SiExpress,
  "Node.js": SiNodedotjs,
  "REST APIs": TbApi,
  "Server-Sent Events": Rss,
  Pydantic: SiPydantic,
  Prisma: SiPrisma,
  SQLAlchemy: SiSqlalchemy,
  "Vue 3": SiVuedotjs,
  React: SiReact,
  "Next.js": SiNextdotjs,
  Pinia: SiPinia,
  "Tailwind CSS": SiTailwindcss,
  Leaflet: SiLeaflet,
  "HTML5 Canvas": SiHtml5,
  "OpenAI APIs": RiOpenaiFill,
  "LLM workflow orchestration": Workflow,
  "Function calling": SquareFunction,
  "Structured outputs": Braces,
  RAG: FileSearch,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  SQLite: SiSqlite,
  Docker: SiDocker,
  AWS: FaAws,
  "CI/CD": SiGithubactions,
  Nginx: SiNginx,
  Git: SiGit,
}

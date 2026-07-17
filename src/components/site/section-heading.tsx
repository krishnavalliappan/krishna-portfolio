export function SectionHeading({
  index,
  label,
  title,
}: {
  index: string
  label: string
  title: string
}) {
  return (
    <div className="mb-12">
      <p className="eyebrow">
        <span className="mr-3 text-primary">{index}</span>
        {label}
      </p>
      <h2 className="mt-4 text-3xl leading-[1.05] font-medium tracking-[-0.04em] text-balance sm:text-5xl">
        {title}
      </h2>
    </div>
  )
}

import type { Artwork, Category } from "@/data/catalog";

type Props = {
  details: NonNullable<Artwork["wixDetails"]>;
  categories: Category[];
};

export function WixArtworkDetails({ details, categories }: Props) {
  const attributes = [
    { label: "Collection", value: categories.map((category) => category.name).join(", ") },
    { label: "Brand", value: details.brand },
    { label: "Item number", value: details.sku },
    { label: "Dimensions", value: details.dimensions },
    { label: "Availability", value: details.stockLabel },
  ].filter(({ value }) => value);

  return (
    <>
      {attributes.length > 0 && (
        <dl className="mt-5 divide-y divide-border border-y border-border text-sm leading-5 md:mt-6">
          {attributes.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-[minmax(4.5rem,1fr)_minmax(0,2fr)] gap-3 py-2 md:py-2.5">
              <dt className="text-xs leading-5 text-muted-foreground md:text-sm">{label}</dt>
              <dd className="[overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {details.sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className="mt-5 [overflow-wrap:anywhere] md:mt-6">
          <h2 className="eyebrow">{section.title}</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground md:leading-7">{section.text}</p>
        </section>
      ))}
      {details.options.length > 0 && (
        <section className="mt-5 [overflow-wrap:anywhere] md:mt-6">
          <h2 className="eyebrow">Options</h2>
          <dl className="mt-2 space-y-2 text-sm">
            {details.options.map((option) => (
              <div key={option.name}>
                <dt>{option.name}</dt>
                <dd className="text-muted-foreground">{option.choices.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {details.customizationLabels.length > 0 && (
        <section className="mt-5 [overflow-wrap:anywhere] md:mt-6">
          <h2 className="eyebrow">Personalization</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {details.customizationLabels.map((label) => <li key={label}>{label}</li>)}
          </ul>
        </section>
      )}
    </>
  );
}

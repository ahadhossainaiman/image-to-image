import type { Artwork, Category } from "@/data/catalog";
import { ArtworkCopy } from "@/components/ArtworkCopy";

type Props = {
  details: NonNullable<Artwork["wixDetails"]>;
  categories: Category[];
};

type Attribute = { label: string; value: string | number | undefined };

function DetailRows({ attributes }: { attributes: Attribute[] }) {
  const populated = attributes.filter(({ value }) => value != null && value !== "");
  if (populated.length === 0) return null;
  return (
    <dl className="divide-y divide-border text-sm leading-5">
      {populated.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[minmax(6.5rem,1fr)_minmax(0,2fr)] gap-3 px-3 py-2.5 sm:px-4">
          <dt className="text-xs leading-5 text-muted-foreground md:text-sm">{label}</dt>
          <dd className="[overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WixArtworkDetails({ details, categories }: Props) {
  const attributes: Attribute[] = [
    { label: "Collection", value: categories.map((category) => category.name).join(", ") },
    { label: "Brand", value: details.brand },
    { label: "Item number", value: details.sku },
    { label: "Product type", value: details.productType },
    { label: "Dimensions", value: details.dimensions },
    { label: "Package dimensions", value: details.packageDimensions },
    { label: "Weight", value: details.weight },
    { label: "Net quantity", value: details.unitQuantity },
    { label: "Availability", value: details.stockLabel },
    { label: "Quantity in stock", value: details.stockQuantity },
  ];
  const hasAttributes = attributes.some(({ value }) => value != null && value !== "");

  return (
    <>
      {hasAttributes && (
        <section className="mt-6">
          <h2 className="text-2xl">Product details</h2>
          <div className="mt-2 border border-border bg-background/35"><DetailRows attributes={attributes} /></div>
        </section>
      )}
      {details.sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className="mt-5 [overflow-wrap:anywhere] md:mt-6">
          <h2 className="eyebrow">{section.title}</h2>
          <ArtworkCopy text={section.text} html={section.html} />
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
      {details.variants.length > 0 && (
        <section className="mt-5 [overflow-wrap:anywhere] md:mt-6">
          <h2 className="eyebrow">Variants</h2>
          <ul className="mt-2 space-y-3 text-sm">
            {details.variants.map((variant) => (
              <li key={variant.name} className="border border-border p-3">
                <h3 className="font-medium">{variant.name}</h3>
                <div className="mt-2"><DetailRows attributes={[
                  { label: "Price", value: variant.price },
                  { label: "Regular price", value: variant.regularPrice },
                  { label: "Unit price", value: variant.unitPrice },
                  { label: "Item number", value: variant.sku },
                  { label: "Dimensions", value: variant.dimensions },
                  { label: "Package dimensions", value: variant.packageDimensions },
                  { label: "Weight", value: variant.weight },
                  { label: "Availability", value: variant.stockLabel },
                  { label: "Quantity in stock", value: variant.stockQuantity },
                ]} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}
      {details.customizations.length > 0 && (
        <section className="mt-5 [overflow-wrap:anywhere] md:mt-6">
          <h2 className="eyebrow">Personalization</h2>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {details.customizations.map(({ title, mandatory, maxLength }) => (
              <li key={title}>
                <span>{title}</span>
                {mandatory && <span> · Required</span>}
                {maxLength != null && maxLength > 0 && <span> · Up to {maxLength} characters</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

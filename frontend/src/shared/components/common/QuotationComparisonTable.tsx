"use client";

export type QuotationOffer = {
  supplierName: string;
  price: number;
  deliveryDays: number;
  freight: number;
  validityDays: number;
  paymentCondition: string;
};

type QuotationComparisonTableProps = {
  offers: QuotationOffer[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function QuotationComparisonTable({ offers }: QuotationComparisonTableProps) {
  if (offers.length === 0) {
    return <p>Nenhuma proposta cadastrada.</p>;
  }

  const best = offers.reduce((acc, current) => (current.price < acc.price ? current : acc), offers[0]);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fornecedor</th>
            <th>Preco</th>
            <th>Prazo (dias)</th>
            <th>Frete</th>
            <th>Validade (dias)</th>
            <th>Condicao</th>
            <th>Melhor</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, index) => {
            const isBest = offer.supplierName === best.supplierName && offer.price === best.price;
            return (
              <tr key={`${offer.supplierName}-${index}`}>
                <td>{offer.supplierName}</td>
                <td>{formatCurrency(offer.price)}</td>
                <td>{offer.deliveryDays}</td>
                <td>{formatCurrency(offer.freight)}</td>
                <td>{offer.validityDays}</td>
                <td>{offer.paymentCondition}</td>
                <td>{isBest ? <span className="badge badge-green">Melhor proposta</span> : <span className="badge">-</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
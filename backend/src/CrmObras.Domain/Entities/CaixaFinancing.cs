using CrmObras.Domain.Common;

namespace CrmObras.Domain.Entities;

public class CaixaFinancing : BaseEntity
{
    public Guid WorkProjectId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public decimal ApprovedAmount { get; set; }
    public int Installments { get; set; }
}

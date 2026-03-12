namespace CrmObras.Application.Features.Costs.Queries.GetProjectCostSummary;

public static class GetProjectCostSummaryQueryValidator
{
    public static void Validate(GetProjectCostSummaryQuery query)
    {
        if (query.WorkProjectId == Guid.Empty)
            throw new InvalidOperationException("Obra inválida para consolidação de custos.");
    }
}

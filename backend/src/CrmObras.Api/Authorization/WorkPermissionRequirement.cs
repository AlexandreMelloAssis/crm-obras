using Microsoft.AspNetCore.Authorization;

namespace CrmObras.Api.Authorization;

public class WorkPermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public WorkPermissionRequirement(string permission)
    {
        Permission = permission;
    }
}
